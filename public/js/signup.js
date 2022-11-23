/* eslint-disable */
import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://thisyoung.rocks/natours/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
        role: 'user'
      }
    });

    // if (res.data.password !== res.data.confirmPassword) {
    //   showAlert('Failed', 'Password is not the same!');
    // }

    if (res.data.status === 'success') {
      showAlert('success', 'Signed up successfully!');

      window.setTimeout(() => {
        location.assign('/natours');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};
