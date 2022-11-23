/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (name, email) => {
  // send request to server
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://thisyoung.rocks/natours/api/v1/users/updateMe',
      data: {
        name,
        email
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Details updated!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
