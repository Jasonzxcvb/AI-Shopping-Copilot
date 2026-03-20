import React from 'react';

const ChatMessageList = ({ messages, loading }) => {
  if (messages.length === 0) {
    return (
      <div className="copilot-empty">
        <p>Ask the Copilot about products, comparisons, policies, or order status.</p>
      </div>
    );
  }

  return (
    <div className="copilot-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`copilot-message copilot-message-${message.role}`}
        >
          <div className="copilot-message-role">
            {message.role === 'user' ? 'You' : 'Copilot'}
          </div>
          <p>{message.text}</p>
        </div>
      ))}
      {loading && (
        <div className="copilot-message copilot-message-assistant">
          <div className="copilot-message-role">Copilot</div>
          <p>Thinking...</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;
