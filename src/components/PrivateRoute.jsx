import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import { auth } from '../services';

function PrivateRoute({ component: Component, ...rest }) {
  const toRender = (propsRender) => {
    if (auth.currentUser !== null) {
      return <Component {...propsRender} />;
    }

    return (<Redirect to={{
      pathname: '/',
      state: { from: propsRender.location },
    }}
    />);
  };

  return <Route {...rest} render={toRender} />;
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
};

export default PrivateRoute;
