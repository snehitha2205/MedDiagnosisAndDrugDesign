import React from 'react';
import './ContactUs.css';

const ContactUs = ({ id }) => {
  return (
    <section id={id} className="contact-us-section">
      <div className="contact-container">
        <h2 className="contact-title">Contact Us</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3 className="info-title">Get in Touch</h3>
            <p className="info-item">Email: info@medpharmai.com</p>
            <p className="info-item">Phone: +1 (555) 123-4567</p>
            <p className="info-item">Address: 123 Medical Drive, San Francisco, CA 94110</p>
          </div>
          <form className="contact-form">
            <div className="form-group">
              <input type="text" placeholder="Your Name" required className="form-input" />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" required className="form-input" />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message" rows="5" required className="form-textarea"></textarea>
            </div>
            <button type="submit" className="submit-button">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;