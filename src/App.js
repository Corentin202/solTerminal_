// src/App.js
import React from 'react';
import './css/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TerminalChat from './pages/Chat';
import SolTerminal from './pages/Home';
import Maintenance from './pages/Maintenance'; // Importation de la page de maintenance

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SolTerminal />} />
        {/* Route pour la maintenance */}
        <Route path="/chat" element={<Maintenance />} />
        <Route path="/devnet" element={<TerminalChat />} />
      </Routes>
    </Router>
  );
}

export default App;
