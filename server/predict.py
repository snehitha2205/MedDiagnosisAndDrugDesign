from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
import os
import sys
from rdkit import Chem
from rdkit.Chem.Draw import MolToImage
from io import BytesIO
import base64
from Transformer import Transformer

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {"origins": "*"}
})



# Initialize model and vocabularies once at startup
def init_model():
    root = os.path.dirname(__file__)
    protein_vocab = torch.load(os.path.join(root, 'protein-vocab.pt'))
    smiles_vocab = torch.load(os.path.join(root, 'smiles-vocab.pt'))
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = Transformer(
        src_tokens=len(protein_vocab),
        trg_tokens=len(smiles_vocab), 
        dim_model=256, 
        num_heads=8, 
        num_encoder_layers=6, 
        num_decoder_layers=6, 
        dropout_p=0.1
    ).to(device)
    model.load_state_dict(torch.load(os.path.join(root, 'checkpoint.pth'), map_location=torch.device('cpu')))
    
    return model, protein_vocab, smiles_vocab, device

model, protein_vocab, smiles_vocab, device = init_model()

# Helper functions
tokenize = lambda x: list(x)

def predict(model, input_sequence, max_length=150, PAD_token=1, SOS_token=2, EOS_token=3):
    model.eval()
    
    y_input = torch.tensor([[SOS_token]], dtype=torch.long, device=device)

    num_tokens = len(input_sequence[0])

    for _ in range(max_length):
        tgt_mask = model.get_tgt_mask(y_input.size(1)).to(device)
        pred = model(input_sequence, y_input, tgt_mask)
        next_item = pred.topk(1)[1].view(-1)[-1].item()
        next_item = torch.tensor([[next_item]], device=device)
        y_input = torch.cat((y_input, next_item), dim=1)

        if next_item.view(-1).item() == EOS_token or next_item.view(-1).item() == PAD_token:
            break

    return y_input.view(-1).tolist()

def protein_to_numbers(protein, protein_vocab):
    return [protein_vocab[token] for token in tokenize(protein)]

def smiles_to_string(smiles, smiles_vocab):
    return ''.join([smiles_vocab.get_itos()[word] for word in smiles])

def visualize_smiles(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        return None
    
    img = MolToImage(mol, size=(400, 400))
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return img_io

# API Routes
@app.route('/api/protein-to-smiles', methods=['POST'])
def convert_protein_to_smiles():
    data = request.json
    protein_sequence = data.get('input', '').strip()
    
    if not protein_sequence:
        return jsonify({'error': 'Please provide a protein sequence'}), 400
    
    try:
        input_tensor = torch.tensor([protein_to_numbers(protein_sequence, protein_vocab)], dtype=torch.long, device=device)
        result = predict(model, input_tensor)
        smiles = smiles_to_string(result[1:-1], smiles_vocab)
        
        response = {'smiles': smiles}
        
        if data.get('vis', False):
            img_io = visualize_smiles(smiles)
            if img_io:
                img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
                response['image'] = f"data:image/png;base64,{img_base64}"
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualize-smiles', methods=['POST'])
def visualize_smiles_endpoint():
    data = request.json
    smiles = data.get('smiles', '').strip()
    
    if not smiles:
        return jsonify({'error': 'Please provide a SMILES string'}), 400
    
    try:
        img_io = visualize_smiles(smiles)
        if not img_io:
            return jsonify({'error': 'Invalid SMILES string'}), 400
            
        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  


