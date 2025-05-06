import React from 'react';
import { Activity, Github, Linkedin, Twitter } from 'lucide-react';
import './Footer.css'
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-logo-section">
          <div className="footer-logo">
            <Activity />
            <span>MedPharmAI</span>
          </div>
          <p className="footer-description">
            Advancing healthcare through AI-powered solutions for medical diagnosis and drug discovery.
          </p>
        </div>

        <div className="footer-links-section">
          <h3 className="footer-links-title">Quick Links</h3>
          <ul className="footer-links">
            {['Privacy Policy', 'Terms of Service', 'Support'].map((item) => (
              <li key={item}>
                <a href="#" className="footer-link">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-social-section">
          <h3 className="footer-links-title">Connect With Us</h3>
          <div className="footer-social">
            <a href="#" className="footer-social-link"><Twitter /></a>
            <a href="#" className="footer-social-link"><Linkedin /></a>
            <a href="#" className="footer-social-link"><Github /></a>
          </div>
        </div>

        <div className="footer-newsletter-section">
          <h3 className="footer-links-title">Newsletter</h3>
          <form className="footer-newsletter">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} MedPharmAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;