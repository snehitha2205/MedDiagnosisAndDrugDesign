import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQs.css';

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();
  const faqs = [
    {
      question: 'What is MedPharmAI?',
      answer: 'MedPharmAI is an AI-powered platform that combines medical diagnosis with pharmaceutical research to provide comprehensive healthcare solutions.'
    },
    {
      question: 'How accurate is the AI diagnosis?',
      answer: 'Our AI models achieve over 95% accuracy in preliminary tests, but always consult with a healthcare professional for final diagnosis.'
    },
    {
      question: 'Is my medical data secure?',
      answer: 'Yes, we use end-to-end encryption and comply with all healthcare data protection regulations to ensure your information remains private.'
    },
    {
      question: 'Can I use this platform for research purposes?',
      answer: 'Absolutely! Our tools are designed for both clinical and research applications. Contact us for academic or commercial research inquiries.'
    },
    {
      question: 'How do I get started with the platform?',
      answer: 'Simply create an account and follow the onboarding process. Our intuitive interface will guide you through the available features.'
    }
  ];

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const handleContactClick = () => {
    // Navigate to home page
    navigate('/main');
    
    // Scroll to contact section after a small delay to allow navigation to complete
    setTimeout(() => {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  return (
    <div className="faqs-screen">
      <div className="faqs-background">
        <div className="faqs-pattern"></div>
      </div>
      
      <div className="faqs-content">
        <div className="faqs-header">
          <h1 className="faqs-main-title">Frequently Asked Questions</h1>
          <p className="faqs-subtitle">Find answers to common questions about our platform</p>
        </div>

        <div className="faqs-grid">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-card ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAnswer(index)}
            >
              <div className="faq-card-header">
                <h3 className="faq-question">{faq.question}</h3>
                <div className="faq-indicator">
                  <div className="indicator-line"></div>
                  <div className={`indicator-line ${activeIndex === index ? 'rotated' : ''}`}></div>
                </div>
              </div>
              
              <div className={`faq-answer-container ${activeIndex === index ? 'open' : ''}`}>
                <div className="faq-answer">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="faqs-contact">
          <p>Still have questions?</p>
          <button className="contact-button" onClick={handleContactClick}>
          Contact Our Team
        </button>        </div>
      </div>
    </div>
  );
};

export default FAQs;