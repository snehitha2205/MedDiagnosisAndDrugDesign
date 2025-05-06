import requests

response = requests.post(
    "https://bioinformatics-api.onrender.com/predict",
    json={"smiles": "CCC"}
)
print(response.json())