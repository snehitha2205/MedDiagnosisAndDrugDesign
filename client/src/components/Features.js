import React from 'react';
import { Brain, Activity,BrainCircuit,TestTube2, Database,FlaskConical,Atom,Microscope,Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Features.css';

const features = [
  {
    title: 'CT Image Analysis',
    description: 'Upload CT scans and analyze lung diseases using AI.',
    icon: Activity,
    path: '/ct-image',
  },
  {
    title: 'Protein to SMILES Conversion',
    description: 'AI-powered molecular structure transformation and binding prediction.',
    icon: FlaskConical,
    path: '/protein-smiles',
  },
  {
    title: 'Protein Structure Visualization',
    description: 'AI-generated 3D models of protein structures.',
    icon: Database,
    path: '/protein-structure',
  },
  {
    title: 'De-novo Drug Generator',
    description: 'Generate optimized drug-like molecules using reinforcement learning-based models.',
    icon: BrainCircuit,
    path: '/Reinforcement',
  },{
    title: 'SMILES Masked Prediction',
    description: 'AI-powered molecular fragment prediction for drug discovery research.',
    icon: Atom,
    path: '/chembel',
  },
  {
    title: 'AutoDocking',
    description: 'Accelerated drug discovery through AI-based molecular docking and fragment analysis.',
    icon: Microscope,
    path: '/docking',
  },{
    title: 'Molecular Property Classifier',
    description: 'AI-powered classification of molecular properties for efficient drug candidate screening and prediction.',
    icon: TestTube2,
    path: '/Vit',
  },{
    title: 'Medical 3D Image Viewer',
    description: 'Interactive 3D visualization and analysis of medical imaging data with AI-powered segmentation capabilities.',
    icon: Scan, // Using a medical scan icon
    path: '/Lung',
}
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <div id="features" className="features dark:bg-gray-900">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title dark:text-white">Our AI-Powered Tools</h2>
          <p className="features-subtitle dark:text-gray-300">
            Cutting-edge solutions for medical research and diagnosis
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card dark:bg-gray-800 dark:border-gray-700">
              <div className="feature-icon dark:bg-blue-900 dark:text-blue-300">
                <feature.icon />
              </div>
              <h3 className="feature-title dark:text-white">{feature.title}</h3>
              <p className="feature-description dark:text-gray-300">{feature.description}</p>
              <button
                className="feature-button dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={() => navigate(feature.path)}
              >
                Try Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;