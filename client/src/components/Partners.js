// components/Partners.js
import React from 'react';
import './Partners.css';

const partners = [
  { name: "Mayo Clinic", logo: "mayo-logo" },
  { name: "Pfizer", logo: "pfizer-logo" },
  { name: "MIT", logo: "mit-logo" }
];

const Partners = () => {
  return (
    <section className="partners-section">
      <h2>Our Partners</h2>
      <div className="partners-grid">
        {partners.map((partner, index) => (
          <div key={index} className="partner-logo">
            <div className={`logo-placeholder ${partner.logo}`}></div>
            <p>{partner.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Partners;