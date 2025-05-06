from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import json
from tokenizers import Tokenizer
from tokenizers.models import BPE
import torch.nn as nn
import torch.nn.functional as F

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# ----------------------------
# Load Tokenizer & Vocab
# ----------------------------
with open("updated_vocab.json", "r") as f:
    vocab = json.load(f)

bpe_model = BPE.from_file("updated_vocab.json", "merges.txt")
tokenizer = Tokenizer(bpe_model)
tokenizer.add_special_tokens(['<mask>'])

# ----------------------------
# Model Architecture
# ----------------------------
class RoBERTaEmbedding(nn.Module):
    def __init__(self, vocab_size, embed_dim=256, max_len=128):
        super().__init__()
        self.token_embed = nn.Embedding(vocab_size, embed_dim)
        self.position_embed = nn.Embedding(max_len, embed_dim)
        self.norm = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(0.1)

    def forward(self, input_ids):
        positions = torch.arange(0, input_ids.size(1)).unsqueeze(0).to(input_ids.device)
        x = self.token_embed(input_ids) + self.position_embed(positions)
        return self.dropout(self.norm(x))

class MultiHeadSelfAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)
        self.out_proj = nn.Linear(embed_dim, embed_dim)
        self.dropout = nn.Dropout(0.1)

    def forward(self, x):
        B, T, D = x.size()
        Q = self.q_proj(x)
        K = self.k_proj(x)
        V = self.v_proj(x)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (D ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        out = torch.matmul(weights, V)
        return self.dropout(self.out_proj(out))

class CustomTransformerBlock(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_hidden=512):
        super().__init__()
        self.attn = MultiHeadSelfAttention(embed_dim, num_heads)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.ff = nn.Sequential(
            nn.Linear(embed_dim, ff_hidden),
            nn.ReLU(),
            nn.Linear(ff_hidden, embed_dim),
        )
        self.norm2 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(0.1)

    def forward(self, x):
        x = self.norm1(x + self.attn(x))
        x = self.norm2(x + self.dropout(self.ff(x)))
        return x

class RoBERTaForMaskedLM(nn.Module):
    def __init__(self, vocab_size, embed_dim=256, num_layers=4, max_len=128):
        super().__init__()
        self.embedding = RoBERTaEmbedding(vocab_size, embed_dim, max_len)
        self.encoder = nn.Sequential(*[
            CustomTransformerBlock(embed_dim, num_heads=8)
            for _ in range(num_layers)
        ])
        self.lm_head = nn.Linear(embed_dim, vocab_size)

    def forward(self, input_ids):
        x = self.embedding(input_ids)
        x = self.encoder(x)
        return self.lm_head(x)

# ----------------------------
# Load Model
# ----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = RoBERTaForMaskedLM(len(vocab))
model.load_state_dict(torch.load("chemBELModel.pth", map_location=device))
model.to(device)
model.eval()

# ----------------------------
# Prediction Functions
# ----------------------------
def encode_input(smiles, tokenizer, vocab):
    tokens = []
    encoded = tokenizer.encode(smiles)
    for token in encoded.tokens:
        if token == "<mask>":
            tokens.append(vocab["<mask>"])
        else:
            tokens.append(vocab.get(token, vocab["[UNK]"]))
    return torch.tensor(tokens).unsqueeze(0).to(device)

def predict(smiles_input):
    input_ids = encode_input(smiles_input, tokenizer, vocab)
    mask_token_id = vocab["<mask>"]
    mask_indices = (input_ids == mask_token_id).nonzero(as_tuple=True)[1]
    
    if len(mask_indices) == 0:
        return {"error": "No <mask> token found in input!"}

    with torch.no_grad():
        logits = model(input_ids)
        mask_logits = logits[0, mask_indices[0].item()]
        probs = F.softmax(mask_logits, dim=-1)
        topk_probs, topk_indices = torch.topk(probs, k=5)
        
        results = [
            f"{list(vocab.keys())[list(vocab.values()).index(token_id.item())]} ({prob.item():.4f})"
            for prob, token_id in zip(topk_probs, topk_indices)
        ]
        
    return {"predictions": results}

# ----------------------------
# Flask Routes
# ----------------------------
@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict_view():
    if request.method == 'OPTIONS':
        return jsonify({"status": "preflight"}), 200
        
    try:
        data = request.get_json()
        if not data or 'smiles_input' not in data:
            return jsonify({"error": "Missing smiles_input"}), 400
            
        result = predict(data['smiles_input'])
        if 'error' in result:
            return jsonify(result), 400
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=4000)