// utils.js
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
  
  