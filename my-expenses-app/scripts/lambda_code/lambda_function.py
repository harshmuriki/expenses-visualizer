"""
Optimized Lambda Function for PDF Transaction Processing
Key improvements:
- Environment variable configuration
- Better error handling
- Input validation
- No unnecessary file I/O
- Structured logging
- Timeout awareness
"""

import json
import base64
import os
import logging
from typing import Dict, Any, Tuple
from readPdf import extract_text_from_pdf_bytes
from process_optimized import DocumentProcessor

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Cache parent tags (loaded once per Lambda container lifecycle)
_PARENT_TAGS_CACHE = None

def get_parent_tags() -> str:
    """
    Get parent tags from environment or file (cached).
    Priority: ENV_VAR > file > default
    """
    global _PARENT_TAGS_CACHE
    
    if _PARENT_TAGS_CACHE is not None:
        return _PARENT_TAGS_CACHE
    
    # Option 1: From environment variable (fastest)
    parent_tags = os.getenv('PARENT_TAGS')
    if parent_tags:
        logger.info("Loaded parent tags from environment variable")
        _PARENT_TAGS_CACHE = parent_tags
        return parent_tags
    
    # Option 2: From file (slower, but cached after first load)
    try:
        with open("/var/task/parenttags.txt", "r") as f:
            parent_tags = f.read()
            logger.info("Loaded parent tags from file")
            _PARENT_TAGS_CACHE = parent_tags
            return parent_tags
    except FileNotFoundError:
        # Try alternative path
        try:
            with open("parenttags.txt", "r") as f:
                parent_tags = f.read()
                logger.info("Loaded parent tags from file (alternative path)")
                _PARENT_TAGS_CACHE = parent_tags
                return parent_tags
        except FileNotFoundError:
        # Option 3: Default categories
            logger.warning("Parent tags file not found, using defaults")
            default_tags = """Food & Dining
            Travel
            Shopping
            Entertainment & Recreation
            Healthcare & Medical
            Transportation
            Education
            Insurance
            Personal Care
            Home & Utilities
            Technology & Electronics
            """
        _PARENT_TAGS_CACHE = default_tags
        return default_tags

def validate_event(event: Dict[str, Any]) -> None:
    """Validate Lambda event structure."""
    if "body" not in event:
        raise ValueError("Missing 'body' in event")

    if not event["body"]:
        raise ValueError("Empty body in event")

def process_single_pdf(pdf_bytes: bytes, parent_tags: str, context: Any) -> Tuple[list, dict]:
    """
    Process a single PDF and return its nodes and parent_child_map.

    Args:
        pdf_bytes: PDF content as bytes
        parent_tags: Category tags string
        context: Lambda context for timeout awareness

    Returns:
        Tuple of (nodes list, parent_child_map dict)
    """
    # Extract text from PDF (in-memory, no /tmp writes)
    try:
        text = extract_text_from_pdf_bytes(pdf_bytes)
    except ValueError as e:
        # If PDF extraction fails, try as plain text
        logger.warning(f"PDF extraction failed, trying as plain text: {e}")
        try:
            text = pdf_bytes.decode('utf-8')
            logger.info(f"Successfully decoded as plain text: {len(text)} characters")
        except UnicodeDecodeError:
            raise ValueError(f"Content is neither valid PDF nor text: {e}")

    if not text.strip():
        raise ValueError("No text extracted from PDF")

    logger.info(f"Extracted {len(text)} characters from PDF")

    # Process document with optimized processor
    processor = DocumentProcessor(
        text=text,
        parent_tags=parent_tags,
        max_retries=2,
        timeout_ms=context.get_remaining_time_in_millis() - 5000 if context else None
    )

    output, parent_child_map = processor.process()

    # Ensure nodes is a list
    if not isinstance(output.get("nodes"), list):
        output["nodes"] = [output["nodes"]]

    return output["nodes"], parent_child_map

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for PDF transaction processing.
    Supports both single PDF and batch PDF processing.

    Args:
        event: Lambda event with base64-encoded PDF(s) in body
               - Single PDF: { "body": "base64_pdf_data", "isBase64Encoded": true }
               - Batch PDFs: { "pdfs": ["base64_pdf_1", "base64_pdf_2", ...] }
        context: Lambda context (for timeout awareness)

    Returns:
        API Gateway response with processed transactions
    """
    try:
        logger.info(f"Processing request - Remaining time: {context.get_remaining_time_in_millis() if context else 'N/A'}ms")

        # Get parent tags (cached)
        parent_tags = get_parent_tags()
        logger.info(f"Using parent tags: {parent_tags[:200]}...")

        # Check if this is a batch request
        if "pdfs" in event:
            # Batch processing mode
            pdfs_base64 = event["pdfs"]
            if not isinstance(pdfs_base64, list) or len(pdfs_base64) == 0:
                raise ValueError("'pdfs' must be a non-empty array")

            logger.info(f"Batch mode: Processing {len(pdfs_base64)} PDFs")

            all_nodes = []
            combined_parent_child_map = {}
            node_offset = 1  # Start after root node (index 0)
            errors = []

            for idx, pdf_base64 in enumerate(pdfs_base64):
                try:
                    pdf_bytes = base64.b64decode(pdf_base64)
                    logger.info(f"Processing PDF {idx + 1}/{len(pdfs_base64)}: {len(pdf_bytes)} bytes")

                    nodes, parent_child_map = process_single_pdf(pdf_bytes, parent_tags, context)

                    # Adjust node indices to avoid conflicts
                    for node in nodes:
                        if node['index'] != 0:  # Don't adjust root node
                            node['index'] += node_offset

                    # Adjust parent_child_map indices
                    adjusted_map = {}
                    for parent_idx, children in parent_child_map.items():
                        adjusted_parent = int(parent_idx) + node_offset if int(parent_idx) != 0 else 0
                        adjusted_children = [
                            child + node_offset if child != 0 else 0
                            for child in children
                        ]
                        adjusted_map[adjusted_parent] = adjusted_children

                    # Add to combined results (skip root node duplicates)
                    all_nodes.extend([n for n in nodes if n['index'] != 0])
                    # Merge adjusted maps without overwriting existing entries
                    for p_idx, children in adjusted_map.items():
                        if p_idx in combined_parent_child_map:
                            # Extend and deduplicate
                            existing = combined_parent_child_map[p_idx]
                            combined_parent_child_map[p_idx] = list({*existing, *children})
                        else:
                            combined_parent_child_map[p_idx] = list(children)

                    # Update offset for next PDF cumulatively based on all_nodes
                    if all_nodes:
                        node_offset = max(n['index'] for n in all_nodes) + 1
                    else:
                        node_offset += max([n['index'] for n in nodes]) + 1

                    logger.info(f"PDF {idx + 1} processed: {len(nodes)} nodes")

                except Exception as e:
                    error_msg = f"PDF {idx + 1} failed: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
                    continue

            # Add root node at the beginning
            root_node = {
                "name": "Expenses",
                "index": 0,
                "cost": sum(n.get('cost', 0) for n in all_nodes)
            }
            all_nodes.insert(0, root_node)

            logger.info(f"Batch processing complete: {len(all_nodes)} total nodes from {len(pdfs_base64)} PDFs")

            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "message": f"Batch processed {len(pdfs_base64)} PDFs successfully!",
                    "output": all_nodes,
                    "parent_child_map": combined_parent_child_map,
                    "stats": {
                        "total_nodes": len(all_nodes),
                        "total_categories": len(combined_parent_child_map),
                        "pdfs_processed": len(pdfs_base64),
                        "errors": errors
                    }
                }),
            }

        else:
            # Single PDF mode (backward compatible)
            validate_event(event)

            # Decode PDF content
            if event.get("isBase64Encoded", False):
                pdf_bytes = base64.b64decode(event["body"])
            else:
                pdf_bytes = event["body"].encode("utf-8")

            logger.info(f"Single mode: Processing PDF of size {len(pdf_bytes)} bytes")

            nodes, parent_child_map = process_single_pdf(pdf_bytes, parent_tags, context)

            logger.info(f"Successfully processed {len(nodes)} nodes")

            # Return success response
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "message": "PDF processed successfully!",
                    "output": nodes,
                    "parent_child_map": parent_child_map,
                    "stats": {
                        "total_nodes": len(nodes),
                        "total_categories": len(parent_child_map)
                    }
                }),
            }
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Invalid input",
                "details": str(e)
            }),
        }
    
    except Exception as e:
        logger.error(f"Processing error: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Internal processing error",
                "details": str(e) if os.getenv("DEBUG") else "An error occurred"
            }),
        }

