from flask import Flask, request, jsonify
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem
import torch
import torch.nn as nn
import joblib
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# ====================================
# Persistent Cache Setup
# ====================================
CACHE_FILE = 'prediction_cache.pkl'
if os.path.exists(CACHE_FILE):
    prediction_cache = joblib.load(CACHE_FILE)
else:
    prediction_cache = {}

# ====================================
# ViT Model Definition (must match training)
# ====================================
class PatchEmbedding(nn.Module):
    def __init__(self, in_channels=3, patch_size=4, embedding_dim=48):
        super().__init__()
        self.patcher = nn.Conv2d(in_channels, embedding_dim, kernel_size=patch_size, stride=patch_size)
        self.flatten = nn.Flatten(2, 3)

    def forward(self, x):
        x = self.patcher(x)
        x = self.flatten(x)
        return x.permute(0, 2, 1)

class MultiheadSelfAttentionBlock(nn.Module):
    def __init__(self, embedding_dim=48, num_heads=4, attn_dropout=0):
        super().__init__()
        self.layer_norm = nn.LayerNorm(embedding_dim)
        self.multihead_attn = nn.MultiheadAttention(
            embed_dim=embedding_dim, 
            num_heads=num_heads, 
            dropout=attn_dropout, 
            batch_first=True
        )

    def forward(self, x):
        x_norm = self.layer_norm(x)
        attn_output, _ = self.multihead_attn(x_norm, x_norm, x_norm, need_weights=False)
        return attn_output

class MLPBlock(nn.Module):
    def __init__(self, embedding_dim=48, mlp_size=3072, dropout=0.1):
        super().__init__()
        self.layer_norm = nn.LayerNorm(embedding_dim)
        self.mlp = nn.Sequential(
            nn.Linear(embedding_dim, mlp_size),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(mlp_size, embedding_dim),
            nn.Dropout(dropout)
        )

    def forward(self, x):
        return self.mlp(self.layer_norm(x))

class TransformerEncoderBlock(nn.Module):
    def __init__(self, embedding_dim=48, num_heads=4, mlp_size=3072, mlp_dropout=0.1, attn_dropout=0):
        super().__init__()
        self.msa_block = MultiheadSelfAttentionBlock(embedding_dim, num_heads, attn_dropout)
        self.mlp_block = MLPBlock(embedding_dim, mlp_size, mlp_dropout)

    def forward(self, x):
        x = self.msa_block(x) + x
        x = self.mlp_block(x) + x
        return x

class ViT(nn.Module):
    def __init__(self, img_size=32, patch_size=4, in_channels=3, num_classes=10,
                 embedding_dim=48, num_transformer_layers=12, num_heads=4,
                 mlp_size=3072, attn_dropout=0, mlp_dropout=0.1, embedding_dropout=0.1):
        super().__init__()
        assert img_size % patch_size == 0
        self.num_patches = (img_size // patch_size) ** 2
        self.class_embedding = nn.Parameter(torch.randn(1, 1, embedding_dim))
        self.position_embedding = nn.Parameter(torch.randn(1, self.num_patches + 1, embedding_dim))
        self.embedding_dropout = nn.Dropout(embedding_dropout)
        self.patch_embedding = PatchEmbedding(in_channels, patch_size, embedding_dim)
        self.encoder_blocks = nn.ModuleList([
            TransformerEncoderBlock(embedding_dim, num_heads, mlp_size, mlp_dropout, attn_dropout)
            for _ in range(num_transformer_layers)
        ])
        self.classifier = nn.Sequential(
            nn.LayerNorm(embedding_dim),
            nn.Linear(embedding_dim, num_classes)
        )

    def forward(self, x):
        x = self.patch_embedding(x)
        batch_size = x.shape[0]
        class_token = self.class_embedding.expand(batch_size, -1, -1)
        x = torch.cat((class_token, x), dim=1)
        x = self.embedding_dropout(x + self.position_embedding)
        for block in self.encoder_blocks:
            x = block(x)
        return self.classifier(x[:, 0])

# ====================================
# Load Model and Helper Functions
# ====================================
def load_model():
    model_data = joblib.load("vit_model.pkl")
    model = ViT(**model_data["model_config"])
    model.load_state_dict(torch.load(model_data["model_state_dict"], map_location=torch.device('cpu')))
    model.eval()
    return model, model_data["label_encoder"]

vit, le = load_model()

def morgan_to_image(x):
    flat = np.pad(x, (0, 3 * 32 * 32 - len(x)), constant_values=0)
    return flat.reshape(3, 32, 32)

# ====================================
# API Endpoints
# ====================================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        smiles = data.get('smiles', '')

        # Check if prediction is already cached
        if smiles in prediction_cache:
            return jsonify({
                "smiles": smiles,
                "predicted_class": prediction_cache[smiles],
                "cached": True
            })

        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return jsonify({"error": "Invalid SMILES string"}), 400

        fingerprint = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=1024)
        fp_array = np.array(fingerprint, dtype=np.float32)
        fp_array = fp_array / (fp_array.max() + 1e-6)

        image = morgan_to_image(fp_array)
        image_tensor = torch.tensor(image, dtype=torch.float32).unsqueeze(0)

        with torch.no_grad():
            output = vit(image_tensor)
            predicted_class_idx = output.argmax(1).item()
            predicted_label = le.inverse_transform([predicted_class_idx])[0]

        # Cache result and persist
        prediction_cache[smiles] = predicted_label
        joblib.dump(prediction_cache, CACHE_FILE)

        return jsonify({
            "smiles": smiles,
            "predicted_class": predicted_label,
            "cached": False
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/clear_cache', methods=['POST'])
def clear_cache():
    global prediction_cache
    prediction_cache = {}
    if os.path.exists(CACHE_FILE):
        os.remove(CACHE_FILE)
    return jsonify({"message": "Cache cleared."})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)