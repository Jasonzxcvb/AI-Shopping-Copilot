import React, { useMemo, useState } from 'react';

const getProductId = (product) => product?.productId || product?._id;

const formatPrice = (price) => {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : 'N/A';
};

const MAX_VISIBLE_PRODUCTS = 3;

const ProductRecommendationList = ({ products, onViewProduct, onAddToCart }) => {
  const [showAll, setShowAll] = useState(false);

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  if (safeProducts.length === 0) {
    return null;
  }

  const visibleProducts = showAll ? safeProducts : safeProducts.slice(0, MAX_VISIBLE_PRODUCTS);
  const hasMoreProducts = safeProducts.length > MAX_VISIBLE_PRODUCTS;

  return (
    <div className="copilot-section">
      <div className="copilot-section-heading">
        <h3>Recommended Products</h3>
        {hasMoreProducts && (
          <p className="copilot-section-note">
            Showing {visibleProducts.length} of {safeProducts.length} results
          </p>
        )}
      </div>
      <div className="copilot-product-grid">
        {visibleProducts.map((product, index) => {
          const productId = getProductId(product);

          return (
            <div key={productId || `recommended-${index}`} className="copilot-product-card">
              <h4>{product?.name || 'Unnamed product'}</h4>
              <p><strong>Brand:</strong> {product?.brand || 'N/A'}</p>
              <p><strong>Category:</strong> {product?.category || 'N/A'}</p>
              <p><strong>Price:</strong> ${formatPrice(product?.price)}</p>
              <p><strong>Stock:</strong> {product?.stock ?? 'N/A'}</p>
              <div className="copilot-card-actions">
                <button type="button" onClick={() => onViewProduct(productId)} disabled={!productId}>
                  View Details
                </button>
                <button type="button" onClick={() => onAddToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {hasMoreProducts && (
        <button
          type="button"
          className="copilot-toggle-button"
          onClick={() => setShowAll((prevShowAll) => !prevShowAll)}
        >
          {showAll ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

export default ProductRecommendationList;
