/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from 'firebase';

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { auth } from './services';

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
  const stop = auth.onAuthStateChanged(() => {
    ReactDOM.render(<App />, document.getElementById('root'));
    stop();
  });
});

registerServiceWorker();
