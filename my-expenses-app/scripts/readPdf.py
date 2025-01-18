from pypdf import PdfReader

def extract_text_from_pdf(pdf_path=""):
    # Open the PDF file
    alltext = ""
    with open(pdf_path, "rb") as file:
        reader = PdfReader(file)  # Initialize the PDF reader
        for page_num in range(len(reader.pages)):  # Loop through all pages
            page = reader.pages[page_num]  # Corrected indexing with square brackets
            text = page.extract_text()  # Extract text from the page
            # print("Text", text)  # Print the extracted text
            alltext += text

    return alltext
