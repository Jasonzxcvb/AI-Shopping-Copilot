const CART_STORAGE_KEY = 'cart';

const getProductId = (product) => product?.productId || product?._id;

const getStoredCartItems = () => {
  try {
    const parsedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    return [];
  }
};

const getProductImageUrl = (product) => {
  if (typeof product?.imageUrl === 'string' && product.imageUrl.trim()) {
    return product.imageUrl;
  }

  if (typeof product?.image === 'string' && product.image.trim()) {
    return product.image;
  }

  if (Array.isArray(product?.images) && typeof product.images[0] === 'string') {
    return product.images[0];
  }

  return '';
};

export function addProductToCart(product, quantity = 1) {
  const productId = getProductId(product);
  const normalizedQuantity = Math.max(1, Number(quantity) || 1);

  if (!productId) {
    return;
  }

  const cartItems = getStoredCartItems();
  const existingProductIndex = cartItems.findIndex((item) => item?.productId === productId);

  if (existingProductIndex !== -1) {
    cartItems[existingProductIndex].quantity += normalizedQuantity;
    if (!cartItems[existingProductIndex].imageUrl) {
      cartItems[existingProductIndex].imageUrl = getProductImageUrl(product);
    }
  } else {
    cartItems.push({
      productId,
      name: product?.name || 'Unnamed product',
      price: Number(product?.price) || 0,
      imageUrl: getProductImageUrl(product),
      quantity: normalizedQuantity,
      stock: product?.stock,
      brand: product?.brand,
      category: product?.category,
    });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}
