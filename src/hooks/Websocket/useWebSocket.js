import { useEffect, useRef } from "react";

const useWebSocket = ({
    setGuestsConnected,
    setCurrentPrice,
    setTimeLeft,
    setChatMessages,
    setTotalMessages,
    setTransferButton,
}) => {
    const socketRef = useRef(null);

    useEffect(() => {
        const createWebSocket = () => {
            const socket = new WebSocket("wss://api.solterminal.net:8000/ws");
            socketRef.current = socket;

            const clientId = Math.random().toString(36).substring(7);

            socket.onopen = () => {
                socket.send(JSON.stringify({ type: "register", clientId }));
                socket.send(JSON.stringify({ action: "message_history" }));
                socket.send(JSON.stringify({ action: "get_timer" }));
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "guests") setGuestsConnected(data.guests);
                    if (data.type === "price") setCurrentPrice(data.current_price);
                    if (data.type === "timer") setTimeLeft(data.remaining_seconds);

                    if (data.type === "history") {
                        setChatMessages((prev) => {
                            const newMessages = data.data.map((message) => ({
                                id: `history-${message.message_content}-${message.ai_response}`,
                                userMessage: `guest@terminal:~$ ${message.message_content}`,
                                aiResponse: `TERMINAL: ${message.ai_response}`,
                            }));

                            // Filtrer les doublons
                            const filteredMessages = newMessages.filter(
                                (newMsg) =>
                                    !prev.some((prevMsg) => prevMsg.id === newMsg.id)
                            );

                            return [...prev, ...filteredMessages];
                        });

                        if (data.data[0]?.total_messages) {
                            setTotalMessages(data.data[0].total_messages);
                        }
                    }

                    // Regrouper un message utilisateur et une réponse dans la même div
                    if (data.message || data.ai_response) {
                        setChatMessages((prev) => {
                            const lastEntry = prev[prev.length - 1];

                            // Si le dernier élément contient déjà une question sans réponse
                            if (
                                lastEntry &&
                                !lastEntry.aiResponse &&
                                data.message
                            ) {
                                return prev.map((msg, index) =>
                                    index === prev.length - 1
                                        ? {
                                              ...msg,
                                              userMessage: `guest@terminal:~$ ${data.message}`,
                                          }
                                        : msg
                                );
                            } else if (
                                lastEntry &&
                                !lastEntry.userMessage &&
                                data.ai_response
                            ) {
                                return prev.map((msg, index) =>
                                    index === prev.length - 1
                                        ? {
                                              ...msg,
                                              aiResponse: `TERMINAL: ${data.ai_response}`,
                                          }
                                        : msg
                                );
                            }

                            // Sinon, ajouter un nouvel élément groupé
                            return [
                                ...prev,
                                {
                                    id: `live-${data.message || data.ai_response}`,
                                    userMessage: data.message
                                        ? `guest@terminal:~$ ${data.message}`
                                        : null,
                                    aiResponse: data.ai_response
                                        ? `TERMINAL: ${data.ai_response}`
                                        : null,
                                },
                            ];
                        });
                    }

                    if (data.showTransferButton) {
                        setTransferButton({
                            label: data.transferButtonDetails.label,
                            recipientPublicKey: data.transferButtonDetails.recipientPublicKey,
                        });
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            socket.onclose = () => {
                console.log("WebSocket closed. Attempting to reconnect...");
                setTimeout(() => {
                    createWebSocket(); // Reconnexion propre
                }, 3000);
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        };

        createWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [setGuestsConnected, setCurrentPrice, setTimeLeft, setChatMessages, setTotalMessages, setTransferButton]);

    return socketRef;
};

export default useWebSocket;
