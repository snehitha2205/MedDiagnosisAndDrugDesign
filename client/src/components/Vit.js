import React, { useState } from 'react';
import './classifier.css';

function App() {
  const [smiles, setSmiles] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!smiles.trim()) {
      setError('Please enter a valid SMILES string');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5003/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ smiles }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }
      
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setSmiles('CCO');
    setError(null);
    setPrediction(null);
  };

  return (
    <div className="classifier-container">
      <div className="classifier-card">
        <header className="classifier-header">
          <h1 className="classifier-title">Alzheimer Active/Inactive ligand classifier</h1>
          <p className="classifier-subtitle">Enter SMILES notation to predict molecular properties</p>
        </header>
        
        <div className="classifier-content">
          <form onSubmit={handleSubmit} className="classifier-form">
            <div className="form-group">
              <label htmlFor="smiles" className="input-label">SMILES Notation</label>
              <input
                type="text"
                id="smiles"
                className="input-field"
                value={smiles}
                onChange={(e) => setSmiles(e.target.value)}
                placeholder="e.g., CCO for ethanol"
                required
              />
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="primary-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-text">Analyzing...</span>
                ) : (
                  'Classify Molecule'
                )}
              </button>
              
              <button 
                type="button" 
                className="secondary-btn"
                onClick={loadExample}
              >
                Load Example
              </button>
            </div>
          </form>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {prediction && !error && (
            <div className="result-card">
              <h2 className="result-title">Classification Results</h2>
              <div className="result-item">
                <span className="result-label">Input SMILES:</span>
                <span className="result-value">{prediction.smiles}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Predicted Class:</span>
                <span className="result-value highlight">{prediction.predicted_class}</span>
              </div>
            </div>
          )}
        </div>
        
        <footer className="classifier-footer">
          <p>Powered by AI Molecular Analysis</p>
        </footer>
      </div>
    </div>
  );
}

export default App;