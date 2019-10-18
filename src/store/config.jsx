import React from 'react';

export const initialState = {
  store: {},
  dispatch: () => {},
};

const Context = React.createContext(initialState);

export default Context;
