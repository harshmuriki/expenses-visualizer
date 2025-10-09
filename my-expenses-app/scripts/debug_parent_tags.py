#!/usr/bin/env python3
"""
Debug script to test parent tags loading in Lambda environment.
Run this to verify parent tags are being loaded correctly.
"""

import os
import sys

def test_parent_tags():
    """Test parent tags loading logic."""
    print("🔍 Testing parent tags loading...")
    
    # Test 1: Check if file exists
    print("\n1. Checking parenttags.txt file:")
    try:
        with open("parenttags.txt", "r") as f:
            content = f.read()
            print(f"✅ File found! Content length: {len(content)} chars")
            print(f"First 200 chars: {content[:200]}")
    except FileNotFoundError:
        print("❌ parenttags.txt not found in current directory")
    
    # Test 2: Check environment variable
    print("\n2. Checking PARENT_TAGS environment variable:")
    env_tags = os.getenv('PARENT_TAGS')
    if env_tags:
        print(f"✅ Environment variable found! Length: {len(env_tags)} chars")
        print(f"First 200 chars: {env_tags[:200]}")
    else:
        print("❌ PARENT_TAGS environment variable not set")
    
    # Test 3: Simulate Lambda function logic
    print("\n3. Simulating Lambda get_parent_tags() logic:")
    
    # Option 1: From environment variable
    parent_tags = os.getenv('PARENT_TAGS')
    if parent_tags:
        print("✅ Using parent tags from environment variable")
        return parent_tags
    
    # Option 2: From file
    try:
        with open("/var/task/parenttags.txt", "r") as f:
            parent_tags = f.read()
            print("✅ Using parent tags from /var/task/parenttags.txt")
            return parent_tags
    except FileNotFoundError:
        print("❌ /var/task/parenttags.txt not found")
    
    # Try alternative path
    try:
        with open("parenttags.txt", "r") as f:
            parent_tags = f.read()
            print("✅ Using parent tags from parenttags.txt (alternative path)")
            return parent_tags
    except FileNotFoundError:
        print("❌ parenttags.txt not found in alternative path")
    
    # Option 3: Default categories
    print("⚠️ Using default categories")
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
    return default_tags

if __name__ == "__main__":
    print("🧪 Parent Tags Debug Test")
    print("=" * 50)
    
    parent_tags = test_parent_tags()
    
    print(f"\n📋 Final parent tags:")
    print(f"Length: {len(parent_tags)} characters")
    print(f"Content:\n{parent_tags}")
    
    # Check if it contains expected categories
    expected_categories = [
        "Food & Dining", "Transportation", "Shopping", 
        "Entertainment & Recreation", "Health & Wellness"
    ]
    
    print(f"\n🔍 Checking for expected categories:")
    for category in expected_categories:
        if category in parent_tags:
            print(f"✅ {category}")
        else:
            print(f"❌ {category} - NOT FOUND")
    
    print("\n🎯 Test complete!")
