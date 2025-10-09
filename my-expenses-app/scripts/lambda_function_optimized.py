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
Technology & Electronics"""
        _PARENT_TAGS_CACHE = default_tags
        return default_tags

def validate_event(event: Dict[str, Any]) -> None:
    """Validate Lambda event structure."""
    if "body" not in event:
        raise ValueError("Missing 'body' in event")
    
    if not event["body"]:
        raise ValueError("Empty body in event")

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for PDF transaction processing.
    
    Args:
        event: Lambda event with base64-encoded PDF in body
        context: Lambda context (for timeout awareness)
    
    Returns:
        API Gateway response with processed transactions
    """
    try:
        logger.info(f"Processing request - Remaining time: {context.get_remaining_time_in_millis() if context else 'N/A'}ms")
        
        # Validate input
        validate_event(event)
        
        # Decode PDF content (no file I/O needed!)
        if event.get("isBase64Encoded", False):
            pdf_bytes = base64.b64decode(event["body"])
        else:
            pdf_bytes = event["body"].encode("utf-8")
        
        logger.info(f"Received PDF of size: {len(pdf_bytes)} bytes")
        
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
        
        # Get parent tags (cached)
        parent_tags = get_parent_tags()
        logger.info(f"Using parent tags: {parent_tags[:200]}...")
        
        # Process document with optimized processor
        processor = DocumentProcessor(
            text=text,
            parent_tags=parent_tags,
            max_retries=2,  # Retry failed OpenAI calls
            timeout_ms=context.get_remaining_time_in_millis() - 5000 if context else None  # Leave 5s buffer
        )
        
        output, parent_child_map = processor.process()
        
        # Ensure nodes is a list
        if not isinstance(output.get("nodes"), list):
            output["nodes"] = [output["nodes"]]
        
        logger.info(f"Successfully processed {len(output['nodes'])} nodes")
        
        # Return success response
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"  # CORS support
            },
            "body": json.dumps({
                "message": "PDF processed successfully!",
                "output": output["nodes"],
                "parent_child_map": parent_child_map,
                "stats": {
                    "total_nodes": len(output["nodes"]),
                    "total_categories": len(parent_child_map),
                    "text_length": len(text)
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

