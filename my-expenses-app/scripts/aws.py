import json
import base64
from readPdf import extract_text_from_pdf
from process_amz import Document

def lambda_handler(event, context):
    try:
        amz = True
        
        if amz:
            # Validate that 'body' exists in the event
            if "body" not in event:
                raise KeyError("'body' key is missing in the event object")

            # Decode the base64-encoded PDF content
            if event.get("isBase64Encoded", False):
                pdf_content = base64.b64decode(event["body"])
            else:
                pdf_content = event["body"].encode("utf-8")

            # Save the PDF to a temporary file in /tmp (Lambda's writable directory)
            pdf_path = "/tmp/uploaded.pdf"
            with open(pdf_path, "wb") as f:
                f.write(pdf_content)
            
        else:
            
            # Path to the text file
            pdf_path = "harsh.pdf"

        parentTags_path = "parenttags.txt"

        # Define parent tags
        parentTags = []
        
        # Read the text file
        with open(parentTags_path, "r") as file:
            parentTags = file.read()

        text = extract_text_from_pdf(pdf_path)
        
        doc = Document(text=text, allparenttags=parentTags)
        
        doc.extractdetails()
        
        (output, parent_child_map) = doc.convert_data_to_viz()
        
        if not isinstance(output.get("nodes"), list):
            output["nodes"] = [output["nodes"]]
        
        if amz:
            # Prepare a successful response
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "message": "PDF processed successfully!",
                    "output": output["nodes"],
                    "parent_child_map": parent_child_map,
                }),
            }
        
    except KeyError as e:
        # Handle missing 'body' key error
        print("Error:", str(e))
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }

    except Exception as e:
        # Handle any other errors
        print("Error processing PDF:", str(e))
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }


if __name__ == "__main__":
    # Test the Lambda function locally
    lambda_handler({"body": "SGVsbG8gV29ybGQ="}, None)