import React, { useState, useEffect, useRef } from 'react';
import faqSections from './FaqData';
import './Faq.css';

const Faq = ({ show, onClose }) => {
  const [activeSection, setActiveSection] = useState(null);
  const modalRef = useRef(null);

  const toggleFaqContent = (index) => {
    setActiveSection(activeSection === index ? null : index);
  };

  // Close the FAQ if clicked outside of the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (show && modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      id="modalFAQ" 
      className="modal show"
      ref={modalRef}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>FAQ</h2>
          <button id="close-modal" onClick={onClose}>[X]</button>
        </div>
        <div className="modal-body">
          <p>Welcome to Terminal, an interactive platform where users collaborate and engage with an advanced artificial intelligence. This FAQ provides essential guidance to navigate this unique system.</p>
          
          {faqSections.map((section, index) => (
            <div key={index} className="faq-section">
              <h3 
                className={`faq-title ${activeSection === index ? 'active' : ''}`} 
                onClick={() => toggleFaqContent(index)}
              >
                {section.title}
              </h3>
              <div 
                className={`faq-content ${activeSection === index ? 'show' : ''}`}
              >
                {section.content}
              </div>
            </div>
          ))}
          
          <p>Terminal is more than a tool; it's an immersive and evolving experience. Participate thoughtfully, and may your interactions pave the way for innovation!</p>
        </div>
      </div>
    </div>
  );
};

export default Faq;