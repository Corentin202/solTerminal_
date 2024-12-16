import React, { useState, useEffect } from 'react';
import MatrixRainAnimation from "../components/Animation/MatrixRainAnimation";
import Logo from '../components/Logo/Logo';
import SocialNetworkButtons from '../components/SocialNetworkButtons/SocialNetworkButtons';
import Faq from '../components/Faq/Faq';
import Terminal from '../components/Terminal/Terminal';
import './Home.css';
import './LoadingScreen.css';

const Home = () => {
    const [showFaq, setShowFaq] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setIsTransitioning(true);
            
            const finalTimer = setTimeout(() => {
                setIsLoading(false);
            }, 1000); // Durée de la transition

            return () => clearTimeout(finalTimer);
        }, 3000); // Durée de l'animation de chargement initiale

        return () => clearTimeout(loadingTimer);
    }, []);

    const toggleFaq = (e) => {
        e.stopPropagation();
        setShowFaq(prevState => !prevState);
    };

    const closeFaq = () => {
        setShowFaq(false);
    };

    const handleButtonClick = () => {
        const button = document.querySelector('.button');
        
        button.classList.add('button-clicked');
        document.body.classList.add('transitioning');
    
        setTimeout(() => {
            window.location.href = '/chat';
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className={`loading-screen ${isTransitioning ? 'transitioning' : ''}`}>
                <div className="loading-glitch">
                    <div className="loading-text">INITIALIZING</div>
                    <div className="loading-subtext">SYSTEM STARTUP...</div>
                </div>
                <div className="loading-grid"></div>
                <div className="loading-scanlines"></div>
            </div>
        );
    }

    return (
        <div>
            <MatrixRainAnimation />
            <div className="terminal">
                <div className="wallet-adress-container">
                    <button id="FAQ-button" onClick={toggleFaq}>[FAQ]</button>
                </div>

                <Logo />

                <Terminal setShowButton={setShowButton} />

                {showButton && (
                    <div className="button-container">
                        <button className="button" data-text="Awesome" onClick={handleButtonClick}>
                            <span className="actual-text">&nbsp;ENTER&nbsp;</span>
                            <span aria-hidden="true" className="hover-text">&nbsp;ENTER&nbsp;</span>
                        </button>
                    </div>
                )}

                <div className="social-links">
                    <SocialNetworkButtons />
                </div>

                <Faq show={showFaq} onClose={closeFaq} />

                <div className="nv">
                    <p>yall retarded</p>
                </div>
            </div>
        </div>
    );
};

export default Home;