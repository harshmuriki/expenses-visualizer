import json
from openai import OpenAI
import os

client = OpenAI()
OpenAI_Key = os.getenv('OPENAI_KEY')
OpenAI.api_key = OpenAI_Key


class Item:
    def __init__(self, name=None, price=None, date=None, index=None, parenttag=None, raw_str=None, alltags=None, allparenttags=None, location=None, file_source=None):
        self.name = name
        self.cost = abs(price)
        self.date = date
        self.parenttag = parenttag
        self.index = index
        self.raw_str = raw_str
        self.alltags = alltags
        self.allparenttags = allparenttags
        self.location = location
        self.file_source = file_source

    def __repr__(self):
        return f"Item(name='{self.name}', index={self.index}, cost={self.cost}, parenttag='{self.parenttag}', date='{self.date}', location='{self.location}', file_source='{self.file_source}')"

    def is_valid(self):
        # Define what makes an item valid
        return (
            isinstance(self.name, str) and self.name.strip() != "" and
            isinstance(self.cost, (int, float)) and self.cost >= 0 and
            isinstance(self.index, (int, str)) and str(self.index).strip() != "" and
            isinstance(self.parenttag, str) and self.parenttag.strip() != ""
        )


class Document:
    def __init__(self, text: str, alltags=None, allparenttags=None):
        self.document = text
        self.items = []
        self.alltags = alltags
        self.allparenttags = allparenttags

    def extractdetails(self):
        # Use the entire document string in the prompt.
        tag_prompt = (
            f"Here is an entire transaction record:\n\n"
            f"{self.document}\n\n"
            f"From this record, extract the following details and return them in the exact format shown in a JSON format:\n"
            f"The name should be a concise version of what the transaction should be\n"
            f"Choose the parent tags from this list: {self.allparenttags}\n"
            f"Choose the best parent tag for this particular transaction\n"
            f"Extract the location/merchant address if available\n"
            f"Determine the file source (e.g., 'amex', 'capitalone', 'chase', 'bankofamerica', 'wells', 'discover', 'citi', 'usbank', 'pnc', 'truist', 'regions', 'huntington', 'keybank', 'citizens', 'td', 'bmo', 'hsbc', 'barclays', 'synchrony', 'comenity', 'storecard', 'paypal', 'venmo', 'zelle', 'cashapp', 'applepay', 'googlepay', 'amazon', 'paypal', 'stripe', 'square', 'other') based on the document content\n"
        )

        content = self.run_openai(prompt=tag_prompt)
        print("Output from OpenAI \n", content)
        try:
            content_json = json.loads(content)
            # print("output", content_json, type(content_json))

        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON: {e}")
            print("output", content, type(content))

        for transaction in content_json.get('transactions'):
            item = Item(
                name=transaction.get("name"),
                price=transaction.get("price"),
                date=transaction.get("date"),
                index=transaction.get("index"),
                raw_str=transaction.get("raw_str"),
                parenttag=transaction.get("parenttag"),
                alltags=self.alltags,
                allparenttags=self.allparenttags,
                location=transaction.get("location"),
                file_source=transaction.get("file_source")
            )

            if item.is_valid():
                self.items.append(item)
                # print("Item", item)

    def run_openai(self, prompt=""):

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    },
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "transactions_list",
                        "strict": True,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "transactions": {
                                    "type": "array",
                                    "description": "A list of transactions.",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": {
                                                "type": "string",
                                                "description": "The name of the transaction."
                                            },
                                            "price": {
                                                "type": "number",
                                                "description": "The cost or price of the transaction."
                                            },
                                            "date": {
                                                "type": "string",
                                                "description": "The date of the transaction."
                                            },
                                            "parenttag": {
                                                "type": "string",
                                                "description": "The parent tag taken from the list of the parenttags."
                                            },
                                            "index": {
                                                "type": "number",
                                                "description": "The index of the transaction."
                                            },
                                            "raw_str": {
                                                "type": "string",
                                                "description": "The raw string of the transaction."
                                            },
                                            "location": {
                                                "type": "string",
                                                "description": "The location or merchant address of the transaction."
                                            },
                                            "file_source": {
                                                "type": "string",
                                                "description": "The source of the file (e.g., 'amex', 'capitalone', 'chase', etc.)."
                                            }
                                        },
                                        "required": [
                                            "name",
                                            "price",
                                            "date",
                                            "parenttag",
                                            "index",
                                            "raw_str",
                                            "location",
                                            "file_source"
                                        ],
                                        "additionalProperties": False
                                    }
                                }
                            },
                            "required": [
                                "transactions"
                            ],
                            "additionalProperties": False
                        }
                    }
                },
                temperature=1,
                max_completion_tokens=4096,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )

        except Exception as e:
            print(f"OpenAI API call failed: {e}")
            return "{}"

        return response.choices[0].message.content

    def convert_text_to_items(self, show=False):

        self.extractdetails()

        if show:
            self.show_items()

    def show_items(self):
        for item in self.items:
            print(item)

    def convert_data_to_viz(self):

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
                "index": transaction_index,
                "date": item.date,
                "location": item.location,
                "file_source": item.file_source,
            })
            parent_child_map[parent_tags[item.parenttag]].append(
                transaction_index)
            current_index += 1

        # Output Result
        # print(json.dumps(output, indent=4))

        # # Output Parent-Child Map
        # print("Parent-Child Map:")
        # print(json.dumps(parent_child_map, indent=4))

        # Write JSON output to files
        # with open("output.json", "w") as output_file:
        #     json.dump(output, output_file, indent=4)

        # with open("parent_child_map.json", "w") as map_file:
        #     json.dump(parent_child_map, map_file, indent=4)

        print(
            "Data successfully written to 'output.json' and 'parent_child_map.json'")

        return (output, parent_child_map)


def main():

    pass

    # Example usage (adjust the path to your CSV):
    # df = pd.read_csv(
    #     r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Georgia Tech\Payments All\activity.csv")

    # with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\my-expenses-app\scripts\tags.txt", "r") as file:
    #     alltags = [line.strip() for line in file.readlines()]

    # with open(r"C:\Users\harsh\OneDrive - Georgia Institute of Technology\Documents\Projects\expenses-visualizer\my-expenses-app\scripts\parenttags.txt", "r") as file:
    #     allparenttags = [line.strip() for line in file.readlines()]

    # # print(alltags, allparenttags)

    # doc = Document(df, alltags=alltags, allparenttags=allparenttags)
    # doc.convert_text_to_items()
    # (output, parent_child_map) = doc.convert_data_to_viz()
    # print(output, parent_child_map)


if __name__ == "__main__":
    main()
