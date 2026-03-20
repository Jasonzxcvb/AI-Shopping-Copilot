import React, { useEffect, useState } from 'react';
import ChatMessageList from './ChatMessageList';
import CopilotInput from './CopilotInput';
import ProductRecommendationList from './ProductRecommendationList';
import ComparisonCard from './ComparisonCard';
import { sendCopilotMessage } from '../../services/aiCopilotService';

const SAMPLE_PROMPTS = [
  'Find me a Dell laptop under 1500',
  'Compare product 1 and 2',
  'What is your shipping policy?',
  'Check my order status',
];

const FALLBACK_REPLY = 'I found the information you requested.';
const FRIENDLY_ERROR = 'Copilot is temporarily unavailable. Please try again in a moment.';
const COPILOT_STORAGE_KEY = 'copilot-panel-state';

const normalizeResponseData = (data) => {
  const safeData = data && typeof data === 'object' ? data : {};

  return {
    context: safeData.context && typeof safeData.context === 'object' ? safeData.context : null,
    reply: typeof safeData.reply === 'string' && safeData.reply.trim()
      ? safeData.reply
      : FALLBACK_REPLY,
    products: Array.isArray(safeData.products) ? safeData.products : [],
    comparison: safeData.comparison && typeof safeData.comparison === 'object'
      ? safeData.comparison
      : null,
    actions: Array.isArray(safeData.actions) ? safeData.actions : [],
  };
};

const getPersistedState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawState = window.sessionStorage.getItem(COPILOT_STORAGE_KEY);
    if (!rawState) {
      return null;
    }

    const parsedState = JSON.parse(rawState);
    return parsedState && typeof parsedState === 'object' ? parsedState : null;
  } catch (error) {
    return null;
  }
};

const getActionProductId = (action) => (
  action?.payload?.productId
  || action?.payload?._id
  || action?.productId
  || action?._id
);

const CopilotPanel = ({ onViewProduct, onAddToCart }) => {
  const persistedState = getPersistedState();
  const [messages, setMessages] = useState(() => Array.isArray(persistedState?.messages) ? persistedState.messages : []);
  const [currentInput, setCurrentInput] = useState(() => typeof persistedState?.currentInput === 'string' ? persistedState.currentInput : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResponse, setAiResponse] = useState(() => persistedState?.aiResponse || null);
  const [recommendedProducts, setRecommendedProducts] = useState(() => Array.isArray(persistedState?.recommendedProducts) ? persistedState.recommendedProducts : []);
  const [comparison, setComparison] = useState(() => persistedState?.comparison || null);
  const [actions, setActions] = useState(() => Array.isArray(persistedState?.actions) ? persistedState.actions : []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stateToPersist = {
      messages,
      currentInput,
      aiResponse,
      recommendedProducts,
      comparison,
      actions,
    };

    window.sessionStorage.setItem(COPILOT_STORAGE_KEY, JSON.stringify(stateToPersist));
  }, [actions, aiResponse, comparison, currentInput, messages, recommendedProducts]);

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `${role}-${Date.now()}-${Math.random()}`,
        role,
        text,
      },
    ]);
  };

  const handleSubmitMessage = async (message) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    appendMessage('user', trimmedMessage);
    setCurrentInput('');
    setError('');
    setLoading(true);

    try {
      const response = await sendCopilotMessage(trimmedMessage);

      if (!response.success) {
        throw new Error(response.error?.message || 'Unable to get a response from Copilot.');
      }

      const normalizedData = normalizeResponseData(response.data);

      setAiResponse(normalizedData);
      setRecommendedProducts(normalizedData.products);
      setComparison(normalizedData.comparison);
      setActions(normalizedData.actions);
      appendMessage('assistant', normalizedData.reply);
    } catch (requestError) {
      setAiResponse(null);
      setRecommendedProducts([]);
      setComparison(null);
      setActions([]);
      setError(FRIENDLY_ERROR);
      appendMessage('assistant', FRIENDLY_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    await handleSubmitMessage(currentInput);
  };

  const handlePromptClick = async (prompt) => {
    setCurrentInput(prompt);
    await handleSubmitMessage(prompt);
  };

  const handleActionClick = (action) => {
    const productId = getActionProductId(action);

    if (action?.type === 'view_product' && productId) {
      onViewProduct(productId);
    }
  };

  return (
    <aside className="copilot-panel">
      <div className="copilot-panel-header">
        <h2>AI Shopping Copilot</h2>
        <p>Ask about products, comparisons, policies, or order status.</p>
      </div>

      <div className="copilot-samples">
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <ChatMessageList messages={messages} loading={loading} />

      {error && <p className="copilot-error">{error}</p>}

      <CopilotInput
        currentInput={currentInput}
        onInputChange={setCurrentInput}
        onSubmit={handleFormSubmit}
        loading={loading}
      />

      {aiResponse?.context?.requiresUserId && (
        <p className="copilot-hint">
          Tip: log in with a user account so the Copilot can include your userId for order checks.
        </p>
      )}

      <ProductRecommendationList
        products={recommendedProducts}
        onViewProduct={onViewProduct}
        onAddToCart={onAddToCart}
      />

      <ComparisonCard
        comparison={comparison}
        onViewProduct={onViewProduct}
      />

      {actions.length > 0 && (
        <div className="copilot-section">
          <h3>Suggested Actions</h3>
          <div className="copilot-action-list">
            {actions.map((action, index) => (
              <button
                key={`${action?.type || 'action'}-${index}`}
                type="button"
                className="copilot-action-tag"
                onClick={() => handleActionClick(action)}
                disabled={action?.type !== 'view_product' || !getActionProductId(action)}
              >
                {action?.label || action?.type || 'Suggested action'}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default CopilotPanel;
