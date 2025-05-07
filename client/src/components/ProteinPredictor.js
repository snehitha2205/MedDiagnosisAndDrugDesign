import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import * as $3Dmol from '3dmol';
import './ProteinPredictor.css';

const ProteinPredictor = () => {
  const [sequence, setSequence] = useState('MGSSHHHHHHSSGLVPRGSHMRGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCSLEDPAANKARKEAELAAATAEQ');
  const [pdbData, setPdbData] = useState(null);
  const [plDDT, setPlDDT] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationStyle, setVisualizationStyle] = useState('cartoon');
  const [colorScheme, setColorScheme] = useState('spectrum');
  const [sequenceLength, setSequenceLength] = useState(0);
  const [predictionSource, setPredictionSource] = useState(null);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [viewerStatus, setViewerStatus] = useState('initializing');
  const [isRotating, setIsRotating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(5);
  const [secondaryStructure, setSecondaryStructure] = useState(null);
  
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const rotationIntervalRef = useRef(null);

  const exampleSequences = [
    {
      name: "Default Example",
      sequence: "MGSSHHHHHHSSGLVPRGSHMRGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCSLEDPAANKARKEAELAAATAEQ"
    },
    {
      name: "Short Example",
      sequence: "MKLLILTCLVAVALARPKLPTTASAAAKKK"
    },
    {
      name: "Enzyme Example",
      sequence: "MKLFVALYFMVVSIGNVLSSLLTANLLAVVLPGGTTLTLADKLVTDLYVKPTVADYSVGLSDKLLSSVTVVQVLKPNYIDKLLDITDADOITKELVKQ"
    }
  ];

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLAvailable(false);
      setError('WebGL not supported. Try Chrome/Firefox with hardware acceleration enabled.');
    }
  }, []);

  // Update sequence length
  useEffect(() => {
    setSequenceLength(sequence.length);
  }, [sequence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
      if (viewerRef.current) {
        viewerRef.current.clear();
      }
    };
  }, []);

  const renderProtein = useCallback((pdb) => {
    if (!viewerRef.current) return;

    try {
      setViewerStatus('rendering');
      stopRotation();
      viewerRef.current.removeAllModels();
      viewerRef.current.addModel(pdb, 'pdb');
      
      const style = {};
      if (secondaryStructure && colorScheme === 'ss') {
        style.cartoon = {
          colorfunc: (atom) => {
            const resNum = atom.resi;
            const ss = secondaryStructure.find(s => s.resNum === resNum)?.ssType;
            return ss === 'H' ? 'blue' : ss === 'E' ? 'red' : 'yellow';
          }
        };
      } else {
        switch (visualizationStyle) {
          case 'stick': 
            style.stick = { radius: 0.3, color: colorScheme }; 
            break;
          case 'sphere': 
            style.sphere = { scale: 0.6, color: colorScheme }; 
            break;
          default: 
            style.cartoon = { color: colorScheme };
        }
      }
      
      viewerRef.current.setStyle({}, style);
      viewerRef.current.zoomTo();
      viewerRef.current.zoom(1.2, 1000);
      
      if (isRotating) {
        startRotation();
      }
      
      viewerRef.current.render();
      setViewerStatus('ready');
    } catch (err) {
      console.error('Rendering error:', err);
      setViewerStatus('failed');
      setError('Failed to render protein structure');
    }
  }, [visualizationStyle, colorScheme, isRotating, rotationSpeed, secondaryStructure]);

  // Initialize viewer
  useEffect(() => {
    if (!webGLAvailable || !containerRef.current) return;

    const initViewer = () => {
      try {
        if (viewerRef.current) {
          viewerRef.current.clear();
        }

        const config = {
          backgroundColor: 'white',
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        };

        const viewer = $3Dmol.createViewer(containerRef.current, config);
        viewerRef.current = viewer;
        setViewerStatus('ready');
        
        if (pdbData) {
          renderProtein(pdbData);
        }
      } catch (err) {
        console.error('Viewer initialization failed:', err);
        setViewerStatus('failed');
        setError('Failed to initialize 3D viewer. Please refresh the page.');
      }
    };

    const timer = setTimeout(initViewer, 100);
    return () => clearTimeout(timer);
  }, [webGLAvailable, pdbData, renderProtein]);

  useEffect(() => {
    if (pdbData && viewerRef.current) {
      renderProtein(pdbData);
    }
  }, [visualizationStyle, colorScheme, pdbData, renderProtein]);

  const startRotation = () => {
    stopRotation();
    
    rotationIntervalRef.current = setInterval(() => {
      if (viewerRef.current) {
        viewerRef.current.rotate(0.5 * (rotationSpeed / 5), 'y');
        viewerRef.current.render();
      }
    }, 100);
  };

  const stopRotation = () => {
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  };

  const toggleRotation = () => {
    const newRotationState = !isRotating;
    setIsRotating(newRotationState);
    
    if (newRotationState) {
      startRotation();
    } else {
      stopRotation();
    }
  };

  const handleSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    setRotationSpeed(speed);
    if (isRotating) {
      startRotation();
    }
  };

  const predictStructure = async () => {
    if (sequence.length < 10) {
      setError('Sequence too short (minimum 10 amino acids)');
      return;
    }

    setLoading(true);
    setError(null);
    setPdbData(null);
    setPlDDT(null);
    setSecondaryStructure(null);
    setPredictionSource(null);
    setIsRotating(false);
    
    try {
      const response = await axios.post(
        'https://node-service-o256.onrender.com/api/predict',
        { sequence },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000
        }
      );
      
      setPdbData(response.data.pdb);
      setPlDDT(response.data.plDDT);
      setPredictionSource(response.data.source);
      predictSecondaryStructure(response.data.pdb);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.error || 'Prediction failed. Please check your sequence and try again.');
    } finally {
      setLoading(false);
    }
  };

  const predictSecondaryStructure = (pdbData) => {
    try {
      const lines = pdbData.split('\n');
      const atoms = [];
      
      lines.forEach(line => {
        if (line.startsWith('ATOM')) {
          const atomType = line.substring(12, 16).trim();
          const resNum = parseInt(line.substring(22, 26).trim());
          const x = parseFloat(line.substring(30, 38));
          const y = parseFloat(line.substring(38, 46));
          const z = parseFloat(line.substring(46, 54));
          const bFactor = parseFloat(line.substring(60, 66));
          
          atoms.push({
            resNum,
            atomType,
            x, y, z,
            bFactor
          });
        }
      });
      
      const structure = [];
      const residues = {};
      
      atoms.forEach(atom => {
        if (!residues[atom.resNum]) {
          residues[atom.resNum] = [];
        }
        residues[atom.resNum].push(atom);
      });
      
      Object.keys(residues).sort((a,b) => a-b).forEach((resNum, index, arr) => {
        const resAtoms = residues[resNum];
        const caAtom = resAtoms.find(a => a.atomType === 'CA');
        if (!caAtom) return;
        
        const prevResNum = parseInt(arr[index-1]);
        const nextResNum = parseInt(arr[index+1]);
        
        const prevCA = prevResNum ? residues[prevResNum]?.find(a => a.atomType === 'CA') : null;
        const nextCA = nextResNum ? residues[nextResNum]?.find(a => a.atomType === 'CA') : null;
        
        let ssType = 'C';
        
        if (prevCA && nextCA) {
          const v1 = {
            x: prevCA.x - caAtom.x,
            y: prevCA.y - caAtom.y,
            z: prevCA.z - caAtom.z
          };
          const v2 = {
            x: nextCA.x - caAtom.x,
            y: nextCA.y - caAtom.y,
            z: nextCA.z - caAtom.z
          };
          
          const dot = v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
          const mag1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z);
          const mag2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y + v2.z*v2.z);
          const angle = Math.acos(dot/(mag1*mag2)) * (180/Math.PI);
          
          if (angle > 70 && angle < 120) {
            ssType = 'H';
          } 
          else if (angle > 120 && angle < 180) {
            ssType = 'E';
          }
        }
        
        if (ssType === 'C' && caAtom.bFactor > 0) {
          ssType = caAtom.bFactor > 70 ? 'H' : caAtom.bFactor > 50 ? 'E' : 'C';
        }
        
        structure.push({
          resNum: parseInt(resNum),
          ssType
        });
      });
      
      setSecondaryStructure(structure);
    } catch (err) {
      console.error('Secondary structure prediction error:', err);
    }
  };

  const downloadPDB = () => {
    const blob = new Blob([pdbData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predicted_structure.pdb';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = (example) => {
    setSequence(example.sequence);
    setPdbData(null);
    setPlDDT(null);
    setSecondaryStructure(null);
    setError(null);
    setPredictionSource(null);
    setIsRotating(false);
  };

  return (
    <div className="neon-app-container">
      {!webGLAvailable && (
        <div className="neon-error-overlay">
          <div className="neon-error-card">
            <h2>⚠️ WebGL Not Supported</h2>
            <p>Your browser doesn't support WebGL which is required for 3D visualization.</p>
            <p>Try Google Chrome or Firefox with hardware acceleration enabled.</p>
          </div>
        </div>
      )}
      
      <div className="neon-main-grid">
        <div className="neon-control-panel">
          <div className="neon-panel-header">
            <div className="neon-logo">
              <span className="neon-logo-icon">🧬</span>
              <h1>ProteinVision</h1>
            </div>
            <p className="neon-tagline">AI-powered protein structure prediction</p>
          </div>

          {/* Prediction Results at the Top */}
          {(predictionSource || plDDT) && (
  <div className="neon-result-card neon-prediction-summary">
    <h4>Prediction Results</h4>
    {predictionSource && (
      <div className="neon-result-detail">
        <span>Model:</span>
        <span className="neon-result-value">{predictionSource}</span>
      </div>
    )}
    {plDDT !== null && !isNaN(plDDT) && (
      <div className="neon-plddt-display">
        <div className="neon-plddt-header">
          <div className="neon-plddt-title">Model Confidence (pLDDT)</div>
          <div className="neon-plddt-score">
            {typeof plDDT === 'number' ? plDDT.toFixed(1) : plDDT}
          </div>
        </div>
        <div className="neon-plddt-value">
          <div 
            className="neon-plddt-bar" 
            style={{width: `${plDDT}%`}}
          ></div>
        </div>
        <div className="neon-plddt-labels">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    )}
  </div>
)}

          <div className="neon-section">
            <h3 className="neon-section-title">Input Sequence</h3>
            <div className="neon-sequence-info">
              <span className="neon-sequence-length">{sequenceLength} residues</span>
              <select 
                onChange={(e) => loadExample(exampleSequences[e.target.value])}
                className="neon-example-select"
                disabled={loading}
              >
                <option value="">Load example...</option>
                {exampleSequences.map((example, index) => (
                  <option key={index} value={index}>{example.name}</option>
                ))}
              </select>
            </div>
            <textarea
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              rows={8}
              placeholder="Enter protein sequence (FASTA format)..."
              className="neon-sequence-input"
              disabled={loading}
            />
          </div>
          
          <div className="neon-button-group">
            <button 
              onClick={predictStructure} 
              disabled={loading || sequence.length < 10}
              className={`neon-predict-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="neon-spinner"></span>
                  Processing...
                </>
              ) : 'Predict Structure'}
            </button>
            
            {pdbData && (
              <button onClick={downloadPDB} className="neon-download-button">
                Download PDB
              </button>
            )}
          </div>
          
          {error && (
            <div className="neon-alert-error">
              <p>{error}</p>
            </div>
          )}
          
          {secondaryStructure && (
            <div className="neon-result-card">
              <h4>Secondary Structure</h4>
              <div className="neon-ss-visualization">
                {sequence.split('').map((char, index) => {
                  const ss = secondaryStructure.find(s => s.resNum === index + 1);
                  const ssType = ss ? ss.ssType : 'C';
                  return (
                    <div 
                      key={index}
                      className={`neon-ss-element neon-ss-${ssType}`}
                      title={`Residue ${index + 1}: ${char} (${getSSName(ssType)})`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
              <div className="neon-ss-legend">
                <div className="neon-ss-legend-item">
                  <span className="neon-ss-sample neon-ss-H"></span> Helix (H)
                </div>
                <div className="neon-ss-legend-item">
                  <span className="neon-ss-sample neon-ss-E"></span> Sheet (E)
                </div>
                <div className="neon-ss-legend-item">
                  <span className="neon-ss-sample neon-ss-C"></span> Coil (C)
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="neon-visualization-area">
          {!pdbData ? (
            <div className="neon-welcome-screen">
              <div className="neon-welcome-content">
                <h2>Protein Structure Predictor</h2>
                <p>Enter a protein sequence to visualize its predicted 3D structure</p>
                <div className="neon-features-grid">
                  <div className="neon-feature-card">
                    <div className="neon-feature-icon">⚡</div>
                    <h4>Fast Prediction</h4>
                    <p>Get results in seconds using state-of-the-art AI models</p>
                  </div>
                  <div className="neon-feature-card">
                    <div className="neon-feature-icon">👁️</div>
                    <h4>3D Visualization</h4>
                    <p>Interactive molecular viewer with multiple display styles</p>
                  </div>
                  <div className="neon-feature-card">
                    <div className="neon-feature-icon">📊</div>
                    <h4>Quality Metrics</h4>
                    <p>Detailed confidence scores and structure analysis</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="neon-viewer-header">
                <h3>3D Protein Structure</h3>
                <div className="neon-viewer-controls">
                  <select 
                    value={visualizationStyle} 
                    onChange={(e) => setVisualizationStyle(e.target.value)}
                    disabled={viewerStatus !== 'ready'}
                    className="neon-viewer-select"
                  >
                    <option value="cartoon">Cartoon</option>
                    <option value="stick">Stick</option>
                    <option value="sphere">Sphere</option>
                  </select>
                  
                  <select 
                    value={colorScheme} 
                    onChange={(e) => setColorScheme(e.target.value)}
                    disabled={viewerStatus !== 'ready'}
                    className="neon-viewer-select"
                  >
                    <option value="spectrum">Spectrum</option>
                    <option value="ss">Secondary Structure</option>
                    <option value="residue">Residue Index</option>
                    <option value="chain">Chain</option>
                  </select>
                  
                  <button 
                    onClick={toggleRotation}
                    className={`neon-viewer-button ${isRotating ? 'active' : ''}`}
                  >
                    {isRotating ? '🛑 Stop' : '🔄 Rotate'}
                  </button>
                  
                  <div className="neon-speed-control">
                    <label>Speed:</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={rotationSpeed}
                      onChange={handleSpeedChange}
                    />
                  </div>
                </div>
              </div>
              
              <div 
                ref={containerRef}
                className={`neon-protein-viewer ${viewerStatus !== 'ready' ? 'loading' : ''}`}
              >
                {viewerStatus === 'initializing' && (
                  <div className="neon-viewer-message">Initializing 3D viewer...</div>
                )}
                {viewerStatus === 'rendering' && (
                  <div className="neon-viewer-message">Rendering protein structure...</div>
                )}
                {viewerStatus === 'failed' && (
                  <div className="neon-viewer-message error">Viewer initialization failed</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function getSSName(code) {
  switch(code) {
    case 'H': return 'Alpha Helix';
    case 'E': return 'Beta Sheet';
    case 'C': return 'Random Coil';
    default: return 'Unknown';
  }
}

export default ProteinPredictor;