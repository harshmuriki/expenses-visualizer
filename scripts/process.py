import pandas as pd
from openai import OpenAI


# Set your OpenAI API key
client = OpenAI()
OpenAI.api_key = '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'


class Item:
    def __init__(self, name=None, price=None, tag=None, parenttag=None, raw_str=None, alltags=None, allparenttags=None):
        self.name = name
        self.price = price
        self.parenttag = parenttag
        self.tag = tag
        self.raw_str = raw_str  # store the entire row as a string
        self.alltags = alltags
        self.allparenttags = allparenttags

    def __repr__(self):
        return f"Item(name='{self.name}', price={self.price}, tag='{self.tag}', parenttag='{self.parenttag}'')"

    def setdetails(self):
        # Use the entire row string in the prompt.
        # We know the CSV has columns including 'Description' (which we treat as the item name)
        # and 'Amount' (treated as the price).

        tag_prompt = (
            f"Here is a single transaction record:\n\n"
            f"{self.raw_str}\n\n"
            f"From this record, extract the following details and return them in the exact format shown:\n"
            f"The name should be a concise version of what the transaction should be\n"
            f"Choose the tag from this list: {self.alltags} and choose the parent tag from this list: {self.allparenttags}\n"
            f"Name: <item name>\n"
            f"Price: <item price>\n"
            f"Tag: <one or two word category>\n"
            f"Parent Tag: <broader category>\n"
        )

        completion = self.run_openai(tag_prompt)
        content = completion.choices[0].message.content

        lines = content.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.lower().startswith('name:'):
                self.name = line.split(':', 1)[1].strip()
            elif line.lower().startswith('price:'):
                price_str = line.split(':', 1)[1].strip()
                # Try to convert the price to float
                try:
                    self.price = float(price_str)
                except ValueError:
                    self.price = price_str
            elif line.lower().startswith('tag:'):
                self.tag = line.split(':', 1)[1].strip()
            elif 'parent tag' in line.lower():
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
            self.items.append(temp_item)
            print(temp_item)

    def show_items(self):
        for item in self.items:
            print(item)
            
    def to_hierarchical_dict(self):
        # Create a structure like:
        # { parenttag: { tag: [items...] } }
        hierarchy = {}

        for item in self.items:
            ptag = item.parenttag if item.parenttag else "UnknownParent"
            tag = item.tag if item.tag else "UnknownTag"

            if ptag not in hierarchy:
                hierarchy[ptag] = {}

            if tag not in hierarchy[ptag]:
                hierarchy[ptag][tag] = []

            hierarchy[ptag][tag].append({
                "name": item.name,
                "price": item.price
            })

        # Now convert this nested dict into the desired hierarchical structure
        # Root
        root = {
            "name": "Expenses",
            "children": []
        }

        for ptag, tags_dict in hierarchy.items():
            ptag_node = {
                "name": ptag,
                "children": []
            }

            for tag, items_list in tags_dict.items():
                tag_node = {
                    "name": tag,
                    "children": items_list
                }
                ptag_node["children"].append(tag_node)

            root["children"].append(ptag_node)

        return root


# # Example usage (adjust the path to your CSV):
# df = pd.read_csv(
#     r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Georgia Tech\Payments All\activity.csv")

# with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\scripts\tags.txt", "r") as file:
#     alltags = [line.strip() for line in file.readlines()]

# with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\scripts\parenttags.txt", "r") as file:
#     allparenttags = [line.strip() for line in file.readlines()]

# # print(alltags, allparenttags)

# doc = Document(df, alltags=alltags, allparenttags=allparenttags)
# doc.convert_doc_to_items()
# # doc.show_items()
# hierarchical_data = doc.to_hierarchical_dict()
# print(hierarchical_data)