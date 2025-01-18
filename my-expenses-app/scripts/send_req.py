import requests

url = "https://psy73lsgqf.execute-api.us-east-2.amazonaws.com/Testing/ExpensesTracker"
params = {
    "transaction_id": "103243ertertret24230",
    "transaction_date": "1233423423432",
}
headers = {
    "Authorization": "Bearer 9Pw1xKkFhh2f1cCVzrPGG1oRbVMPOYrC4R4xivrq"
}

response = requests.get(url, params=params, headers=headers)

print(response.status_code)
print(response.json())