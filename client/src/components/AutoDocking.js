import { useState, useEffect, useRef } from 'react'
import * as $3Dmol from '3dmol'
import './docking.css'

function App() {
  // State for the application
  const [ECnumber, setECnumber] = useState('')
  const [LIGAND_ID, setLIGAND_ID] = useState('')
  const [pdbData, setPdbData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const viewerRef = useRef(null)

  // Handle form submission
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!ECnumber || !LIGAND_ID) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5002/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ECnumber, LIGAND_ID }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const data = await response.json()
      setPdbData(data.pdb_content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load example data
  const loadExample = () => {
    setECnumber('3.4.21.4')
    setLIGAND_ID('13U')
  }

  // Render the 3D molecule when PDB data changes
  useEffect(() => {
    if (!pdbData || !viewerRef.current) return

    // Initialize 3Dmol viewer
    const element = viewerRef.current
    const config = { backgroundColor: '#FFDEDE' } // Light pink background
    const viewer = $3Dmol.createViewer(element, config)

    try {
      // Add PDB data to viewer
      viewer.addModel(pdbData, 'pdb')
      
      // Style the protein (ribbon in gray)
      viewer.setStyle({}, { cartoon: { color: 'gray' } })
      
      // Style ligands (heteroatoms) in #CF0F47 (dark pink/red)
      viewer.setStyle({ hetflag: true }, { 
        stick: { 
          radius: 0.3,
          color: '#CF0F47'
        } 
      })
      
      // Render the viewer
      viewer.zoomTo()
      viewer.render()
      
      // Disable automatic rotation
      viewer.spin(false)
    } catch (error) {
      console.error('Error rendering molecule:', error)
    }

    // Cleanup function
    return () => {
      if (viewer) {
        viewer.clear()
      }
    }
  }, [pdbData])

  return (
    <div className="molecular-viewer">
    <div className="app-container">
      <h1>Molecular Structure Viewer</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="ECnumber">EC Number:</label>
          <input
            type="text"
            id="ECnumber"
            value={ECnumber}
            onChange={(e) => setECnumber(e.target.value)}
            placeholder="e.g., 1.1.1.1"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="LIGAND_ID">Ligand ID:</label>
          <input
            type="text"
            id="LIGAND_ID"
            value={LIGAND_ID}
            onChange={(e) => setLIGAND_ID(e.target.value)}
            placeholder="e.g., ATP"
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button 
            type="button" 
            onClick={loadExample}
            className="example-button"
          >
            Load Example
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Molecule Viewer */}
      {pdbData && (
        <div className="molecule-viewer-container">
          <div ref={viewerRef} className="molecule-viewer" />
        </div>
      )}
    </div>
    </div>
  )
}

export default App