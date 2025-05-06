// import React, { useState } from 'react';
// import axios from 'axios';
// import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiLayers, FiSearch, FiEye, FiArrowLeft } from 'react-icons/fi';
// import './ProteinToSmilesConverter.css';

// const ProteinToSmilesConverter = () => {
//   const exampleSequence = "GIVEQCCTSICSLYQLENYCNFVNQHLCGSHLVEALYLVCGERGFFYTPKT";
//   const [proteinSequence, setProteinSequence] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [smilesResult, setSmilesResult] = useState('');
//   const [moleculeImage, setMoleculeImage] = useState(null);
//   const [showCopied, setShowCopied] = useState(false);
//   const [showOutput, setShowOutput] = useState(false);

//   const features = [
    
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!proteinSequence.trim()) {
//       setError('Please enter a protein sequence');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setSmilesResult('');
//     setMoleculeImage(null);

//     try {
//       const response = await axios.post('http://localhost:5000/api/protein-to-smiles', {
//         input: proteinSequence,
//         vis: true
//       });
//       setSmilesResult(response.data.smiles);
//       if (response.data.image) {
//         setMoleculeImage(response.data.image);
//       }
//       setShowOutput(true);
//     } catch (err) {
//       setError(err.response?.data?.error || 'An error occurred during conversion');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVisualize = async () => {
//     if (!smilesResult) return;
//     setIsLoading(true);
//     try {
//       const response = await axios.post('http://localhost:5000/api/visualize-smiles', {
//         smiles: smilesResult
//       }, { responseType: 'blob' });
//       setMoleculeImage(URL.createObjectURL(response.data));
//     } catch (err) {
//       setError('Failed to generate visualization');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(smilesResult);
//     setShowCopied(true);
//     setTimeout(() => setShowCopied(false), 2000);
//   };

//   const resetForm = () => {
//     setProteinSequence('');
//     setSmilesResult('');
//     setMoleculeImage(null);
//     setError(null);
//     setShowOutput(false);
//   };

//   const downloadImage = () => {
//     if (!moleculeImage) return;
//     const link = document.createElement('a');
//     link.href = moleculeImage;
//     link.download = 'molecule-structure.png';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleNewConversion = () => {
//     resetForm();
//   };

//   return (
//     <div className="protein-converter">
//       <div className="converter-container">
//         <header className="converter-header">
//           <h1 className="converter-title">
//             <span className="title-gradient">Protein to SMILES</span> Converter
//           </h1>
//           <p className="converter-subtitle">Transform protein sequences into molecular structures</p>
//         </header>

//         <div className="main-card">
//           {!showOutput ? (
//             // Input View
//             <div className="input-view">
//               <div className="panel-header">
//                 <h2>Input Protein Sequence</h2>
//                 <div className="sequence-meta">
//                   <span className="badge">{proteinSequence.length} residues</span>
//                   <button 
//                     onClick={() => setProteinSequence(exampleSequence)}
//                     className="example-btn"
//                   >
//                     Load Example
//                   </button>
//                 </div>
//               </div>
              
//               <form onSubmit={handleSubmit} className="converter-form">
//                 <div className="form-group">
//                   <textarea
//                     value={proteinSequence}
//                     onChange={(e) => setProteinSequence(e.target.value)}
//                     placeholder="Enter protein sequence (e.g. GIVEQCCTSICSLYQLENYCN...)"
//                     rows={8}
//                     className="sequence-input"
//                   />
//                 </div>
                
//                 <div className="action-buttons">
//                   <button
//                     type="submit"
//                     disabled={!proteinSequence || isLoading}
//                     className={`convert-btn ${isLoading ? 'loading' : ''}`}
//                   >
//                     {isLoading ? (
//                       <>
//                         <div className="spinner"></div>
//                         Processing...
//                       </>
//                     ) : (
//                       'Convert to SMILES'
//                     )}
//                   </button>
//                 </div>
//               </form>

//               {error && (
//                 <div className="error-message">
//                   <div className="error-icon">!</div>
//                   <p>{error}</p>
//                 </div>
//               )}

//               <div className="features-section">
               
//                 <div className="features-grid">
//                   {features.map((feature, index) => (
//                     <div key={index} className="feature-card">
//                       <div className="feature-icon">{feature.icon}</div>
//                       <h4>{feature.title}</h4>
//                       <p>{feature.desc}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // Output View
//             <div className="output-view">
//               <div className="output-header">
//                 <h2>Conversion Results</h2>
//                 <button 
//                   onClick={handleNewConversion}
//                   className="new-conversion-btn"
//                 >
//                   <FiArrowLeft /> Convert Another Protein
//                 </button>
//               </div>
              
//               <div className="smiles-result">
//                 <div className="result-header">
//                   <h3>SMILES Notation</h3>
//                   <button 
//                     onClick={copyToClipboard} 
//                     className="copy-btn"
//                     aria-label="Copy SMILES"
//                   >
//                     <FiCopy /> {showCopied ? 'Copied!' : 'Copy'}
//                   </button>
//                 </div>
//                 <div className="smiles-code">
//                   <code>{smilesResult}</code>
//                 </div>
//               </div>

//               {moleculeImage ? (
//                 <div className="visualization-section">
//                   <div className="viz-header">
//                     <h3>Molecular Structure</h3>
//                     <div className="viz-actions">
//                       <button 
//                         onClick={downloadImage} 
//                         className="action-btn"
//                         aria-label="Download image"
//                       >
//                         <FiDownload /> Download
//                       </button>
//                       <button 
//                         onClick={handleVisualize} 
//                         className="action-btn"
//                         aria-label="Regenerate visualization"
//                       >
//                         <FiRefreshCw /> Regenerate
//                       </button>
//                     </div>
//                   </div>
//                   <div className="molecule-image-container">
//                     <img 
//                       src={moleculeImage} 
//                       alt="Molecular structure" 
//                       className="molecule-image"
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <button
//                   onClick={handleVisualize}
//                   disabled={isLoading}
//                   className={`visualize-btn ${isLoading ? 'loading' : ''}`}
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="spinner"></div>
//                       Generating Visualization...
//                     </>
//                   ) : (
//                     <>
//                       <FiEye /> Visualize Structure
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         <footer className="converter-footer">
//           <p>For research and educational use only</p>
//           <div className="footer-links">
//             <a href="#">Documentation</a>
//             <span>•</span>
//             <a href="#">Help Center</a>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default ProteinToSmilesConverter;

import React, { useState } from 'react';
import axios from 'axios';
import { FiCopy, FiDownload, FiRefreshCw, FiCode, FiLayers, FiSearch, FiEye, FiArrowLeft } from 'react-icons/fi';
import './ProteinToSmilesConverter.css';

const ProteinToSmilesConverter = () => {
  const exampleSequence = "GIVEQCCTSICSLYQLENYCNFVNQHLCGSHLVEALYLVCGERGFFYTPKT";
  const exampleProteinName = "Human Insulin";
  const [proteinSequence, setProteinSequence] = useState('');
  const [proteinName, setProteinName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [smilesResult, setSmilesResult] = useState('');
  const [moleculeImage, setMoleculeImage] = useState(null);
  const [showCopied, setShowCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const features = [
    // Your feature cards can go here
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proteinSequence.trim()) {
      setError('Please enter a protein sequence');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSmilesResult('');
    setMoleculeImage(null);

    try {
      const response = await axios.post('http://localhost:5000/api/protein-to-smiles', {
        input: proteinSequence,
        vis: true
      });
      setSmilesResult(response.data.smiles);
      if (response.data.image) {
        setMoleculeImage(response.data.image);
      }
      setShowOutput(true);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during conversion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (!smilesResult) return;
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/visualize-smiles', {
        smiles: smilesResult
      }, { responseType: 'blob' });
      setMoleculeImage(URL.createObjectURL(response.data));
    } catch (err) {
      setError('Failed to generate visualization');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(smilesResult);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const resetForm = () => {
    setProteinSequence('');
    setProteinName('');
    setSmilesResult('');
    setMoleculeImage(null);
    setError(null);
    setShowOutput(false);
  };

  const downloadImage = () => {
    if (!moleculeImage) return;
    const link = document.createElement('a');
    link.href = moleculeImage;
    link.download = 'molecule-structure.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewConversion = () => {
    resetForm();
  };

  const loadExample = () => {
    setProteinSequence(exampleSequence);
    setProteinName(exampleProteinName);
  };

  return (
    <div className="p2s protein-converter">
    <div className="protein-converter">
      <div className="converter-container">
        <header className="converter-header">
          <h1 className="converter-title">
            <span className="title-gradient">Protein to SMILES</span> Converter
          </h1>
          <p className="converter-subtitle">Transform protein sequences into molecular structures using Gen-AI</p>
        </header>

        <div className="main-card">
          {!showOutput ? (
            // Input View
            <div className="input-view">
              <div className="panel-header">
                <h2>Input Protein Sequence</h2>
                <div className="sequence-meta">
                  <span className="badge">{proteinSequence.length} residues</span>
                  <button 
                    onClick={loadExample}
                    className="example-btn"
                  >
                    Load Example
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="converter-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={proteinName}
                    onChange={(e) => setProteinName(e.target.value)}
                    placeholder="Protein name (optional)"
                    className="protein-name-input"
                  />
                  <textarea
                    value={proteinSequence}
                    onChange={(e) => setProteinSequence(e.target.value)}
                    placeholder="Enter protein sequence (e.g. GIVEQCCTSICSLYQLENYCN...)"
                    rows={8}
                    className="sequence-input"
                  />
                </div>
                
                <div className="action-buttons">
                  <button
                    type="submit"
                    disabled={!proteinSequence || isLoading}
                    className={`convert-btn ${isLoading ? 'loading' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        Processing...
                      </>
                    ) : (
                      'Convert to SMILES'
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="error-message">
                  <div className="error-icon">!</div>
                  <p>{error}</p>
                </div>
              )}

              <div className="features-section">
                <div className="features-grid">
                  {features.map((feature, index) => (
                    <div key={index} className="feature-card">
                      <div className="feature-icon">{feature.icon}</div>
                      <h4>{feature.title}</h4>
                      <p>{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Output View
            <div className="output-view">
              <div className="output-header">
                <h2>Conversion Results</h2>
                <button 
                  onClick={handleNewConversion}
                  className="new-conversion-btn"
                >
                  <FiArrowLeft /> Convert Another Protein
                </button>
              </div>
              
              <div className="input-display">
                <h3>Input Protein</h3>
                {proteinName && <p className="protein-name">{proteinName}</p>}
                <div className="protein-sequence-display">
                  {proteinSequence}
                </div>
              </div>

              <div className="smiles-result">
                <div className="result-header">
                  <h3>SMILES Notation</h3>
                  <button 
                    onClick={copyToClipboard} 
                    className="copy-btn"
                    aria-label="Copy SMILES"
                  >
                    <FiCopy /> {showCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="smiles-code">
                  <code>{smilesResult}</code>
                </div>
              </div>

              {moleculeImage ? (
                <div className="visualization-section">
                  <div className="viz-header">
                    <h3>Molecular Structure</h3>
                    <div className="viz-actions">
                      <button 
                        onClick={downloadImage} 
                        className="action-btn"
                        aria-label="Download image"
                      >
                        <FiDownload /> Download
                      </button>
                      <button 
                        onClick={handleVisualize} 
                        className="action-btn"
                        aria-label="Regenerate visualization"
                      >
                        <FiRefreshCw /> Regenerate
                      </button>
                    </div>
                  </div>
                  <div className="molecule-image-container">
                    <img 
                      src={moleculeImage} 
                      alt="Molecular structure" 
                      className="molecule-image"
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleVisualize}
                  disabled={isLoading}
                  className={`visualize-btn ${isLoading ? 'loading' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Generating Visualization...
                    </>
                  ) : (
                    <>
                      <FiEye /> Visualize Structure
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="converter-footer">
          <p>For research and educational use only</p>
          <div className="footer-links">
            <a href="#">Documentation</a>
            <span>•</span>
            <a href="#">Help Center</a>
          </div>
        </footer>
      </div>
    </div>
    </div>
  );
};

export default ProteinToSmilesConverter;