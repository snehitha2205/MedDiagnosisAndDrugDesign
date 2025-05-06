
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# import numpy as np
# import pandas as pd
# from rdkit import Chem
# from rdkit.Chem import Descriptors
# from rdkit.Chem.Draw import MolToImage
# from io import BytesIO
# import base64
# import random

# app = FastAPI()

# # CORS configuration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load your dataset
# df = pd.read_csv(r"D:\Gen_AI_Drug_Discovery\server\final.csv")

# class InputData(BaseModel):
#     SMILES: str

# def predict_pIC50(properties):
#     """Simple pIC50 prediction model"""
#     return 5.0 + 0.1 * properties['LogP'] + 0.01 * properties['Molecular Weight']

# def calculate_molecular_properties(smiles):
#     """Calculate molecular properties from SMILES"""
#     molecule = Chem.MolFromSmiles(smiles)
#     if not molecule:
#         return None
    
#     properties = {
#         'Molecular Weight': Descriptors.MolWt(molecule),
#         'LogP': Descriptors.MolLogP(molecule),
#         'H-Bond Donor Count': Descriptors.NumHDonors(molecule),
#         'H-Bond Acceptor Count': Descriptors.NumHAcceptors(molecule),
#     }
#     properties['pIC50'] = predict_pIC50(properties)
#     return properties

# def generate_similar_molecules(target_smiles, num_results=5):
#     """Mock function to generate similar molecules"""
#     # In a real implementation, this would use your actual model
#     # Here we just return random molecules from the dataset
    
#     valid_molecules = []
#     for smiles in df['SMILES'].sample(20):  # Get random samples
#         mol = Chem.MolFromSmiles(smiles)
#         if mol:
#             valid_molecules.append(smiles)
#             if len(valid_molecules) >= num_results:
#                 break
    
#     results = []
#     for smiles in valid_molecules:
#         properties = calculate_molecular_properties(smiles)
#         if not properties:
#             continue
            
#         mol = Chem.MolFromSmiles(smiles)
#         img = MolToImage(mol)
        
#         # Convert image to base64
#         buffered = BytesIO()
#         img.save(buffered, format="PNG")
#         img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
#         results.append({
#             "SMILES": smiles,
#             "image": img_str,
#             "pIC50": properties['pIC50'],
#             "LogP": properties['LogP'],
#             "Reward": random.uniform(0.7, 1.0)  # Mock reward value
#         })
    
#     return results

# @app.post("/predict/reinforcement")
# async def predict_reinforcement(data: InputData):
#     """Endpoint for generating molecules using reinforcement learning"""
#     user_smile = data.SMILES.strip()
    
#     # Validate input
#     if not Chem.MolFromSmiles(user_smile):
#         raise HTTPException(status_code=400, detail="Invalid SMILES string provided")
    
#     # Generate results (using mock function in this example)
#     results = generate_similar_molecules(user_smile)
    
#     if not results:
#         raise HTTPException(status_code=500, detail="No valid molecules generated")
    
#     # Find the result with highest reward
#     max_reward = max(result['Reward'] for result in results)
    
#     return {
#         "top_results": results,
#         "max_reward": max_reward
#     }

# # For running with: uvicorn filename:app --reload
# if __name__ == '__main__':
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from rdkit import Chem
from rdkit.Chem import Descriptors, AllChem
from rdkit.Chem.Draw import MolToImage
from io import BytesIO
import base64
import joblib
from pathlib import Path
import requests
from typing import Dict, List, Optional
import uuid
import time

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your dataset
df = pd.read_csv(r"D:\Gen_AI_Drug_Discovery\server\final.csv")

# Webhook configuration
WEBHOOK_URL = "https://webhook.site/0b0646b1-0fb5-4a1a-b0a0-c7efc98a28e1"  
WEBHOOK_EVENTS = {
    "generation_start": "generation_started",
    "generation_complete": "generation_completed",
    "error": "error_occurred"
}

# Global cache for storing input-output mappings
reinforcement_cache: Dict[str, List[Dict]] = {}
cache_file = "reinforcement_cache.pkl"

# Load cached data from file (if exists)
def load_cache():
    global reinforcement_cache
    if Path(cache_file).exists():
        reinforcement_cache = joblib.load(cache_file)

# Save cached data to file
def save_cache():
    joblib.dump(reinforcement_cache, cache_file)

# Load cache when the app starts
load_cache()

class InputData(BaseModel):
    SMILES: str
    callback_url: Optional[str] = None  # For webhook callback
    request_id: Optional[str] = None  # For tracking requests

class WebhookPayload(BaseModel):
    event: str
    request_id: str
    status: str
    data: Optional[Dict] = None
    timestamp: float

# In your FastAPI backend, update the webhook function:
def send_webhook(payload: WebhookPayload, callback_url: Optional[str] = None):
    """Send webhook notification with enhanced logging"""
    if not callback_url or "YOUR-UNIQUE-ID" in callback_url:
        print("ERROR: Invalid webhook URL - please configure a real webhook endpoint")
        return False
    
    try:
        print(f"SENDING webhook to {callback_url}")
        print(f"PAYLOAD: {payload.model_dump()}")
        
        headers = {"Content-Type": "application/json"}
        response = requests.post(
            callback_url,
            json=payload.model_dump(),
            headers=headers,
            timeout=3
        )
        
        print(f"RESPONSE: {response.status_code} - {response.text}")
        response.raise_for_status()
        return True
        
    except Exception as e:
        print(f"WEBHOOK FAILED: {str(e)}")
        return False

def predict_pIC50(properties):
    """Simple pIC50 prediction model"""
    return 5.0 + 0.1 * properties['LogP'] + 0.01 * properties['Molecular Weight']

def calculate_molecular_properties(smiles):
    """Calculate molecular properties from SMILES"""
    molecule = Chem.MolFromSmiles(smiles)
    if not molecule:
        return None
    
    properties = {
        'Molecular Weight': Descriptors.MolWt(molecule),
        'LogP': Descriptors.MolLogP(molecule),
        'H-Bond Donor Count': Descriptors.NumHDonors(molecule),
        'H-Bond Acceptor Count': Descriptors.NumHAcceptors(molecule),
    }
    properties['pIC50'] = predict_pIC50(properties)
    return properties

def smiles_to_fp_array(smiles):
    """Convert SMILES to fingerprint array"""
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        return None
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=2048)
    return np.array(list(fp.ToBitString())).astype(int)

def compute_similarity(smiles1, smiles2):
    """Compute Tanimoto similarity between two molecules"""
    mol1 = Chem.MolFromSmiles(smiles1)
    mol2 = Chem.MolFromSmiles(smiles2)
    if mol1 is None or mol2 is None:
        return 0.0
    fp1 = AllChem.GetMorganFingerprintAsBitVect(mol1, 2, nBits=2048)
    fp2 = AllChem.GetMorganFingerprintAsBitVect(mol2, 2, nBits=2048)
    return AllChem.DataStructs.TanimotoSimilarity(fp1, fp2)

def generate_similar_molecules(target_smiles, num_results=5):
    """Generate similar molecules with properties and rewards"""
    valid_molecules = []
    for smiles in df['SMILES'].sample(20):  # Get random samples
        mol = Chem.MolFromSmiles(smiles)
        if mol:
            valid_molecules.append(smiles)
            if len(valid_molecules) >= num_results:
                break
    
    results = []
    for smiles in valid_molecules:
        properties = calculate_molecular_properties(smiles)
        if not properties:
            continue
            
        mol = Chem.MolFromSmiles(smiles)
        img = MolToImage(mol)
        
        # Convert image to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Calculate similarity reward
        reward = compute_similarity(target_smiles, smiles)
        
        results.append({
            "smiles": smiles,
            "image": img_str,
            "pIC50": round(properties['pIC50'], 3),
            "logP": round(properties['LogP'], 3),
            "reward": round(reward, 3)
        })
    
    return sorted(results, key=lambda x: x['reward'], reverse=True)

@app.post("/predict/reinforcement")
async def predict_reinforcement(data: InputData, request: Request):
    """Endpoint for generating molecules using reinforcement learning"""
    try:
        input_smiles = data.SMILES.strip()
        callback_url = data.callback_url or WEBHOOK_URL
        request_id = data.request_id or str(uuid.uuid4())
        
        # Validate input
        if not Chem.MolFromSmiles(input_smiles):
            raise HTTPException(status_code=400, detail="Invalid SMILES string provided")
        
        # Send generation start webhook
        if callback_url:
            start_payload = WebhookPayload(
                event=WEBHOOK_EVENTS["generation_start"],
                request_id=request_id,
                status="started",
                timestamp=time.time()
            )
            send_webhook(start_payload, callback_url)
        
        # Check cache first
        if input_smiles in reinforcement_cache:
            results = reinforcement_cache[input_smiles]
            best = results[0]
            
            # Send completion webhook
            if callback_url:
                complete_payload = WebhookPayload(
                    event=WEBHOOK_EVENTS["generation_complete"],
                    request_id=request_id,
                    status="completed",
                    data={"from_cache": True},
                    timestamp=time.time()
                )
                send_webhook(complete_payload, callback_url)
            
            return {
                "request_id": request_id,
                "top_results": results,
                "best_smile": best["smiles"],
                "best_logP": best["logP"],
                "best_pIC50": best["pIC50"],
                "best_reward": best["reward"],
                "best_image": best["image"]
            }
        
        # Generate fresh results
        results = generate_similar_molecules(input_smiles)
        
        if not results:
            raise HTTPException(status_code=500, detail="No valid molecules generated")
        
        # Cache the results
        reinforcement_cache[input_smiles] = results
        save_cache()
        
        best = results[0]
        
        # Send completion webhook
        if callback_url:
            complete_payload = WebhookPayload(
                event=WEBHOOK_EVENTS["generation_complete"],
                request_id=request_id,
                status="completed",
                data={"from_cache": False},
                timestamp=time.time()
            )
            send_webhook(complete_payload, callback_url)
        
        return {
            "request_id": request_id,
            "top_results": results,
            "best_smile": best["smiles"],
            "best_logP": best["logP"],
            "best_pIC50": best["pIC50"],
            "best_reward": best["reward"],
            "best_image": best["image"]
        }
        
    except Exception as e:
        # Send error webhook
        if callback_url:
            error_payload = WebhookPayload(
                event=WEBHOOK_EVENTS["error"],
                request_id=request_id,
                status="error",
                data={"error": str(e)},
                timestamp=time.time()
            )
            send_webhook(error_payload, callback_url)
        
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cache/clear")
async def clear_cache():
    """Clear the reinforcement cache"""
    global reinforcement_cache
    reinforcement_cache = {}
    save_cache()
    return {"status": "Cache cleared"}

@app.get("/cache/size")
async def cache_size():
    """Get the current cache size"""
    return {"cache_size": len(reinforcement_cache)}

# For running with: uvicorn filename:app --reload
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4004)