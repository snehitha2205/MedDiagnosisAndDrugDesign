from imports import *

import logging
import traceback

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

"""

VIT MODEL

"""

vit, le = load_model_vit("dl_models/vit_model.pkl")
"""
CHEMBERT-A MODEL

"""

bpe_model = BPE.from_file("datasets/updated_vocab.json", "datasets/merges.txt")
tokenizer = Tokenizer(bpe_model)
tokenizer.add_special_tokens(['<mask>'])
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
with open("datasets/updated_vocab.json", "r") as f:
    vocab = json.load(f)
chembert_model = RoBERTaForMaskedLM(len(vocab))
chembert_model.load_state_dict(torch.load("dl_models/model.pth", map_location=device))
chembert_model.to(device)
chembert_model.eval()

"""
QSAR MODEL nd STACK RNN MODEL

"""
n_hidden = 512
batch_size = 128
num_epochs = 50
lr = 0.005

model_params = {
    'embedding': "finger_prints",
    'embedding_params': {
        'embedding_dim': n_hidden,
        'fingerprint_dim': 2048
    },
    'encoder': "RNNEncoder",
    'encoder_params': {
        'input_size': 2048,
        'layer': "GRU",
        'encoder_dim': n_hidden,
        'n_layers': 2,
        'dropout': 0.8
    },
    'mlp': "mlp",
    'mlp_params': {
        'input_size': n_hidden,
        'n_layers': 2,
        'hidden_size': [n_hidden, 1],
        'activation': [F.relu, identity],
        'dropout': 0.0
    }
}

gen_data_path = 'datasets/chembl_22_clean_1576904_sorted_std_final (1).smi'

tokens = ['<', '>', '#', '%', ')', '(', '+', '-', '/', '.', '1', '0', '3', '2', '5', '4', '7',
          '6', '9', '8', '=', 'A', '@', 'C', 'B', 'F', 'I', 'H', 'O', 'N', 'P', 'S', '[', ']',
          '\\', 'c', 'e', 'i', 'l', 'o', 'n', 'p', 's', 'r', '\n']
predictor_pic50 = QSAR(model_params)
predictor_logP = QSAR(model_params)
predictor_pic50.load_model('dl_models/qsar_model_pic50.pt')
predictor_logP.load_model('dl_models/qsar_model_logP.pt')
gen_data = GeneratorData(training_data_path=gen_data_path, delimiter='\t',
                         cols_to_read=[0], keep_header=True, tokens=tokens)
hidden_size = 1500
stack_width = 1500
stack_depth = 200
layer_type = 'GRU'
lr = 0.001
optimizer_instance = torch.optim.Adadelta
my_generator = StackAugmentedRNN(input_size=gen_data.n_characters, hidden_size=hidden_size,
                                 output_size=gen_data.n_characters, layer_type=layer_type,
                                 n_layers=1, is_bidirectional=False, has_stack=True,
                                 stack_width=stack_width, stack_depth=stack_depth,
                                 use_cuda=None,
                                 optimizer_instance=optimizer_instance, lr=lr)
my_generator.load_model('dl_models/latest')

my_generator_logp = StackAugmentedRNN(input_size=gen_data.n_characters, hidden_size=hidden_size,
                                      output_size=gen_data.n_characters, layer_type=layer_type,
                                      n_layers=1, is_bidirectional=False, has_stack=True,
                                      stack_width=stack_width, stack_depth=stack_depth,
                                      use_cuda=None,
                                      optimizer_instance=optimizer_instance, lr=lr)
my_generator_logp.load_model('dl_models/logPoptim')

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER1 = os.path.join(BASE_DIR, "uploads")
OUTPUT_FOLDER1 = os.path.join(BASE_DIR, "static")
MODEL_PATHS = {
    "brain": os.path.join(BASE_DIR, "dl_models", "model256.keras"),
    "lung": os.path.join(BASE_DIR, "dl_models", "lungmodel.keras")
}

os.makedirs(UPLOAD_FOLDER1, exist_ok=True)
os.makedirs(OUTPUT_FOLDER1, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_FOLDER1, "mask_images"), exist_ok=True)


# Load model function
def load_model(model_type: str):
    model_path = MODEL_PATHS.get(model_type)
    if not model_path or not os.path.exists(model_path):
        return None, f"Model file not found: {model_path}"

    try:
        model = tf.keras.models.load_model(model_path, custom_objects={"dice_loss": dice_loss, "dice_coef": dice_coef})
        return model, None
    except Exception as e:
        return None, f"Failed to load model: {e}"


# Process image function
async def process_image(file: UploadFile, model):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            return None, f"Unable to read image: {file.filename}"

        image = cv2.resize(image, (256, 256)) / 255.0
        patches = patchify(image, (16, 16, 3), 16).reshape(1, -1, 16 * 16 * 3)

        pred = model.predict(patches, verbose=0)[0]
        pred_mask = np.where(pred > 0.5, 255, 0).astype(np.uint8)  # Binary mask (0 or 255)
        pred_mask_resized = pred_mask.reshape((256, 256))

        # Create a color mask (e.g., red overlay)
        color_mask = np.zeros_like(image, dtype=np.uint8)
        color_mask[:, :, 0] = pred_mask_resized  # Red channel

        # Overlay the color mask on the original image (optional, for visualization)
        overlay = cv2.addWeighted(image.astype(np.float32), 0.7, color_mask.astype(np.float32) / 255.0, 0.3, 0)
        overlay_bgr = (overlay * 255).astype(np.uint8)

        # Save the mask (you might want to save the overlay instead or both)
        mask_filename = f"mask_{uuid.uuid4().hex}_{file.filename}"
        mask_output_path = os.path.join(OUTPUT_FOLDER1, "mask_images", mask_filename)
        print("/static/mask_images/" + mask_filename)
        if cv2.imwrite(mask_output_path, pred_mask_resized):
            return "/static/mask_images/" + mask_filename, True  # Return path relative to public folder

        return None, "Failed to save prediction mask"

    except Exception as e:
        return None, f"Error processing image: {e}"


BASE_DIR = Path(__file__).resolve().parent
# No longer using FRONTEND_DIR
# FRONTEND_DIR = BASE_DIR.parent / "frontend"
# PUBLIC_FOLDER = FRONTEND_DIR / "public"
# ORIGINAL_NII_PUBLIC_FOLDER = PUBLIC_FOLDER / "original_nii"
# PREDICTED_NII_PUBLIC_FOLDER = PUBLIC_FOLDER / "predicted_nii"

# Define upload and processing directories
UPLOAD_FOLDER = BASE_DIR / "temp_nii_uploads"
SLICES_FOLDER = BASE_DIR / "temp_nii_slices"
OUTPUT_MASKS_FOLDER = BASE_DIR / "temp_nii_masks"
STATIC_DIR = BASE_DIR / "static"  # Define the static folder in the current directory
ORIGINAL_NII_PUBLIC_FOLDER = STATIC_DIR / "original_nii"  # create original and predicted nii folders
PREDICTED_NII_PUBLIC_FOLDER = STATIC_DIR / "predicted_nii"


# Ensure output directories exist
# ORIGINAL_NII_PUBLIC_FOLDER.mkdir(parents=True, exist_ok=True) # changed
# PREDICTED_NII_PUBLIC_FOLDER.mkdir(parents=True, exist_ok=True) # changed
STATIC_DIR.mkdir(parents=True, exist_ok=True)
ORIGINAL_NII_PUBLIC_FOLDER.mkdir(parents=True, exist_ok=True)
PREDICTED_NII_PUBLIC_FOLDER.mkdir(parents=True, exist_ok=True)
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
SLICES_FOLDER.mkdir(parents=True, exist_ok=True)
OUTPUT_MASKS_FOLDER.mkdir(parents=True, exist_ok=True)

# Configuration dictionary
cf = {
    "image_size": 256,
    "patch_size": 16,
    "num_channels": 3,
    "flattened_patch_dim": 16 * 16 * 3,
}

# Declare global variables

filepath1 = None  # Global variable for original file path
filepath2 = None  # Global variable for predicted file path


async def process_nii(file: UploadFile, model):
    """Full pipeline: slices -> predict masks -> rebuild NIfTI, with output in current directory."""
    input_filename = f"uploaded_{uuid.uuid4().hex}_{file.filename}"
    input_nii_path = UPLOAD_FOLDER / input_filename
    predicted_nii_filename = f"predicted_{uuid.uuid4().hex}_{file.filename}"
    predicted_nii_path_server = PREDICTED_NII_PUBLIC_FOLDER / predicted_nii_filename  # Changed
    original_filename_moved = f"original_{uuid.uuid4().hex}_{file.filename}"
    original_file_path_moved = ORIGINAL_NII_PUBLIC_FOLDER / original_filename_moved

    # Clean previous slices and masks for this processing
    shutil.rmtree(SLICES_FOLDER, ignore_errors=True)
    SLICES_FOLDER.mkdir(exist_ok=True)
    shutil.rmtree(OUTPUT_MASKS_FOLDER, ignore_errors=True)
    OUTPUT_MASKS_FOLDER.mkdir(exist_ok=True)

    try:
        # Save the uploaded file temporarily
        with open(input_nii_path, "wb") as f:
            while contents := await file.read(1024 * 1024):
                f.write(contents)

        nii_img = nib.load(input_nii_path)
        nii_data = nii_img.get_fdata()
        depth = nii_data.shape[0]  # slices along axis 0

        # Step 1: Slice the NIfTI
        for i in range(depth):
            slice_img = nii_data[i, :, :]
            slice_img = np.clip(slice_img, 0, 255).astype(np.uint8)
            slice_resized = cv2.resize(slice_img, (512, 512), interpolation=cv2.INTER_AREA)
            slice_rgb = cv2.cvtColor(slice_resized, cv2.COLOR_GRAY2BGR)
            slice_path = SLICES_FOLDER / f"slice_{i:03d}.png"
            cv2.imwrite(str(slice_path), slice_rgb)

        # Step 2: Predict masks
        image_files = sorted(os.listdir(SLICES_FOLDER))
        predicted_mask_paths = []

        for image_name in image_files:
            input_image_path = SLICES_FOLDER / image_name
            image = cv2.imread(str(input_image_path), cv2.IMREAD_COLOR)
            if image is None:
                continue

            resized = cv2.resize(image, (cf["image_size"], cf["image_size"]), interpolation=cv2.INTER_LANCZOS4)
            norm = resized / 255.0
            patches = patchify(norm, (cf["patch_size"], cf["patch_size"], cf["num_channels"]), cf["patch_size"])
            patches = patches.reshape(-1, cf["flattened_patch_dim"])
            patches = np.expand_dims(patches, axis=0)
            pred = model.predict(patches, verbose=0)[0]
            pred = (pred * 255).astype(np.uint8)
            if len(pred.shape) == 3 and pred.shape[-1] > 1:
                pred = cv2.cvtColor(pred, cv2.COLOR_BGR2GRAY)
            mask_resized = cv2.resize(pred, (cf["image_size"], cf["image_size"]), interpolation=cv2.INTER_NEAREST)
            _, mask_thresh = cv2.threshold(mask_resized, 127, 255, cv2.THRESH_BINARY)
            output_mask_path = OUTPUT_MASKS_FOLDER / f"mask_{image_name}"
            cv2.imwrite(str(output_mask_path), mask_thresh)
            predicted_mask_paths.append(output_mask_path)

        # Step 3: Stack masks back into a NIfTI
        mask_files = sorted(os.listdir(OUTPUT_MASKS_FOLDER), key=lambda x: int("".join(filter(str.isdigit, x))))
        mask_slices = []

        for fname in mask_files:
            path = OUTPUT_MASKS_FOLDER / fname
            img = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue
            resized = cv2.resize(img, (512, 512), interpolation=cv2.INTER_NEAREST)
            mask_slices.append(resized)

        if not mask_slices:
            raise Exception("No masks were generated.")

        predicted_volume = np.stack(mask_slices, axis=0)
        nii_pred = nib.Nifti1Image(predicted_volume, affine=np.eye(4))
        nib.save(nii_pred, predicted_nii_path_server)  # Save to the new location
        predicted_file_url = f"/static/predicted_nii/{predicted_nii_filename}"  # changed
        # Step 4: Move the original uploaded file to the public folder
        # original_filename_moved = f"original_{uuid.uuid4().hex}_{file.filename}"
        # original_file_path_moved = ORIGINAL_NII_PUBLIC_FOLDER / original_filename_moved # changed
        shutil.move(str(input_nii_path), str(original_file_path_moved))  # Save to the new location.
        original_file_url = f"/static/original_nii/{original_filename_moved}"
        predicted_file_url = f"/static/predicted_nii/{predicted_nii_filename}"  # changed
        global filepath1, filepath2
        filepath1 = original_file_url
        filepath2 = predicted_file_url
        print(filepath1)
        print({"success": True, "mask_path": predicted_file_url, "original_path": original_file_url})
        return {"success": True, "mask_path": predicted_file_url, "original_path": original_file_url}

    except nib.NiftiError as e:
        print(f"NiBabel Error: {e}")
        return {"success": False, "error": f"NiBabel Error: {e}"}
    except Exception as e:
        print(f"Error processing NII file: {e}")
        return {"success": False, "error": f"Error processing NII file: {e}"}
    finally:
        # Clean up the temporary uploaded file (if not moved) and temp folders
        if