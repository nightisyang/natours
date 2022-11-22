/* eslint-disable */

import { login } from './login';
import { logout } from './logout';
import { updateSettings } from './updateSettings';

import { displayMap } from './leaflet';
import 'regenerator-runtime/runtime.js';
const axios = require('axios');
// DOM ELEMENTS
const leafletMapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const submitUserDataForm = document.querySelector('.form-user-data');
const submitUserPasswordForm = document.querySelector('.form-user-password');

// DELEGATION
if (leafletMapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );

  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (submitUserDataForm) {
  submitUserDataForm.addEventListener('submit', e => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });
}

if (submitUserPasswordForm) {
  submitUserDataForm.addEventListener('submit', async e => {
    e.preventDefault();

    document.querySelector('.btn--save-password').innerHTML = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm = document.getElementById('password-confirm')
      .value;

    const data = { passwordCurrent, newPassword, newPasswordConfirm };

    await updateSettings(data, 'password');

    document.querySelector('.btn--save-password').innerHTML = 'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
