import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <section className="about-us">
      <div className="about-container">
        <div className="about-header">
          <h2>About MedPharmAI</h2>
          <p className="tagline">Bridging the gap between artificial intelligence and healthcare</p>
        </div>
        
        <div className="about-content">
          <div className="about-text">
            <h3>Our Mission</h3>
            <p>
              At MedPharmAI, we're revolutionizing healthcare through cutting-edge AI solutions. 
              Our mission is to enhance medical diagnosis accuracy and accelerate drug discovery 
              processes to improve patient outcomes worldwide.
            </p>
            
            <h3>Our Story</h3>
            <p>
              Founded in 2020 by a team of AI researchers and medical professionals, 
              MedPharmAI began as a research project at a leading university. Today, 
              we've grown into a trusted partner for healthcare institutions and 
              pharmaceutical companies globally.
            </p>
            
            <h3>Our Technology</h3>
            <p>
              We combine deep learning algorithms with medical expertise to create 
              powerful diagnostic tools and predictive models. Our proprietary 
              technology stack includes advanced neural networks trained on millions 
              of medical images and molecular structures.
            </p>
          </div>
          
          <div className="about-stats">
            <div className="stat-item">
              <h4>50+</h4>
              <p>Medical Institutions Using Our Technology</p>
            </div>
            <div className="stat-item">
              <h4>95%</h4>
              <p>Diagnostic Accuracy Rate</p>
            </div>
            <div className="stat-item">
              <h4>10x</h4>
              <p>Faster Drug Discovery Process</p>
            </div>
            <div className="stat-item">
              <h4>100+</h4>
              <p>Research Papers Published</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;