import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useReducer, useEffect, useRef, useMemo } from "react";
import { useAuth } from './authContext';


// ✅ Initial state
const initialState = {
  cartItems: [],
  hasLoaded: false,
  deliveryAddress:null
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
  SET_ADDRESS: "SET_ADDRESS",
  REMOVE_ADDRESS: "REMOVE_ADDRESS",
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

    case ACTIONS.SET_ADDRESS:
      return { ...state, deliveryAddress: action.payload };

    case ACTIONS.REMOVE_ADDRESS:
      return { ...state, deliveryAddress: null };

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
  const {user } = useAuth();
  const storageKey = user?.id ? `cartItems_${user.id}` : `cartItems_guest`;

  // Load and merge cart from localStorage + server
  useEffect(() => {
    async function loadCart() {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const storedAddress = await AsyncStorage.getItem('address');
        const localCart = stored ? JSON.parse(stored) : [];   
        const localAddress = storedAddress ? JSON.parse(storedAddress) : null;
        if (localAddress) {
          dispatch({ type: ACTIONS.SET_ADDRESS, payload: localAddress });
        }     
        // const res = await fetch('/api/cart');
        const serverCart = [];

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
    if (!state.hasLoaded) return;
    async function saveCart() {
      const prevCart = prevCartRef.current;
      const currentCart = state.cartItems;

      if (JSON.stringify(prevCart) !== JSON.stringify(currentCart)) {
        try {
          await AsyncStorage.setItem(storageKey, JSON.stringify(currentCart));
        } catch (err) {
          console.error('Failed to save cart:', err);
        }
        prevCartRef.current = currentCart;
      }
      try {
        if (state.deliveryAddress) {
          await AsyncStorage.setItem('address', JSON.stringify(state.deliveryAddress));
        } else {
          await AsyncStorage.removeItem('address');
        }
      } catch (err) {
        console.error('Failed to save address:', err);
      }
    }
    saveCart()
  }, [state.cartItems, state.hasLoaded,state.deliveryAddress]);


  // ✅ Action creators
  const addToCart = item => {
    // console.log(item)
    const sanitized = {
      id: item?._id?.toString(),
      name: item?.itemName,
      price: item?.price,
      quantity: 1,
      description:item?.description,
      category: item?.categoryId?.name,
      isAvailable: item?.isAvailable,
      // seller: `${item?.vendorId?.firstName} ${item?.vendorId?.lastName}`,
      location: item?.vendorId?.location,
      image: item.image,
    };
    dispatch({ type: ACTIONS.ADD_ITEM, payload: sanitized });
  };

  const updateQuantity = (id, delta) =>
    dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id, delta } });

  const removeItem = id => dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id });

  const clearCart = () => dispatch({ type: ACTIONS.CLEAR_CART });

  const setCartItems = items =>
    dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: items });

  const setAddress = address =>
    dispatch({ type: ACTIONS.SET_ADDRESS, payload: address });

  const removeAddress = () =>
    dispatch({ type: ACTIONS.REMOVE_ADDRESS });


  // ✅ Derived values
  const cartCount = useMemo(() => state.cartItems.length, [state.cartItems]);
  const totalPrice = useMemo(() => state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [state.cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        deliveryAddress: state.deliveryAddress,
        cartCount,    // number of distinct line items (not total quantity)
        totalPrice,   // sum of price * quantity
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        setCartItems,
        setAddress,
        removeAddress,
        dispatch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
