// components/Research.js
import React from 'react';
import './Research.css';

const publications = [
  {
    title: "AI-powered protein folding prediction",
    journal: "Nature Biotechnology",
    link: "#"
  },
  {
    title: "Deep learning for medical imaging analysis",
    journal: "Journal of Medical AI",
    link: "#"
  }
];

const Research = () => {
  return (
    <section className="research">
      <h2>Our Research</h2>
      <div className="publication-list">
        {publications.map((pub, index) => (
          <div key={index} className="publication-item">
            <h3>{pub.title}</h3>
            <p>{pub.journal}</p>
            <a href={pub.link} className="read-more">Read Publication</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Research;