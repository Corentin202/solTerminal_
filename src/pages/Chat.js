import React, { useState, useEffect, useRef, useCallback } from "react";
import './Chat.css'
import { Send } from "lucide-react";
import MatrixRainAnimation from "../components/Animation/MatrixRainAnimation";
//import { showTemporaryMessage, usePhantomWallet, usePayment } from "./Functions";
import SocialNetworkButtons from '../components/SocialNetworkButtons/SocialNetworkButtons';
import SystemMessagesLayout from '../components/SystemMessages/SystemMessagesLayout';
import useWebSocket from '../hooks/Websocket/useWebSocket';
import Logo from '../components/Logo/Logo';
import DisconnectModal from '../components/Modal/disconnectModal';
import { usePhantomWallet } from '../hooks/Phantom/usePhantomWallet';
import { usePayment } from '../hooks/Payment/usePayment';
import { showTemporaryMessage } from '../hooks/utils';

const TerminalChat = () => {

  const [chatMessages, setChatMessages] = useState([]); // Messages du chat
  const [inputMessage, setInputMessage] = useState("");
  const [systemMessages, setSystemMessages] = useState([]); // Ajout du state pour les messages système
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes en secondes
  const [totalMessages, setTotalMessages] = useState(0); // Nombre total de messages
  const [guestsConnected, setGuestsConnected] = useState(0); // Nombre d'invités connectés
  const [currentPrice, setCurrentPrice] = useState(null); // Prix actuel de du message
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const { provider, publicKey, connectWallet, disconnectWallet } = usePhantomWallet((msg, color) =>
    showTemporaryMessage(msg, color, setSystemMessages)
  );
  const { initiatePayment } = usePayment((msg, color) =>
    showTemporaryMessage(msg, color, setSystemMessages)
  );

  useEffect(() => {
    document.title = "solTerminal_chat"; // Change le titre de l'onglet
  }, []);

  const socketRef = useWebSocket({
    setGuestsConnected,
    setCurrentPrice,
    setTimeLeft,
    setChatMessages,
    setTotalMessages,
  });

  useEffect(() => {
    // Timer countdown logic
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          // Optionally handle timer expiration
          showTemporaryMessage("Session time expired!", "#ff0000", setSystemMessages);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timerInterval);
  }, []); // Empty dependency array means this runs once on mount

  // Formater le temps restant
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const sendMessageToAI = async (input, senderPublicKey) => {
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      console.error("Invalid input message");
      return; // Si le message est invalide, on arrête la fonction
    }

    if (!senderPublicKey || typeof senderPublicKey !== 'string' || senderPublicKey.trim().length === 0) {
      console.error("Invalid senderPublicKey");
      return; // Si la clé publique est invalide, on arrête la fonction
    }

    if (socketRef.current) {
      console.log('WebSocket readyState:', socketRef.current.readyState); // Vérifie l'état de la connexion
      if (socketRef.current.readyState === WebSocket.OPEN) {
        // Ajotuer un loader pendant l'envoi du message
        const loader = document.createElement('div');
        loader.innerHTML = `
          <svg viewBox="25 25 50 50">
            <circle r="20" cy="50" cx="50"></circle>
          </svg>
        `;
        loader.classList.add('loaderAi');
        document.querySelector('.bg-black').prepend(loader);

        console.log('Sending message:', { message: input, senderPublicKey });
        socketRef.current.send(
          JSON.stringify({
            message: input,
            senderPublicKey
          })
        );

        // Supprimer le loader après l'envoi du message
        loader.remove();
      } else {
        console.log('WebSocket is not open');
      }
    } else {
      console.log('WebSocket reference is null');
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() === "") return;

    if (publicKey) {
      await sendMessageToAI(inputMessage, publicKey);
    } else {
      showTemporaryMessage("Please connect your wallet first.", "#ff0000", setSystemMessages);
    }

    setInputMessage("");
  }, [inputMessage, publicKey]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handlePay = async () => {
    if (publicKey) {
      const success = await initiatePayment(publicKey);
      if (success) {
        showTemporaryMessage("Payment successful!", "#00ff00", setSystemMessages);
      }
    } else {
      showTemporaryMessage("Please connect your wallet first.", "#ff0000", setSystemMessages);
    }
  };

  const handleConnectWallet = () => {
    connectWallet();
    setIsWalletConnected(true);
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setIsWalletConnected(false);
    setShowDisconnectModal(false);
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <div>
        <MatrixRainAnimation />
      </div>

      <div className="test">
        <div className="buttonPayDiv flex flex-wrap items-center ml-2 mr-2 justify-end">
          <button
            onClick={publicKey ? () => setShowDisconnectModal(true) : handleConnectWallet}
            className="terminal-button"
            aria-label="Connect Wallet"
          >
            {publicKey ? `${publicKey}` : "[Connect Wallet]"}
          </button>
        </div>
        <div className="bg-black bg-opacity-40 w-[80vw] h-[80vh] min-h-[400px] flex flex-col p-2 font-mono text-white rounded-xl rounded-[0.5rem]">

          <div className="bg-black bg-opacity-90 flex-grow overflow-y-auto mb-4 border border-[1px] border-[var(--terminal-text)] rounded-[0.5rem] shadow-[0_0_20px_#0099ff99]">
            <div className="sticky top-0 bg-black bg-opacity-95 z-10 flex items-center justify-between p-2 mt-2 rounded-[0.5rem]">
              {/* message "system" */}
              <div className="flex justify-between items-center w-full">
                <SystemMessagesLayout
                  timeLeft={timeLeft}
                  guestsConnected={guestsConnected}
                  totalMessages={totalMessages}
                  systemMessages={systemMessages}
                  formatTime={formatTime}
                />
                <div className={`
                  ${isWalletConnected
                    ? 'animate-slide-center absolute left-1/2 transform -translate-x-1/2'
                    : 'ml-auto'}
                `}>
                  <Logo />
                </div>
                <div className="payDiv flex items-center mr-2">
                  {isWalletConnected && (
                    <button onClick={handlePay} id="payButton" className="terminal-button" aria-label="Pay">
                      {currentPrice ? `${currentPrice.toFixed(3)} SOL` : 'Loading price...'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', padding: '15px 1rem' }}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="message-group mb-4"
                  role="log"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  {msg.userMessage && (
                    <div
                      className={`text-white mb-1 text-right guest-message`}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      {msg.userMessage}
                    </div>
                  )}
                  {msg.aiResponse && (
                    <div className="text-white text-left terminal-response">
                      {msg.aiResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>


            <div ref={messagesEndRef} />
          </div>
          {isWalletConnected && (
            <div className="flex items-center mt-2">
              <input
                type="text"
                className="flex-1 bg-transparent text-white border border-[var(--terminal-text)] p-2 rounded mr-2 opacity-80"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                disabled={!publicKey}
                style={{
                  backgroundColor: !publicKey ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  cursor: !publicKey ? "not-allowed" : "text",
                }}
              />
              <button onClick={handleSendMessage} className="text-white" aria-label="Send Message">
                <Send size={24} />
              </button>
            </div>
          )}

          <div className="social-links">
            <SocialNetworkButtons />
          </div>

          {showDisconnectModal && (
            <DisconnectModal
              setShowDisconnectModal={setShowDisconnectModal}
              disconnectWallet={handleDisconnectWallet}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalChat;