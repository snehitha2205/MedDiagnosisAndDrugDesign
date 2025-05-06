import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    quote: "MedPharmAI revolutionized our drug discovery process, cutting research time by 40%.",
    author: "Dr. Sarah Chen, Pharma Research Director"
  },
  {
    quote: "The diagnostic accuracy is remarkable - it caught what human radiologists initially missed.",
    author: "Dr. James Wilson, Chief Radiologist"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2 className="testimonials-title">What Our Users Say</h2>
      <div className="testimonial-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <p className="quote">"{testimonial.quote}"</p>
            <p className="author">- {testimonial.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;