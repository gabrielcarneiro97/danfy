import React from 'react';
import Context from './config';
import { Stores } from '../types';


const Connect = (Component : (props : any) => JSX.Element) => (props : any) : JSX.Element => (
  <Context.Consumer>
    {({
      dispatch,
      store,
    }) : JSX.Element => <Component {...props} store={store} dispatch={dispatch} /> /* eslint-disable-line */}
  </Context.Consumer>
);

export function useConnect(context = Context) : { store : any; dispatch : Function } {
  const contextValue = React.useContext(context);

  if (process.env.NODE_ENV !== 'production' && !contextValue) {
    throw new Error(
      'could not find react-redux context value; please ensure the component is wrapped in a <Provider>',
    );
  }

  return contextValue;
}

export function useStore<T extends Stores>() : T {
  const { store } : { store : T } = useConnect();

  return store;
}

export function useDispatch() : Function {
  const { dispatch } = useConnect();

  return dispatch;
}

export default Connect;
