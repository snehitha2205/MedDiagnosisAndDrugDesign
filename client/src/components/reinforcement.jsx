

// import React, { useState } from "react"; 
// import axios from "axios";
// import "./reinforcement.css"; 

// const commonMolecules = [
//   { name: "Aspirin", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
//   { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
//   { name: "Ibuprofen", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" },
//   { name: "Paracetamol", smiles: "CC(=O)NC1=CC=C(C=C1)O" },
//   { name: "Morphine", smiles: "CN1CC[C@]23C4=C5C=CC(O)=C4O[C@H]2[C@@H](O)C=C[C@H]3[C@H]1C5" }
// ];

// const DeNovoGenerator = () => {
//   const [inputData, setInputData] = useState("");
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedMolecule, setSelectedMolecule] = useState(null);
//   const [notification, setNotification] = useState(null);

//   const handlePrediction = async () => {
//     if (!inputData.trim()) {
//       setError("Please enter a valid SMILES string");
//       return;
//     }
//     try {
//       setIsLoading(true);
//       setError(null);
//       const response = await axios.post(
//         "http://localhost:8000/predict/reinforcement",
//         { SMILES: inputData }
//       );
//       if (response.data && response.data.top_results) {
//         setResult(response.data);
//       } else {
//         setError("No valid results returned from the server");
//       }
//     } catch (err) {
//       console.error("Error fetching prediction:", err);
//       setError(err.response?.data?.detail || "Failed to get prediction. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDropdownChange = (e) => {
//     const selectedSMILES = e.target.value;
//     if (selectedSMILES !== "") {
//       setInputData(selectedSMILES);
//     }
//   };

//   const openModal = (molecule) => {
//     setSelectedMolecule(molecule);
//   };

//   const closeModal = () => {
//     setSelectedMolecule(null);
//   };

//   const downloadSMILES = () => {
//     if (!selectedMolecule) return;
    
//     const element = document.createElement("a");
//     const file = new Blob([selectedMolecule.SMILES], {type: 'text/plain'});
//     element.href = URL.createObjectURL(file);
//     element.download = `molecule_${selectedMolecule.SMILES.substring(0, 10)}.smi`;
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
    
//     showNotification("SMILES file downloaded!");
//   };

//   const copyAllDetails = () => {
//     if (!selectedMolecule) return;
//     const text = `SMILES: ${selectedMolecule.SMILES}\nLogP: ${selectedMolecule.LogP}\npIC50: ${selectedMolecule.pIC50}\nReward: ${selectedMolecule.Reward}`;
//     navigator.clipboard.writeText(text);
//     showNotification("All details copied to clipboard!");
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(null), 3000);
//   };

//   return (
//     <div className="denovo-container">
//       <div className="denovo-header">
//         <h1>De-novo <span>Drug Generator</span></h1>
//         <p className="denovo-subtitle">Enter a SMILES string to generate potential drug molecules using reinforcement learning</p>
//       </div>

//       <div className="denovo-input-section">
//         <div className="denovo-input-card">
//           <h2>Start with a molecule</h2>
          
//           <div className="input-group">
//             <select 
//               onChange={handleDropdownChange} 
//               defaultValue=""
//               className="molecule-selector"
//             >
//               <option value="" disabled>Select a common molecule</option>
//               {commonMolecules.map((mol, index) => (
//                 <option key={index} value={mol.smiles}>
//                   {mol.name}
//                 </option>
//               ))}
//             </select>
            
//             <div className="or-divider">or</div>
            
//             <textarea
//               value={inputData}
//               onChange={(e) => setInputData(e.target.value)}
//               placeholder="Enter your own SMILES string (e.g., CCO)"
//               className="smiles-input"
//             />
//           </div>
          
//           <button 
//             className="generate-button" 
//             onClick={handlePrediction} 
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <span className="loading-spinner"></span>
//                 Generating Molecules...
//               </>
//             ) : "Generate Novel Candidates"}
//           </button>
          
//           {error && (
//             <div className="error-message">
//               <svg className="error-icon" viewBox="0 0 24 24">
//                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
//               </svg>
//               {error}
//             </div>
//           )}
//         </div>
//       </div>

//       {result && (
//         <div className="denovo-results">
//           <div className="results-header">
//             <h2>Generated Drug Candidates</h2>
//             <p>AI-designed molecules optimized for therapeutic potential</p>
//           </div>
          
//           <div className="molecule-grid">
//             {result.top_results.map((item, index) => (
//               <div 
//                 key={index} 
//                 className={`molecule-card ${item.Reward === result.max_reward ? 'highlight-card' : ''}`}
//                 onClick={() => openModal(item)}
//               >
//                 <div className="molecule-image-container">
//                   <img 
//                     src={`data:image/png;base64,${item.image}`} 
//                     alt="Generated molecule" 
//                     className="molecule-image"
//                   />
//                   {item.Reward === result.max_reward && (
//                     <div className="best-tag">Best Candidate</div>
//                   )}
//                 </div>
                
//                 <div className="molecule-details">
//                   <div className="detail-row">
//                     <span className="detail-label">Reward:</span>
//                     <span className="detail-value reward-value">{item.Reward}</span>
//                   </div>
//                   <div className="detail-row">
//                     <span className="detail-label">LogP:</span>
//                     <span className="detail-value">{item.LogP}</span>
//                   </div>
//                   <div className="detail-row">
//                     <span className="detail-label">pIC50:</span>
//                     <span className="detail-value">{item.pIC50}</span>
//                   </div>
//                 </div>
                
//                 <div className="smiles-preview">
//                   <code>{item.SMILES.substring(0, 30)}{item.SMILES.length > 30 ? '...' : ''}</code>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {selectedMolecule && (
//         <div className="molecule-modal">
//           <div className="modal-backdrop" onClick={closeModal}></div>
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>Molecule Details</h3>
//               <button className="close-button" onClick={closeModal}>
//                 <svg viewBox="0 0 24 24">
//                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
//                 </svg>
//               </button>
//             </div>
            
//             <div className="modal-body">
//               <div className="molecule-visualization">
//                 <img 
//                   src={`data:image/png;base64,${selectedMolecule.image}`} 
//                   alt="Molecule structure" 
//                   className="modal-molecule-image"
//                 />
//               </div>
              
//               <div className="detailed-properties">
//                 <div className="property-group">
//                   <h4>Chemical Properties</h4>
//                   <div className="property-row">
//                     <span className="property-label">SMILES:</span>
//                     <code className="property-value">{selectedMolecule.SMILES}</code>
//                   </div>
//                   <div className="property-row">
//                     <span className="property-label">LogP:</span>
//                     <span className="property-value">{selectedMolecule.LogP}</span>
//                   </div>
//                   <div className="property-row">
//                     <span className="property-label">pIC50:</span>
//                     <span className="property-value">{selectedMolecule.pIC50}</span>
//                   </div>
//                   <div className="property-row">
//                     <span className="property-label">Reward Score:</span>
//                     <span className="property-value highlight-value">{selectedMolecule.Reward}</span>
//                   </div>
//                 </div>
                
//                 <div className="action-buttons">
//                   <button className="action-button download-button" onClick={downloadSMILES}>
//                     <svg viewBox="0 0 24 24">
//                       <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
//                     </svg>
//                     Download SMILES
//                   </button>
//                   <button className="action-button copy-button" onClick={copyAllDetails}>
//                     <svg viewBox="0 0 24 24">
//                       <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
//                     </svg>
//                     Copy All Data
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {notification && (
//         <div className="notification-bubble">
//           {notification}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DeNovoGenerator;

import React, { useState } from "react"; 
import axios from "axios";
import "./reinforcement.css"; 

const commonMolecules = [
  { name: "Aspirin", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
  { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
  { name: "Ibuprofen", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" },
  { name: "Paracetamol", smiles: "CC(=O)NC1=CC=C(C=C1)O" },
  { name: "Morphine", smiles: "CN1CC[C@]23C4=C5C=CC(O)=C4O[C@H]2[C@@H](O)C=C[C@H]3[C@H]1C5" }
];

const DeNovoGenerator = () => {
  const [inputData, setInputData] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [notification, setNotification] = useState(null);

  const handlePrediction = async () => {
    if (!inputData.trim()) {
      setError("Please enter a valid SMILES string");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post(
        "http://localhost:4004/predict/reinforcement",
        { SMILES: inputData ,
          callback_url: "https://webhook.site/0b0646b1-0fb5-4a1a-b0a0-c7efc98a28e1"
        }
      );
      if (response.data && response.data.top_results) {
        setResult(response.data);
      } else {
        setError("No valid results returned from the server");
      }
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError(err.response?.data?.detail || "Failed to get prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropdownChange = (e) => {
    const selectedSMILES = e.target.value;
    if (selectedSMILES !== "") {
      setInputData(selectedSMILES);
    }
  };

  const openModal = (molecule) => {
    setSelectedMolecule(molecule);
  };

  const closeModal = () => {
    setSelectedMolecule(null);
  };

  const downloadSMILES = () => {
    if (!selectedMolecule || !selectedMolecule.smiles) return;
    
    const element = document.createElement("a");
    const smilesText = selectedMolecule.smiles || '';
    const file = new Blob([smilesText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `molecule_${smilesText.substring(0, 10)}.smi`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showNotification("SMILES file downloaded!");
  };

  const copyAllDetails = () => {
    if (!selectedMolecule) return;
    const text = `SMILES: ${selectedMolecule.smiles || ''}\nLogP: ${selectedMolecule.logP || ''}\npIC50: ${selectedMolecule.pIC50 || ''}\nReward: ${selectedMolecule.reward || ''}`;
    navigator.clipboard.writeText(text);
    showNotification("All details copied to clipboard!");
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="denovo-container">
      <div className="denovo-header">
        <h1>De-novo <span>Drug Generator</span></h1>
        <p className="denovo-subtitle">Enter a SMILES string to generate potential drug molecules using reinforcement learning</p>
      </div>

      <div className="denovo-input-section">
        <div className="denovo-input-card">
          <h2>Start with a molecule</h2>
          
          <div className="input-group">
            <select 
              onChange={handleDropdownChange} 
              defaultValue=""
              className="molecule-selector"
            >
              <option value="" disabled>Select a common molecule</option>
              {commonMolecules.map((mol, index) => (
                <option key={index} value={mol.smiles}>
                  {mol.name}
                </option>
              ))}
            </select>
            
            <div className="or-divider">or</div>
            
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter your own SMILES string (e.g., CCO)"
              className="smiles-input"
            />
          </div>
          
          <button 
            className="generate-button" 
            onClick={handlePrediction} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Generating Molecules...
              </>
            ) : "Generate Novel Candidates"}
          </button>
          
          {error && (
            <div className="error-message">
              <svg className="error-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      {result && (
  <div className="denovo-results">
    <div className="results-header">
      <h2>Generated Drug Candidates</h2>
      <p>AI-designed molecules optimized for therapeutic potential</p>
    </div>
    
    <div className="molecule-grid">
      {result.top_results.map((item, index) => (
        <div 
          key={index}
          className={`molecule-card ${item.reward === result.best_reward ? 'highlight-card' : ''}`}
          onClick={() => openModal(item)}
        >
          <div className="molecule-image-container">
            <img 
              src={`data:image/png;base64,${item.image}`} 
              alt="Generated molecule" 
              className="molecule-image"
            />
            {item.reward === result.best_reward && (
              <div className="best-tag">Best Candidate</div>
            )}
          </div>
          
          <div className="molecule-details">
            <div className="detail-row">
              <span className="detail-label">Reward:</span>
              <span className="detail-value reward-value">{item.reward}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">LogP:</span>
              <span className="detail-value">{item.logP}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">pIC50:</span>
              <span className="detail-value">{item.pIC50}</span>
            </div>
          </div>
          
          <div className="smiles-preview">
            <code>{item.smiles?.substring(0, 30)}{item.smiles?.length > 30 ? '...' : ''}</code>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
      {selectedMolecule && (
        <div className="molecule-modal">
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Molecule Details</h3>
              <button className="close-button" onClick={closeModal}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="molecule-visualization">
                <img 
                  src={`data:image/png;base64,${selectedMolecule.image}`} 
                  alt="Molecule structure" 
                  className="modal-molecule-image"
                />
              </div>
              
              <div className="detailed-properties">
                <div className="property-group">
                  <h4>Chemical Properties</h4>
                  <div className="property-row">
                    <span className="property-label">SMILES:</span>
                    <code className="property-value">{selectedMolecule.smiles}</code>
                  </div>
                  <div className="property-row">
                    <span className="property-label">LogP:</span>
                    <span className="property-value">{selectedMolecule.logP}</span>
                  </div>
                  <div className="property-row">
                    <span className="property-label">pIC50:</span>
                    <span className="property-value">{selectedMolecule.pIC50}</span>
                  </div>
                  <div className="property-row">
                    <span className="property-label">Reward Score:</span>
                    <span className="property-value highlight-value">{selectedMolecule.reward}</span>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button className="action-button download-button" onClick={downloadSMILES}>
                    <svg viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download SMILES
                  </button>
                  <button className="action-button copy-button" onClick={copyAllDetails}>
                    <svg viewBox="0 0 24 24">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="notification-bubble">
          {notification}
        </div>
      )}
    </div>
  );
};

export default DeNovoGenerator;