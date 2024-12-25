import json
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

# Set your OpenAI API key
client = OpenAI()
OpenAI_Key = os.getenv('OPENAI_KEY')
OpenAI.api_key = OpenAI_Key


class Item:
    def __init__(self, name=None, price=None, index=None, parenttag=None, raw_str=None, alltags=None, allparenttags=None):
        self.name = name
        self.cost = price
        self.parenttag = parenttag
        self.index = index
        self.raw_str = raw_str  # store the entire row as a string
        self.alltags = alltags
        self.allparenttags = allparenttags

    def __repr__(self):
        return f"Item(name='{self.name}', index={self.index}, cost={self.cost}, parenttag='{self.parenttag}'')"

    def is_valid(self):
        # Define what makes an item valid
        return (
            isinstance(self.name, str) and self.name.strip() != "" and
            isinstance(self.cost, (int, float)) and self.cost >= 0 and
            isinstance(self.index, (int, str)) and str(self.index).strip() != "" and
            isinstance(self.parenttag, str) and self.parenttag.strip() != ""
        )

    def setdetails(self):
        # Use the entire row string in the prompt.
        # We know the CSV has columns including 'Description' (which we treat as the item name)
        # and 'Amount' (treated as the price).

        tag_prompt = (
            f"Here is a single transaction record:\n\n"
            f"{self.raw_str}\n\n"
            f"From this record, extract the following details and return them in the exact format shown:\n"
            f"The name should be a concise version of what the transaction should be\n"
            f"Choose the parent tags from this list: {self.allparenttags}\n"
            f"Choose the best parent tag for this particular transaction\n"
            f"name: <item name>\n"
            f"cost: <item price>\n"
            f"index: <index of the transaction or the parent tag>\n"
            f"parenttag: <broader category from the parent tag list given>\n"
        )

        completion = self.run_openai(tag_prompt)
        content = completion.choices[0].message.content

        lines = content.strip().split('\n')
        # print(lines)
        for line in lines:
            line = line.strip()
            if line.lower().startswith('name:'):
                self.name = line.split(':', 1)[1].strip()
            elif line.lower().startswith('cost:'):
                price_str = line.split(':', 1)[1].strip()
                # Try to convert the price to float
                try:
                    self.cost = abs(float(price_str))
                except ValueError:
                    self.cost = abs(float(price_str)) if price_str.replace(
                        '.', '', 1).isdigit() else price_str
            elif line.lower().startswith('index:'):
                self.index = line.split(':', 1)[1].strip()
            elif line.lower().startswith('parenttag:'):
                self.parenttag = line.split(':', 1)[1].strip()

        # print(self)

    def run_openai(self, prompt=""):
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            store=False,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return completion


class Document:
    def __init__(self, df: pd.DataFrame, alltags=None, allparenttags=None):
        self.document = df
        self.items = []
        self.alltags = alltags
        self.allparenttags = allparenttags

    def convert_doc_to_items(self):
        for _, row in self.document.iterrows():
            # Convert the entire row to a string for the prompt
            raw_str = row.to_string()
            temp_item = Item(raw_str=raw_str, alltags=self.alltags,
                             allparenttags=self.allparenttags)
            temp_item.setdetails()
            if temp_item.is_valid():
                self.items.append(temp_item)
                print(temp_item)

    def show_items(self):
        for item in self.items:
            print(item)

    def convert_data(self):

        # Conversion Logic
        output = {"nodes": []}
        parent_tags = {}
        parent_child_map = {}
        current_index = 0

        # Add root node
        output["nodes"].append({"name": "Expenses", "index": current_index})
        current_index += 1

        for item in self.items:
            if item.parenttag not in parent_tags:
                # Add parent tag node
                parent_tags[item.parenttag] = current_index
                output["nodes"].append(
                    {"name": item.parenttag, "index": current_index})
                parent_child_map[current_index] = []
                current_index += 1

            # Add transaction node
            transaction_index = current_index
            output["nodes"].append({
                "name": item.name,
                "cost": item.cost,
                "index": transaction_index
            })
            parent_child_map[parent_tags[item.parenttag]].append(
                transaction_index)
            current_index += 1

            # Output Result
            print(json.dumps(output, indent=4))

            # Output Parent-Child Map
            print("Parent-Child Map:")
            print(json.dumps(parent_child_map, indent=4))

            # Write JSON output to files
            with open("output.json", "w") as output_file:
                json.dump(output, output_file, indent=4)

            with open("parent_child_map.json", "w") as map_file:
                json.dump(parent_child_map, map_file, indent=4)

            print(
                "Data successfully written to 'output.json' and 'parent_child_map.json'")
            
            return (output, parent_child_map)


def main():

    # Example usage (adjust the path to your CSV):
    df = pd.read_csv(
        r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Georgia Tech\Payments All\activity.csv")

    with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\scripts\tags.txt", "r") as file:
        alltags = [line.strip() for line in file.readlines()]

    with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\scripts\parenttags.txt", "r") as file:
        allparenttags = [line.strip() for line in file.readlines()]

    # print(alltags, allparenttags)

    doc = Document(df, alltags=alltags, allparenttags=allparenttags)
    doc.convert_doc_to_items()
    # doc.show_items()
    hierarchical_data = doc.to_hierarchical_dict()
    print(hierarchical_data)


if __name__ == "__main__":
    main()
