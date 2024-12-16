import React from 'react';

const DisconnectModal = ({ setShowDisconnectModal, disconnectWallet }) => {
    const handleDisconnectWallet = () => {
        disconnectWallet();
        setShowDisconnectModal(false);
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-xl shadow-[0_0_20px_#0099ff99] backdrop-filter backdrop-blur-sm">
            <div className="bg-black bg-opacity-90 p-4 rounded-lg shadow-[0_0_20px_#0099ff99]">
                <p>Do you really want to disconnect?</p>
                <div className="bg-transparent flex justify-end mt-4">
                    <button
                        onClick={() => setShowDisconnectModal(false)}
                        className="mr-2 bg-transparent border-2 border-white p-2 rounded text-white hover:bg-white hover:text-black"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDisconnectWallet}
                        className="bg-transparent border-2 border-white text-white p-2 rounded hover:bg-white hover:text-black"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisconnectModal;