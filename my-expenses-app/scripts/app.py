from flask import Flask, request, jsonify
import pandas as pd
# import io
from flask_cors import CORS
import process

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

nodes = {}
parentChildMap = {}


@app.route('/upload', methods=['POST'])
def upload_csv():
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # If it's a CSV, we can read it directly with pandas
    df = pd.read_csv(file)
    print("Got the file")

    # with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\my-expense-app\scripts\tags.txt", "r") as file:
    #     alltags = [line.strip() for line in file.readlines()]
    parentTag_Path = r'C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\my-expenses-app\scripts\parenttags.txt'

    with open(parentTag_Path, "r") as file:
        allparenttags = [line.strip() for line in file.readlines()]

    print(allparenttags)

    doc = process.Document(df, allparenttags=allparenttags)
    doc.convert_doc_to_items()
    doc.show_items()
    global nodes, parentChildMap = doc.convert_data()

    return jsonify({"nodes": nodes, "parentChildMap": parentChildMap}), 200


@app.route('/data', methods=['GET'])
def get_data():

    print("The nodes are:", nodes)
    print("The parentChildMap is:", parentChildMap)
    # Assuming you have a way to store or retrieve the processed data
    # For example, you might store it in a global variable or a database
    # Here, we'll assume you have a function to get the latest processed data
    # nodes, parent_child_map = get_latest_processed_data()
    return jsonify({"nodes": nodes, "parentChildMap": parentChildMap}), 200


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
