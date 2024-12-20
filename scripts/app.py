from flask import Flask, request, jsonify
import pandas as pd
import io
import process

app = Flask(__name__)


@app.route('/upload', methods=['POST'])
def upload_csv():
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # If it's a CSV, we can read it directly with pandas
    df = pd.read_csv(file)
    print("Got the file")

    with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\scripts\tags.txt", "r") as file:
        alltags = [line.strip() for line in file.readlines()]

    with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\scripts\parenttags.txt", "r") as file:
        allparenttags = [line.strip() for line in file.readlines()]

    # print(alltags, allparenttags)

    doc = process.Document(df, alltags=alltags, allparenttags=allparenttags)
    hierarchical_data = doc.to_hierarchical_dict()
    print(hierarchical_data)
    # print(df)
    
    return hierarchical_data


    # Process df as needed (classification, etc.)
    # For now, just return the columns
    return jsonify({"columns": df.columns.tolist(), "message": "File processed successfully"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
