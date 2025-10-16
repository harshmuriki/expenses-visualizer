"""
Optimized PDF text extraction for Lambda.
Focuses on efficient in-memory text extraction.
"""

import io
import logging
from typing import Optional
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF bytes in-memory (no disk I/O).
    
    Args:
        pdf_bytes: PDF file content as bytes
        
    Returns:
        Extracted text content
        
    Raises:
        ValueError: If PDF cannot be processed
    """
    try:
        # Create in-memory PDF stream
        pdf_stream = io.BytesIO(pdf_bytes)
        
        # Try to read as PDF
        try:
            reader = PdfReader(pdf_stream)
            text_content = []
            
            for page_num, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():
                        text_content.append(page_text)
                        logger.info(f"Extracted {len(page_text)} characters from page {page_num + 1}")
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num + 1}: {e}")
                    continue
            
            if text_content:
                full_text = "\n".join(text_content)
                logger.info(f"Successfully extracted {len(full_text)} characters from PDF")
                return full_text
            else:
                raise ValueError("No text content found in PDF")
                
        except Exception as pdf_error:
            logger.warning(f"PDF parsing failed: {pdf_error}")
            
            # Fallback: Try to extract text from what looks like plain text
            try:
                # Check if it's actually plain text disguised as base64
                decoded_text = pdf_bytes.decode('utf-8', errors='ignore')
                if any(keyword in decoded_text.lower() for keyword in ['receipt', 'order', 'transaction', 'amount', 'total']):
                    logger.info("Detected plain text content, using as-is")
                    return decoded_text
                else:
                    raise ValueError("Content doesn't appear to be a receipt or transaction data")
            except UnicodeDecodeError:
                raise ValueError("Content is not valid text or PDF")
                
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise ValueError(f"Failed to extract text from PDF: {e}")

def extract_text_from_text_bytes(text_bytes: bytes) -> str:
    """
    Extract text from plain text bytes (fallback for non-PDF content).
    
    Args:
        text_bytes: Text content as bytes
        
    Returns:
        Text content as string
    """
    try:
        text = text_bytes.decode('utf-8')
        logger.info(f"Extracted {len(text)} characters from text content")
        return text
    except UnicodeDecodeError as e:
        logger.error(f"Failed to decode text content: {e}")
        raise ValueError(f"Failed to decode text content: {e}")