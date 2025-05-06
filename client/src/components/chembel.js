import React, { useState } from 'react';
import axios from 'axios';
import './chembel.css';

function App() {
  const [smiles, setSmiles] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!smiles.includes('<mask>')) {
      setError('Input must contain <mask> token');
      setPredictions([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:4000/predict', 
        { smiles_input: smiles },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.error) {
        setError(response.data.error);
        setPredictions([]);
      } else {
        const processedPredictions = (response.data.predictions || response.data.prediction || []).map(pred => {
          if (typeof pred === 'string') {
            const match = pred.match(/^(.+?)\s*\((.*?)\)$/);
            if (match) {
              const token = match[1].trim();
              const confidence = match[2].trim();
              return {
                token,
                confidence: isNaN(confidence) || confidence === 'NaN' ? 'N/A' : parseFloat(confidence).toFixed(4)
              };
            }
            return { token: pred, confidence: 'N/A' };
          }
          return { token: pred, confidence: 'N/A' };
        });
        setPredictions(processedPredictions);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed');
      setPredictions([]);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setSmiles('CC(<mask>)N=O');
    setPredictions([]);
    setError('');
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      });
  };

  const handleCopy = (token, index) => {
    const newSmiles = smiles.replace('<mask>', token);
    copyToClipboard(newSmiles, index);
  };

  return (
    <div className="chembel-app">
      <div className="chembel-hero">
        <h1>SMILES <span>Masked</span> Prediction</h1>
        <p className="chembel-subtitle">Discover potential molecular fragments for Alzheimer's research</p>
      </div>

      <div className="chembel-main-container">
        {/* Input Section */}
        <div className="chembel-input-section">
          <div className="chembel-input-card">
            <h2><span className="chembel-highlight">1.</span> Enter your SMILES</h2>
            <p>Include <span className="chembel-mask-token">&lt;mask&gt;</span> to mark prediction points</p>
            
            <form onSubmit={handleSubmit}>
              <div className="chembel-input-wrapper">
                <input
                  type="text"
                  value={smiles}
                  onChange={(e) => setSmiles(e.target.value)}
                  placeholder="CC(<mask>)C=O"
                  className="chembel-smiles-input"
                  required
                />
                <button 
                  type="button" 
                  className="chembel-example-btn"
                  onClick={loadExample}
                >
                  Example
                </button>
              </div>
              
              <button 
                type="submit" 
                className="chembel-predict-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="chembel-spinner" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                    Predicting...
                  </>
                ) : 'Predict Fragments'}
              </button>
            </form>

            {error && (
              <div className="chembel-error-message">
                <svg className="chembel-error-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="chembel-results-section">
          <h2><span className="chembel-highlight">2.</span> Predicted Fragments</h2>
          <p>Potential therapeutic candidates for Alzheimer's disease</p>
          
          {predictions.length > 0 ? (
            <div className="chembel-predictions-grid">
              {predictions.map((pred, index) => (
                <div 
                  key={index} 
                  className={`chembel-prediction-card ${index === 0 ? 'chembel-top-prediction' : ''}`}
                >
                  <div className="chembel-prediction-header">
                    <div className="chembel-prediction-badge">#{index + 1}</div>
                    <div className="chembel-prediction-structure">{pred.token}</div>
                  </div>
                  
                  <div className="chembel-confidence-container">
                    <div className="chembel-confidence-label">Confidence:</div>
                    <div className="chembel-confidence-bar">
                      <div 
                        className="chembel-confidence-fill"
                        style={{ width: `${pred.confidence === 'N/A' ? 0 : Math.min(100, parseFloat(pred.confidence) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="chembel-confidence-value">{pred.confidence}</div>
                  </div>
                  
                  <button 
                    className="chembel-copy-btn"
                    onClick={() => handleCopy(pred.token, index)}
                  >
                    {copiedIndex === index ? (
                      <>
                        <svg className="chembel-icon" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="chembel-icon" viewBox="0 0 24 24">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="chembel-empty-state">
              <svg className="chembel-molecule-icon" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1V9a1 1 0 0 1 1-1h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              </svg>
              <p>Your predictions will appear here</p>
              <small>Enter a SMILES string with &lt;mask&gt; and click predict</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;