/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  // send request to server
  try {
    const url =
      type === 'password'
        ? 'http://thisyoung.rocks/natours/api/v1/users/updatePassword'
        : 'http://thisyoung.rocks/natours/api/v1/users/updateMe';

    const msg = type === 'password' ? 'Password updated!' : 'Details updated!';

    if (type === 'data') {
      const res = await axios({
        method: 'PATCH',
        url,
        data
      });

      if (res.data.status === 'success') {
        showAlert('success', msg);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
