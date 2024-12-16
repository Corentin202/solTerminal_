import React from "react";

const SystemMessages = ({ messages, color }) => {
  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} style={{ color: color || "white" }} className="mb-2">
          {msg.text}
        </div>
      ))}
    </>
  );
};

export default SystemMessages;
