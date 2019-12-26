import React from 'react';
import Context from './config';

const Connect = (Component : (props : any) => JSX.Element) => (props : any) : JSX.Element => (
  <Context.Consumer>
    {({
      dispatch,
      store,
    }) : JSX.Element => <Component {...props} store={store} dispatch={dispatch} /> /* eslint-disable-line */}
  </Context.Consumer>
);

export default Connect;
