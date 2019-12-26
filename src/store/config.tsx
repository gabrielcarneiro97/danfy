import React from 'react';

export const initialState = {
  store: {},
  dispatch: () : null => null,
};

const Context = React.createContext(initialState);

export default Context;
