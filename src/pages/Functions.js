import { useState, useEffect } from "react";
import * as solanaWeb3 from "@solana/web3.js";
import { verifyTransaction } from '../hooks/Payment/transactionVerification';
import { Connection, clusterApiUrl } from '@solana/web3.js';


export const showTemporaryMessage = (message, color, setSystemMessages) => {
  const newMessage = {
    id: Date.now(),
    text: `System > ${message}`,
    color,
  };

  setSystemMessages((prevMessages) => [...prevMessages, newMessage]);

  setTimeout(() => {
    setSystemMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== newMessage.id)
    );
  }, 3000);
};

export const usePhantomWallet = (showTemporaryMessage) => {
  const [provider, setProvider] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    const getProvider = () => {
      if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) return provider;
      }
      return null;
    };

    const detectedProvider = getProvider();
    setProvider(detectedProvider);

    const handleAccountChanged = () => disconnectWallet();
    if (detectedProvider) {
      detectedProvider.on("accountChanged", handleAccountChanged);
      return () => detectedProvider.off("accountChanged", handleAccountChanged);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      showTemporaryMessage("Phantom Wallet is not installed!", "red");
      window.open("https://phantom.app/", "_blank");
      return;
    }
    try {
      showTemporaryMessage("Connecting to Phantom Wallet...", "blue");
      const response = await provider.connect();
      setPublicKey(response.publicKey.toString());
      showTemporaryMessage("Wallet connected successfully!", "green");
    } catch (error) {
      showTemporaryMessage(`Error during connection: ${error.message}`, "red");
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    showTemporaryMessage("Wallet disconnected.", "yellow");
  };

  return { provider, publicKey, connectWallet, disconnectWallet };
};
export const usePayment = (showTemporaryMessage) => {
  const initiatePayment = async (walletAddress) => {
    const provider = window.solana;
    if (!provider) {
      showTemporaryMessage("Please install Phantom Wallet to use this feature.", "red");
      return false;
    }

    const loader = document.createElement('div');
    loader.innerHTML = `
      <svg viewBox="25 25 50 50">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
    `;
    loader.classList.add('loaderPay');
    document.querySelector('.payDiv').prepend(loader);

    try {
      const wallet = await provider.connect();
      const senderPublicKey = wallet.publicKey.toString();
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
      // Create transaction
      const response = await fetch(
        "https://api.solterminal.net:8000/create-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ senderPublicKey }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Error creating transaction.";
        showTemporaryMessage(errorMessage, "red");
        return false;
      }
    
      const { transaction: base64Transaction, lastValidBlockHeight } = await response.json();
      
      const transaction = solanaWeb3.Transaction.from(
        Uint8Array.from(atob(base64Transaction), c => c.charCodeAt(0))
      );
  
      // Sign and send transaction
      const signedTransaction = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Verify transaction
      const verificationResult = await verifyTransaction(signature, connection);
      
      if (verificationResult.success) {
        // Update backend about successful payment
        await fetch("https://api.solterminal.net:8000/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            signature: verificationResult.signature,
            walletAddress: senderPublicKey,
            timestamp: verificationResult.timestamp
          }),
        });

        showTemporaryMessage("Payment successful. IdTransaction: " + signature, "green");
        return true;
      } else {
        throw new Error("Transaction verification failed");
      }
    } catch (error) {
      console.error("Error during payment:", error);
      showTemporaryMessage("Payment failed: " + error.message, "red");
      return false;
    } finally {
      loader.remove();
    }
  };
  return { initiatePayment };
};