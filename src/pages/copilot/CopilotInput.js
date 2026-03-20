import React from 'react';

const CopilotInput = ({
  currentInput,
  onInputChange,
  onSubmit,
  loading,
}) => (
  <form className="copilot-input-row" onSubmit={onSubmit}>
    <textarea
      value={currentInput}
      onChange={(event) => onInputChange(event.target.value)}
      placeholder="Ask about products, comparisons, shipping, or orders..."
      rows="3"
      disabled={loading}
    />
    <button type="submit" disabled={loading || !currentInput.trim()}>
      {loading ? 'Sending...' : 'Ask Copilot'}
    </button>
  </form>
);

export default CopilotInput;
