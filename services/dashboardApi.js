import {fetchWithCred} from '../lib/auth';


export const getProfile = async () => {
  try {
    const response = await fetchWithCred('/auth/profile');
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

    console.log(error);
    throw new Error('Unexpected error');
  }
};
export const updateProfile = async ({ payload }) => {
  try {
    const response = await fetchWithCred.patch('/auth/update-profile', payload);
    // console.log('dfyguioytfdrtfiu',response.data.data)
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with non-2xx
      throw new Error(error.response.data?.message ?? 'Server error');
    }

    if (error.request) {
      // No response
      throw new Error('Network error');
    }

    console.log(error);
    throw new Error('Unexpected error');
  }
};

export const changePwd = async ({ payload, role }) => {
  const url = role === 'customer' ? '/auth/change-password' : role === 'vendor' ? '/vendor/auth/change-password' : '/auth/rider/change-password';
  console.log(payload, role, url)
  try {
    await fetchWithCred.post(url, payload,);
    return { success:true }
  } catch (error) {
    if (error?.response) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Unexpected error'
      );
    }

    if (error.request) {
      // No response
      throw new Error('Network error');
    }
    throw new Error('Unexpected error');
  }
};