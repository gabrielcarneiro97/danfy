/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';

import './index.css';
import App from './App';
import { auth } from './services/api.service';

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
  const stop = auth.onAuthStateChanged(() => {
    ReactDOM.render(<App />, document.getElementById('root'));
    stop();
  });
});
