import {fetchWithCred} from '../lib/auth';


export const getProfile = async () => {
  try {
    const response = await fetchWithCred('/auth/profile');
    console.log('dfyguioytfdrtfiu', response.data.data);
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
    const response = await fetchWithCred.patch('/auth/update-profile', {
      data: payload,
    });
    // console.log('dfyguioytfdrtfiu',response.data.data)
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with non-2xx
      throw new Error(error.response?.message ?? 'Server error');
    }

    if (error.request) {
      // No response
      throw new Error('Network error');
    }

    console.log(error);
    throw new Error('Unexpected error');
  }
};