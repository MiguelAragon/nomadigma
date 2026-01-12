'use client';

import * as React from 'react';

// Cart item interface
export interface CartItem {
  id: string;
  logo: string;
  title: string;
  total: string;
  sku: string;
  quantity: number;
  label?: string;
  badge?: boolean;
}

// Define the state interface
interface StoreClientState {
  isWishlistSheetOpen: boolean;
  isCartSheetOpen: boolean;
  isProductDetailsSheetOpen: boolean;
  productDetailsId: string | null;
  cartItems: CartItem[];
}

// Define the action types
type StoreClientAction =
  | { type: 'SHOW_WISHLIST_SHEET' }
  | { type: 'CLOSE_WISHLIST_SHEET' }
  | { type: 'SHOW_CART_SHEET' }
  | { type: 'CLOSE_CART_SHEET' }
  | { type: 'SHOW_PRODUCT_DETAILS_SHEET'; productId: string }
  | { type: 'CLOSE_PRODUCT_DETAILS_SHEET' }
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'REMOVE_FROM_CART'; itemId: string }
  | { type: 'UPDATE_CART_ITEM_QUANTITY'; itemId: string; quantity: number }
  | { type: 'CLEAR_CART' };

// Initial state with sample cart items
const initialState: StoreClientState = {
  isWishlistSheetOpen: false,
  isCartSheetOpen: false,
  isProductDetailsSheetOpen: false,
  productDetailsId: null,
  cartItems: [
    {
      id: '1',
      logo: '11.png',
      title: 'Cloud Shift Lightweight Runner Pro Edition',
      total: '120.00',
      sku: 'BT-A1-YLW-8',
      quantity: 1,
    },
    {
      id: '2',
      logo: '12.png',
      title: 'Titan Edge High Impact Stability Lightweight..',
      total: '99.00',
      sku: 'SNK-888-RED-42',
      quantity: 1,
    },
    {
      id: '3',
      logo: '13.png',
      title: 'Cloud Shift Lightweight Runner Pro Edition',
      total: '120.00',
      sku: 'SD-999-TAN-38',
      quantity: 1,
    },
    {
      id: '4',
      logo: '15.png',
      title: 'Wave Strike Dynamic Boost Sneaker',
      label: '$179.00',
      total: '144.00',
      badge: true,
      sku: 'BT-444-BRN-7',
      quantity: 1,
    },
  ],
};

// Reducer to manage state
function storeClientReducer(
  state: StoreClientState,
  action: StoreClientAction,
): StoreClientState {
  switch (action.type) {
    case 'SHOW_WISHLIST_SHEET':
      return { ...state, isWishlistSheetOpen: true };
    case 'CLOSE_WISHLIST_SHEET':
      return { ...state, isWishlistSheetOpen: false };
    case 'SHOW_CART_SHEET':
      return { ...state, isCartSheetOpen: true };
    case 'CLOSE_CART_SHEET':
      return { ...state, isCartSheetOpen: false };
    case 'SHOW_PRODUCT_DETAILS_SHEET':
      return {
        ...state,
        isProductDetailsSheetOpen: true,
        productDetailsId: action.productId,
      };
    case 'CLOSE_PRODUCT_DETAILS_SHEET':
      return {
        ...state,
        isProductDetailsSheetOpen: false,
        productDetailsId: null,
      };
    case 'ADD_TO_CART':
      // Check if item already exists in cart
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === action.item.id
      );
      if (existingItemIndex >= 0) {
        // Increment quantity if item exists
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return { ...state, cartItems: updatedItems, isCartSheetOpen: true };
      }
      // Add new item to cart
      return {
        ...state,
        cartItems: [...state.cartItems, action.item],
        isCartSheetOpen: true,
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item.id !== action.itemId),
      };
    case 'UPDATE_CART_ITEM_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.id === action.itemId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cartItems: [] };
    default:
      return state;
  }
}

// Context interface
interface StoreClientContextValue {
  state: StoreClientState;
  showWishlistSheet: () => void;
  closeWishlistSheet: () => void;
  showCartSheet: () => void;
  closeCartSheet: () => void;
  showProductDetailsSheet: (productId: string) => void;
  closeProductDetailsSheet: () => void;
  handleAddToCart: (item: CartItem) => void;
  handleRemoveFromCart: (itemId: string) => void;
  handleUpdateCartItemQuantity: (itemId: string, quantity: number) => void;
  handleClearCart: () => void;
  cartItemsCount: number;
  cartTotal: number;
}

// Create context
const StoreClientContext = React.createContext<
  StoreClientContextValue | undefined
>(undefined);

// Provider component
export function StoreClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(storeClientReducer, initialState);

  const showWishlistSheet = () => dispatch({ type: 'SHOW_WISHLIST_SHEET' });
  const closeWishlistSheet = () => dispatch({ type: 'CLOSE_WISHLIST_SHEET' });
  const showCartSheet = () => dispatch({ type: 'SHOW_CART_SHEET' });
  const closeCartSheet = () => dispatch({ type: 'CLOSE_CART_SHEET' });
  const showProductDetailsSheet = (productId: string) =>
    dispatch({ type: 'SHOW_PRODUCT_DETAILS_SHEET', productId });
  const closeProductDetailsSheet = () =>
    dispatch({ type: 'CLOSE_PRODUCT_DETAILS_SHEET' });
  const handleAddToCart = (item: CartItem) =>
    dispatch({ type: 'ADD_TO_CART', item });
  const handleRemoveFromCart = (itemId: string) =>
    dispatch({ type: 'REMOVE_FROM_CART', itemId });
  const handleUpdateCartItemQuantity = (itemId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_CART_ITEM_QUANTITY', itemId, quantity });
  const handleClearCart = () => dispatch({ type: 'CLEAR_CART' });

  // Calculate cart items count and total
  const cartItemsCount = state.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const cartTotal = state.cartItems.reduce(
    (sum, item) => sum + parseFloat(item.total) * item.quantity,
    0
  );

  const value: StoreClientContextValue = {
    state,
    showWishlistSheet,
    closeWishlistSheet,
    showCartSheet,
    closeCartSheet,
    showProductDetailsSheet,
    closeProductDetailsSheet,
    handleAddToCart,
    handleRemoveFromCart,
    handleUpdateCartItemQuantity,
    handleClearCart,
    cartItemsCount,
    cartTotal,
  };

  return (
    <StoreClientContext.Provider value={value}>
      {children}
    </StoreClientContext.Provider>
  );
}

// Custom hook to access context
export function useStoreClient() {
  const context = React.useContext(StoreClientContext);
  if (!context) {
    throw new Error('useStoreGood must be used within a StoreClientProvider');
  }
  return context;
}
