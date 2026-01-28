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
  productType?: 'PHYSICAL' | 'DIGITAL';
  label?: string;
  badge?: boolean;
  selectedVariants?: Record<string, string>; // { [variantLabel]: variantValue }
}

// Define the state interface
interface StoreClientState {
  isWishlistSheetOpen: boolean;
  cartItems: CartItem[];
}

// Define the action types
type StoreClientAction =
  | { type: 'SHOW_WISHLIST_SHEET' }
  | { type: 'CLOSE_WISHLIST_SHEET' }
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'REMOVE_FROM_CART'; itemId: string }
  | { type: 'UPDATE_CART_ITEM_QUANTITY'; itemId: string; quantity: number }
  | { type: 'CLEAR_CART' };

// LocalStorage key
const CART_STORAGE_KEY = 'nomadigma_cart';

// Helper functions for localStorage
function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
}

function saveCartToStorage(cartItems: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

// Initial state - load cart from localStorage
const getInitialState = (): StoreClientState => {
  const cartItems = loadCartFromStorage();
  return {
    isWishlistSheetOpen: false,
    cartItems,
  };
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
    case 'ADD_TO_CART':
      // Check if item already exists in cart with same variants
      const existingItemIndex = state.cartItems.findIndex(
        (item) => {
          if (item.id !== action.item.id) return false;
          // Compare variants
          const itemVariants = JSON.stringify(item.selectedVariants || {});
          const newItemVariants = JSON.stringify(action.item.selectedVariants || {});
          return itemVariants === newItemVariants;
        }
      );
      let newCartItems: CartItem[];
      
      // Verificar si el producto es gratis (precio 0)
      const isFree = parseFloat(action.item.total) === 0;
      
      if (existingItemIndex >= 0) {
        // Si es gratis, no permitir incrementar cantidad más allá de 1
        if (isFree) {
          // Si ya existe y es gratis, mantener cantidad en 1
          newCartItems = [...state.cartItems];
          newCartItems[existingItemIndex] = {
            ...newCartItems[existingItemIndex],
            quantity: 1,
          };
        } else {
          // Increment quantity if item exists with same variants
          newCartItems = [...state.cartItems];
          newCartItems[existingItemIndex] = {
            ...newCartItems[existingItemIndex],
            quantity: newCartItems[existingItemIndex].quantity + 1,
          };
        }
      } else {
        // Add new item to cart (siempre con cantidad 1 si es gratis)
        newCartItems = [...state.cartItems, { ...action.item, quantity: 1 }];
      }
      saveCartToStorage(newCartItems);
      return { ...state, cartItems: newCartItems };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.cartItems.filter((item) => item.id !== action.itemId);
      saveCartToStorage(filteredItems);
      return {
        ...state,
        cartItems: filteredItems,
      };
    case 'UPDATE_CART_ITEM_QUANTITY':
      // Si la cantidad es 0 o menor, eliminar el producto del carrito
      if (action.quantity <= 0) {
        const filteredItems = state.cartItems.filter((item) => item.id !== action.itemId);
        saveCartToStorage(filteredItems);
        return {
          ...state,
          cartItems: filteredItems,
        };
      }
      // Verificar si el producto es gratis
      const itemToUpdate = state.cartItems.find((item) => item.id === action.itemId);
      const isItemFree = itemToUpdate && parseFloat(itemToUpdate.total) === 0;
      
      // Si es gratis, limitar cantidad a 1
      const finalQuantity = isItemFree ? Math.min(action.quantity, 1) : action.quantity;
      
      // Actualizar la cantidad normalmente
      const updatedItems = state.cartItems.map((item) =>
        item.id === action.itemId
          ? { ...item, quantity: finalQuantity }
          : item
      );
      saveCartToStorage(updatedItems);
      return {
        ...state,
        cartItems: updatedItems,
      };
    case 'CLEAR_CART':
      saveCartToStorage([]);
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
  const [state, dispatch] = React.useReducer(storeClientReducer, getInitialState());

  const showWishlistSheet = () => dispatch({ type: 'SHOW_WISHLIST_SHEET' });
  const closeWishlistSheet = () => dispatch({ type: 'CLOSE_WISHLIST_SHEET' });
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
