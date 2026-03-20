import React from 'react';

const getProductId = (product) => product?.productId || product?._id;

const formatPrice = (price) => {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : 'N/A';
};

const ComparisonCard = ({ comparison, onViewProduct }) => {
  if (!comparison || !Array.isArray(comparison.items) || comparison.items.length === 0) {
    return null;
  }

  return (
    <div className="copilot-section">
      <h3>Comparison</h3>
      <div className="copilot-comparison-grid">
        {comparison.items.map((product, index) => {
          const productId = getProductId(product);

          return (
            <div key={productId || `comparison-${index}`} className="copilot-comparison-card">
              <div className="copilot-comparison-header">
                <h4>{product?.name || 'Unnamed product'}</h4>
                <button type="button" onClick={() => onViewProduct(productId)} disabled={!productId}>
                  Open
                </button>
              </div>
              <p><strong>Brand:</strong> {product?.brand || 'N/A'}</p>
              <p><strong>Category:</strong> {product?.category || 'N/A'}</p>
              <p><strong>Price:</strong> ${formatPrice(product?.price)}</p>
              <p><strong>Stock:</strong> {product?.stock ?? 'N/A'}</p>
              <p><strong>Description:</strong> {product?.description || 'N/A'}</p>
              <div className="copilot-specs">
                <strong>Specifications</strong>
                <ul>
                  {Object.entries(product?.specifications || {}).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      {Array.isArray(comparison.missingProductIds) && comparison.missingProductIds.length > 0 && (
        <p className="copilot-hint">
          Missing product IDs: {comparison.missingProductIds.join(', ')}
        </p>
      )}
    </div>
  );
};

export default ComparisonCard;
