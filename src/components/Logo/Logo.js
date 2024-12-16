import React from 'react';
import { useLocation } from 'react-router-dom';
import stylesHome from './LogoHome.module.css';
import stylesChat from './LogoChat.module.css';

const Logo = () => {
  const location = useLocation();

  // Sélectionne les styles en fonction de la route
  const getStyles = () => {
    if (location.pathname === '/') {
      return stylesHome;
      // Si la route est /chat ou /devnet on utilise les styles de chat
    } else if (location.pathname === '/chat' || location.pathname === '/devnet') {
      return stylesChat;
    }
    return {};
  };

  const currentStyles = getStyles();

  // Fonction pour wrapper les caractères spécifiques
  const wrapSpecialChars = (text) => {
    const specialChars = ['╚', '╝', '═', '╗', '╔', '║', '╩', '╦', '╠', '╣', '╬'];
    return text.split('').map((char, index) => {
      if (specialChars.includes(char)) {
        return (
          <span key={index} className={currentStyles['special-char']}>
            {char}
          </span>
        );
      }
      return char;
    });
  };

  return (
    <div className={currentStyles['ascii-container']}>
      <pre className={currentStyles['ascii-art']}>
        {wrapSpecialChars(`
                ███████╗ ██████╗ ██╗     ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
                ██╔════╝██╔═══██╗██╗     ╚══██╔══╝██╔════╝██╔══██╗████╗ ████╗██╗████╗  ██╗██╔══██╗██╗     
                ███████╗██║   ██║██╗        ██╗   █████╗  ██████╔╝██╔████╔██╗██╗██╔██╗ ██╗███████╗██╗     
                ╚════██║██║   ██║██╗        ██╗   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██╗██╗     
                ███████║╚██████╔╝███████╗   ██╗   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
                ╚══════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
        `)}
      </pre>
    </div>
  );
};

export default Logo;