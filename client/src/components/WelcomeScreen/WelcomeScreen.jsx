import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="hero-section">
        <div className="hero-cont">
          <h1 className="welcome-text">Welcome to</h1>
          <h1 className="app-title">MedPharmAI</h1>
          <div className="divider"></div>
          <p className="app-description">
            An AI-driven platform revolutionizing lung disease diagnosis and drug discovery. 
            Our mission is to enhance patient care through advanced machine learning.
          </p>
          
          <div className="button-group">
            <button 
              onClick={() => navigate("/login")}
              className="auth-btn login-btn"
            >
              LOGIN
            </button>
            
            <button 
              onClick={() => navigate("/mobile-verification")}
              className="auth-btn register-btn"
            >
              REGISTER
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="circle-accent circle-1"></div>
          <div className="circle-accent circle-2"></div>
          <div className="medical-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="#CF0F47" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="#000000" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">AI</div>
          <h3>Advanced Diagnosis</h3>
          <p>Precision analysis of medical imaging using cutting-edge AI algorithms</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🧪</div>
          <h3>Drug Discovery</h3>
          <p>Accelerating development of effective treatments through molecular modeling</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Data Insights</h3>
          <p>Comprehensive analytics for better patient outcomes</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;