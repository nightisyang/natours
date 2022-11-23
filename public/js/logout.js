/* eslint-disable */

import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://thisyoung.rocks/natours/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');

      // have a fresh page coming from the server without res.locals.user
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
