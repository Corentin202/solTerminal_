// src/pages/Maintenance.js
import React from 'react';
import './Maintenance.css';
import SocialNetworkButtons from '../components/SocialNetworkButtons/SocialNetworkButtons';
import MatrixRainAnimation from '../components/Animation/MatrixRainAnimation';

function Maintenance() {
  return (
    <div>
    <div className="matrix-rain" style={{ opacity: 0.8}}>
      <MatrixRainAnimation />
    </div>
      <div className="maintenance-container">
        <div className="maintenance-terminal">
          <h1>System Error</h1>
          <p>Maintenance mode - The terminal is offline for updates.</p>
          <p>Return to the system shortly...</p>
        </div>
        <SocialNetworkButtons />
      </div>
    </div>
  );
}

export default Maintenance;
