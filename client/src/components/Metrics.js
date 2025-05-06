// components/Metrics.js
import React from 'react';
import './Metrics.css';

const metrics = [
  { value: "95%", label: "Diagnostic Accuracy" },
  { value: "10x", label: "Faster Drug Screening" },
  { value: "500+", label: "Research Institutions" }
];

const Metrics = () => {
  return (
    <section className="metrics-section">
      <div className="metrics-container">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <h3>{metric.value}</h3>
            <p>{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Metrics;