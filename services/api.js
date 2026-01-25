import { deleteItem } from "@/lib/secureStore";
import fetchWithCred from "./axios";

const API_BASE = 'https://app.quickfoodshop.co.uk/v1';
const ACCESS_TOKEN_KEY = 'accessToken';
// const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

//unprotected
export const CONFIG = {
  BASE_URL: 'https://app.quickfoodshop.co.uk/v1',
  headers: {
    accept: "application/json",
    // cache: 'no-store',
  },
};

export const fetchPopularStores = async () => {
  const response = await fetch(`${CONFIG.BASE_URL}/items/customers/popular-dishes`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch popular stores`);
  }

  const data = await response.json();
// console.log('DATA', data)
  return data;
};
export const fetchPopularDishes = async () => {
  const response = await fetch(`${CONFIG.BASE_URL}/items/customers/popular-dishes`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch popular dishes`);
  }

  const data = await response.json();
// console.log('DATA', data)
  return data;
};
export const fetchAllData = async ({query,limit}) => {
  const response = await fetch(`${CONFIG.BASE_URL}/items/customers/all?search=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
// console.log('DATA', res)
  return res.data;
};
export const fetchAllStores = async ({query,limit}) => {
  const q = query ?`/search?name=${encodeURIComponent(query)}`:''
  const response = await fetch(`${CONFIG.BASE_URL}/stores${q}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });

  if (!response.ok) {
    console.log('statuscode',response.status)
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  const stores = res.data?.stores || res.data
console.log('DATA', 'stores')
  return stores;
};
export const fetchStoreByID = async ({id}) => {
  const response = await fetch(`${CONFIG.BASE_URL}/stores/${id}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
// console.log('DATA', res.data)
  return res.data;
};
export const fetchGroceriesStores = async ({query,limit}) => {
  const response = await fetch(`${CONFIG.BASE_URL}/stores/groceries?search=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
// console.log('DATA', data)
  return res.data.stores;
};
export const fetchFood = async ({query,limit}) => {
  const response = await fetch(`${CONFIG.BASE_URL}/items/customers/food?search=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
// console.log('DATA', res)
  return res.data;
};

export const fetchFoodByID = async ({id}) => {
  try {
    const response = await fetchWithCred.get(`/items/customers/${id}`);
    const {data, rating} = response.data
    return data;
  } catch (error) {
    if (error.response) {
      // Server responded with non-2xx
      throw new Error(error.response.data?.message ?? 'Server error');
    }

    if (error.request) {
      // No response
      throw new Error('Network error');
    }

    throw new Error('Unexpected error');
  }
};

export const fetchFoodExtras = async ({query}) => {
  const response = await fetch(`${CONFIG.BASE_URL}/items/customers/extras?search=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  return res.data;
};
export const fetchRestaurants = async ({query}) => {
  const response = await fetch(`${CONFIG.BASE_URL}/stores/restaurant?search=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
// console.log('DATA', res.data)
  return res.data.stores;
};
export const fetchGroceries = async ({query}) => {
  const response = await fetch(`${CONFIG.BASE_URL}/items/customers/groceries?search=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch data groceries`);
  }

  const res = await response.json();
// console.log('DATA', res.data)
  return res.data;
};

export const getProfile = async () => {
  try {
    const response = await fetchWithCred('https://app.quickfoodshop.co.uk/v1/auth/profile');
    // console.log('dfyguioytfdrtfiu',response.data.data)
    return response.data.data;
  } catch (error) {
    if (error.response) {
      // Server responded with non-2xx
      throw new Error(error.response.data?.message ?? 'Server error');
    }

    if (error.request) {
      // No response
      throw new Error('Network error');
    }

    console.log(error)
    throw new Error('Unexpected error');
  }
};






const logoutAction = async () => {
  try {
    const response = await fetchWithCred.get('https://app.quickfoodshop.co.uk/v1/auth/logout');
    return response;
  } catch (error) {
    if (error.response) {
      // Server responded with non-2xx
      throw new Error(error.response.data?.message ?? 'Server error');
    }

    if (error.request) {
      // No response
      throw new Error('Network error');
    }

    console.log(error)
    throw new Error('Unexpected error');
  }
};
export async function logout() {
  await logoutAction()
  await deleteItem(ACCESS_TOKEN_KEY);
  // await deleteItem(REFRESH_TOKEN_KEY);
  await deleteItem(USER_DATA_KEY);
}

