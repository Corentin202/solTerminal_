// usePhantomWallet.js
import { useState, useEffect } from "react";

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
