import React from 'react';
import './hero.css';

const Hero = () => {
  return (
    <div className="hero">
      
      <div className="hero-background"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          <span>AI-Powered Lung Disease</span>
          <span>Diagnosis & Drug Discovery</span>
        </h1>
        <p className="hero-subtitle">
          Revolutionizing healthcare with advanced AI technology for precise lung disease diagnosis
          <br />
          and accelerated drug discovery solutions.
        </p>
        <div className="hero-buttons">
          <a href="#" className="hero-button hero-button-primary">
            Get Started
          </a>
          <a href="#features" className="hero-button hero-button-primary">
            Explore Tools
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;