"""
Optimized Document Processing with:
- Faster JSON parsing (simpler schema)
- Retry logic with exponential backoff
- Token usage optimization
- Better error handling
- Timeout awareness
"""

import json
import os
import time
import logging
from typing import Dict, List, Tuple, Optional, Any
from openai import OpenAI
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class Transaction:
    """Transaction data structure."""
    name: str
    cost: float
    date: str
    parenttag: str
    index: int
    raw_str: str = ""

    def is_valid(self) -> bool:
        """Validate transaction data."""
        return (
            isinstance(self.name, str) and self.name.strip() and
            isinstance(self.cost, (int, float)) and self.cost >= 0 and
            isinstance(self.parenttag, str) and self.parenttag.strip()
        )

class DocumentProcessor:
    """Optimized document processor with retry logic and better performance."""
    
    def __init__(
        self,
        text: str,
        parent_tags: str,
        max_retries: int = 3,
        timeout_ms: Optional[int] = None
    ):
        """
        Initialize processor.
        
        Args:
            text: Raw PDF text
            parent_tags: Available parent categories
            max_retries: Number of retries for OpenAI calls
            timeout_ms: Maximum processing time in milliseconds
        """
        self.text = text
        self.parent_tags = parent_tags
        self.max_retries = max_retries
        self.timeout_ms = timeout_ms
        self.start_time = time.time() * 1000
        self.transactions: List[Transaction] = []
        
        # Initialize OpenAI client
        api_key = os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_KEY')
        if not api_key:
            raise ValueError("Missing OPENAI_API_KEY environment variable")
        
        # Initialize OpenAI client with minimal parameters
        self.client = OpenAI(
            api_key=api_key,
            timeout=30.0
        )
    
    def _check_timeout(self):
        """Check if we're approaching timeout."""
        if self.timeout_ms:
            elapsed = (time.time() * 1000) - self.start_time
            if elapsed > self.timeout_ms:
                raise TimeoutError("Approaching Lambda timeout")
    
    def _call_openai_with_retry(self, messages: List[Dict], temperature: float = 0.7) -> str:
        """
        Call OpenAI API with exponential backoff retry logic.
        
        Args:
            messages: Chat messages
            temperature: OpenAI temperature parameter
            
        Returns:
            Response content
            
        Raises:
            Exception: If all retries fail
        """
        for attempt in range(self.max_retries):
            try:
                self._check_timeout()
                
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=temperature,
                    max_tokens=4096,
                    response_format={"type": "json_object"}
                )
                
                content = response.choices[0].message.content
                tokens_used = response.usage.total_tokens if response.usage else "N/A"
                logger.info(f"OpenAI call successful. Tokens used: {tokens_used}")
                return content
                
            except Exception as e:
                wait_time = (2 ** attempt) * 1
                if attempt < self.max_retries - 1:
                    logger.warning(f"OpenAI API error ({type(e).__name__}), retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"OpenAI API failed after {self.max_retries} retries: {e}")
                    raise
    
    def extract_transactions(self) -> None:
        """
        Extract transactions from document text using optimized prompt.
        Uses a simpler, more token-efficient approach.
        """
        # Debug: Log parent tags being sent to OpenAI
        logger.info(f"Parent tags available: {self.parent_tags[:200]}...")
        
        # Optimized prompt - more concise but still effective
        prompt = f"""Extract all transactions from this credit card statement.

For each transaction, provide:
- name: merchant/description (concise)
- price: amount (positive number)
- date: transaction date
- parenttag: category from this list: {self.parent_tags}
- index: sequential number starting from 0

Return JSON: {{"transactions": [...]}}

Statement text:
{self.text[:8000]}"""  # Limit text to avoid token limits
        
        messages = [{"role": "user", "content": prompt}]
        
        try:
            content = self._call_openai_with_retry(messages, temperature=0.3)  # Lower temp for consistency
            data = json.loads(content)
            
            transactions = data.get('transactions', [])
            logger.info(f"Extracted {len(transactions)} transactions from OpenAI")
            
            for idx, txn in enumerate(transactions):
                try:
                    # Debug: Log each transaction's parenttag
                    parenttag = txn.get('parenttag', 'Uncategorized')
                    logger.info(f"Transaction {idx}: {txn.get('name', '')} -> parenttag: '{parenttag}'")
                    
                    transaction = Transaction(
                        name=txn.get('name', '').strip(),
                        cost=abs(float(txn.get('price', 0))),
                        date=txn.get('date', ''),
                        parenttag=parenttag,
                        index=txn.get('index', idx),
                        raw_str=txn.get('raw_str', '')
                    )
                    
                    if transaction.is_valid():
                        self.transactions.append(transaction)
                    else:
                        logger.warning(f"Invalid transaction skipped: {txn}")
                        
                except (ValueError, TypeError) as e:
                    logger.warning(f"Failed to parse transaction {idx}: {e}")
                    continue
            
            logger.info(f"Validated {len(self.transactions)} transactions")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            raise ValueError("Invalid JSON response from OpenAI")
    
    def build_hierarchy(self) -> Tuple[Dict[str, List], Dict[int, List[int]]]:
        """
        Build hierarchical structure for visualization.
        
        Returns:
            Tuple of (output nodes, parent-child map)
        """
        output = {"nodes": []}
        parent_tags_map = {}
        parent_child_map = {}
        current_index = 0
        
        # Add root node
        root_index = 0
        output["nodes"].append({"name": "Expenses", "index": root_index})
        parent_child_map[root_index] = []  # Initialize root's children list
        current_index += 1
        
        # Add category nodes and transactions
        for transaction in self.transactions:
            # Add parent category if new
            if transaction.parenttag not in parent_tags_map:
                parent_tags_map[transaction.parenttag] = current_index
                output["nodes"].append({
                    "name": transaction.parenttag,
                    "index": current_index
                })
                parent_child_map[current_index] = []
                # Link category to root node
                parent_child_map[root_index].append(current_index)
                current_index += 1
            
            # Add transaction node
            transaction_index = current_index
            output["nodes"].append({
                "name": transaction.name,
                "cost": transaction.cost,
                "index": transaction_index
            })
            
            # Link to parent category
            parent_idx = parent_tags_map[transaction.parenttag]
            parent_child_map[parent_idx].append(transaction_index)
            current_index += 1
        
        logger.info(f"Built hierarchy: {len(output['nodes'])} nodes, {len(parent_child_map)} categories")
        
        return output, parent_child_map
    
    def process(self) -> Tuple[Dict[str, List], Dict[int, List[int]]]:
        """
        Main processing pipeline.
        
        Returns:
            Tuple of (output nodes, parent-child map)
        """
        logger.info("Starting document processing")
        
        # Extract transactions from text
        self.extract_transactions()
        
        if not self.transactions:
            logger.warning("No valid transactions found")
            return {"nodes": [{"name": "Expenses", "index": 0}]}, {}
        
        # Build visualization hierarchy
        output, parent_child_map = self.build_hierarchy()
        
        logger.info("Processing complete")
        return output, parent_child_map

