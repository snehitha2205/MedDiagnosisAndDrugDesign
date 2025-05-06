import React, { useState } from 'react';
import axios from 'axios';
import './Visualization.css';

const Visualization = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const uploadNiiFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/upload_nii', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: false
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to upload NIfTI file');
        }
    };

    const uploadImage = async (file, modelType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model_type', modelType);

        try {
            const response = await axios.post('http://localhost:8000/api/upload_image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: false
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to upload image');
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadError(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        setSelectedFile(file);
        setUploadError(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('No file selected.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            let response;
            if (selectedFile.name.endsWith('.nii.gz')) {
                response = await uploadNiiFile(selectedFile);
            } else {
                response = await uploadImage(selectedFile, 'lung');
            }

            if (response && response.success) {
                // Redirect to viewer with the image paths
                const originalPath = encodeURIComponent(response.original_path || response.mask_path);
                const predictedPath = encodeURIComponent(response.predicted_path || '');
                
                window.location.href = `http://localhost:8000/viewer?original=${originalPath}&predicted=${predictedPath}`;
            } else {
                setUploadError(response?.error || 'Upload failed');
            }
        } catch (error) {
            setUploadError(error.message || 'Upload error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="visualization-container">
            <header className="visualization-header">
                <h1>3D Diagnosis Viewer</h1>
                <p>Visualize and interact with 3D medical imaging data.</p>
            </header>

            <main className="visualization-main">
                <div
                    className={`upload-area ${dragActive ? 'active' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        accept=".nii.gz,image/*"
                        hidden
                        id="fileUpload"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="fileUpload" className="browse-button">
                        {uploading ? 'Uploading...' : 'Drag & drop or Browse files'}
                    </label>
                    {selectedFile && <p>Selected: {selectedFile.name}</p>}
                    {uploadError && <p className="error-message">{uploadError}</p>}
                </div>

                <button
                    className="predict-button"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                >
                    {selectedFile?.name.endsWith('.nii.gz') ? 'Predict & Visualize' : 'Upload Image'}
                </button>

                {uploading && <p>Processing and redirecting...</p>}
            </main>
        </div>
    );
};

export default Visualization;