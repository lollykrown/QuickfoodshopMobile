import { getItem } from '@/lib/secureStore';
import { success } from 'zod';

const API_BASE = 'https://app.quickfoodshop.co.uk/v1';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

async function apiFetch(url, options = {}) {
  const token = await getItem(ACCESS_TOKEN_KEY);
  //add token refresh
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

//unprotected
export const CONFIG = {
  BASE_URL: 'https://app.quickfoodshop.co.uk/v1',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json'
    // cache: 'no-store',
  },
};

export const fetchPopularStores = async () => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/items/customers/popular-dishes`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch popular stores`);
  }

  const data = await response.json();
  // console.log('DATA', data)
  return data;
};
export const fetchPopularDishes = async () => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/items/customers/popular-dishes`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch popular dishes`);
  }

  const data = await response.json();
  // console.log('DATA', data)
  return data;
};
export const fetchAllData = async ({ query, limit }) => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/items/customers/all?search=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  // console.log('DATA', res)
  return res.data;
};
export const fetchAllStores = async ({ query, limit }) => {
  const q = query ? `/search?name=${encodeURIComponent(query)}` : '';
  const response = await fetch(`${CONFIG.BASE_URL}/stores${q}`, {
    method: 'GET',
    headers: CONFIG.headers,
  });

  if (!response.ok) {
    console.log('statuscode', response.status);
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  const stores = res.data?.stores || res.data;
  console.log('DATA', 'stores');
  return stores;
};
export const fetchStoreByID = async ({ id }) => {
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
export const fetchGroceriesStores = async ({ query, limit }) => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/stores/groceries?search=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  // console.log('DATA', data)
  return res.data.stores;
};
export const fetchFood = async ({ query, limit }) => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/items/customers/food?search=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  // console.log('DATA', res)
  return res.data;
};

export const fetchFoodByID = async ({ id }) => {
  const response = await fetch(`${CONFIG.BASE_URL}/items/customers/${id}`,{
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

export const fetchFoodExtras = async ({ query }) => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/items/customers/extras?search=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  return res.data;
};
export const fetchRestaurants = async ({ query }) => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/stores/restaurant?search=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const res = await response.json();
  // console.log('DATA', res.data)
  return res.data.stores;
};
export const fetchGroceries = async ({ query }) => {
  const response = await fetch(
    `${CONFIG.BASE_URL}/items/customers/groceries?search=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: CONFIG.headers,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch data groceries`);
  }

  const res = await response.json();
  // console.log('DATA', res.data)
  return res.data;
};
export const forgetPwd = async ({ email,role }) => {
  const url = role === 'customer' ? '/auth/forget-password' : role === 'vendor' ? '/vendor/auth/forget-password' : '/auth/rider/forget-password';

  try {
    const response = await fetch(`${CONFIG.BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...CONFIG.headers,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      // 👇 return backend message if available
      throw new Error(data?.message || 'Failed to reset password');
    }

    return { success:true };
  } catch (error) {
    // console.log('Forget password error:', error.message);
    throw error;
  }
};
export const resetPwd = async ({ payload, role }) => {
  const url = role === 'customer' ? '/auth/reset-password' : role === 'vendor' ? '/vendor/auth/reset-password' : '/auth/rider/reset-password';

  try {
    const response = await fetch(`${CONFIG.BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        ...CONFIG.headers,
      },
      body: JSON.stringify({ ...payload, "password": "Kvothe1!" }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 👇 return backend message if available
      throw new Error(data?.message || 'Failed to reset password');
    }
    // console.log('yhhb',payload, role);

    return { success:true };
  } catch (error) {
    // console.log('Forget password error:', error.message);
    throw error;
  }
};



