import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useReducer, useEffect, useRef, useMemo } from "react";

// ✅ Initial state
const initialState = {
  cartItems: [],
  hasLoaded: false,
};

// ✅ Actions
const ACTIONS = {
  LOAD_CART: "LOAD_CART",
  ADD_ITEM: "ADD_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_CART: "CLEAR_CART",
  SET_CART_ITEMS: "SET_CART_ITEMS",
  SET_LOADED: "SET_LOADED",
};

// ✅ Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_CART:
      return { ...state, cartItems: action.payload || [] };

    case ACTIONS.ADD_ITEM: {
      const exists = state.cartItems.some(item => item.id === action.payload.id);
      if (exists) return state;
      return { ...state, cartItems: [...state.cartItems, action.payload] };
    }

    case ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, item.quantity + action.payload.delta) }
            : item
        ),
      };

    case ACTIONS.REMOVE_ITEM:
      return { ...state, cartItems: state.cartItems.filter(item => item.id !== action.payload) };

    case ACTIONS.CLEAR_CART:
      return { ...state, cartItems: [] };

    case ACTIONS.SET_CART_ITEMS:
      return { ...state, cartItems: action.payload || [] };

    case ACTIONS.SET_LOADED:
      return { ...state, hasLoaded: true };

    default:
      return state;
  }
};

// ✅ Context
const CartContext = createContext();

// ✅ Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const prevCartRef = useRef([]);

  // Load and merge cart from localStorage + server
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function loadCart() {
      try {
        const localCart = JSON.parse(AsyncStorage.getItem('cartItems') || '[]');
        // const res = await fetch('/api/cart');
        const res = {ok:false}
        const serverCart = res.ok ? await res.json() : [];

        const mergedMap = new Map();
        serverCart.forEach(item => mergedMap.set(item.id, item));
        localCart.forEach(item => {
          if (mergedMap.has(item.id)) {
            const existing = mergedMap.get(item.id);
            mergedMap.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
          } else {
            mergedMap.set(item.id, item);
          }
        });

        dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: Array.from(mergedMap.values()) });
      } catch (err) {
        console.error("Failed to load cart:", err);
      } finally {
        dispatch({ type: ACTIONS.SET_LOADED });
      }
    }

    loadCart();
  }, []);

  // Sync to localStorage and dispatch cart-updated event only when cart changes
  useEffect(() => {
    if (typeof window !== 'undefined' && state.hasLoaded) {
      const prevCart = prevCartRef.current;
      const currentCart = state.cartItems;

      if (JSON.stringify(prevCart) !== JSON.stringify(currentCart)) {
        try {
          AsyncStorage.setItem('cartItems', JSON.stringify(currentCart));
          AsyncStorage.setItem('cartCount', currentCart.length);
          window.dispatchEvent(new Event('cart-updated')); // for navbar update
        } catch (err) {
          console.error('Failed to save cart:', err);
        }
        prevCartRef.current = currentCart;
      }
    }
  }, [state.cartItems, state.hasLoaded]);

  // ✅ Action creators
  const addToCart = item => {
    const sanitized = {
      id: item.id,
      name: item.item_name,
      price: item.price,
      quantity: 1,
      seller: `${item.user.first_name} ${item.user.last_name}`,
      address: `${item.address.street}, ${item.address.city}, ${item.address.state}`,
      image: item.gallery_images?.[0] || '/placeholder.png',
    };
    dispatch({ type: ACTIONS.ADD_ITEM, payload: sanitized });
  };

  const updateQuantity = (id, delta) =>
    dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id, delta } });

  const removeItem = id => dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id });

  const clearCart = () => dispatch({ type: ACTIONS.CLEAR_CART });

  const setCartItems = items =>
    dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: items });

  // ✅ Derived values
  const cartCount = useMemo(() => state.cartItems.length, [state.cartItems]);
  const totalPrice = useMemo(() => state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [state.cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        cartCount,    // total quantity
        totalPrice,   // total price
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        setCartItems,
        dispatch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
