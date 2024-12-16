import React, { useEffect, useRef } from 'react';

const SystemMessagesLayout = ({ timeLeft, guestsConnected, totalMessages, systemMessages, formatTime }) => {
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        // Scroller vers le bas à chaque fois que les messages sont mis à jour
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [systemMessages]); // Se déclenche chaque fois que les messages changent

    return (
        <div className="flex flex-col max-w-[35%]">
            {/* Conteneur scrollable avec contrôle dynamique */}
            <div
                ref={messagesContainerRef}
                className="system-messages-container"
                style={{
                    maxHeight: '100px', // Limite de hauteur (ajustable)
                    overflowY: systemMessages.length > 3 ? 'auto' : 'hidden', // Affiche le scroll si trop de messages
                    paddingRight: '0.5rem', // Ajout d'espace pour éviter que la barre de scroll ne chevauche le texte
                    wordWrap: 'break-word', // Gestion des retours à la ligne
                    fontWeight: 'bold'
                }}
            >
                <div className="text-white mb-2 ml-2 text-left" role="log">
                    System &gt; Welcome to SOLTERMINAL.
                    <br />
                    System &gt; Time left : {formatTime(timeLeft)}.
                    <br />
                    System &gt; Guests connected : {guestsConnected}.
                    <br />
                    System &gt; Break attempts : {totalMessages}.
                </div>
                {/* Messages système */}
                {systemMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`text-white mb-2 ${msg.alignment}`}
                        role="log"
                        style={{ color: msg.color, marginLeft: '0.5rem' }}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemMessagesLayout;
