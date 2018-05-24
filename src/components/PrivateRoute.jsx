import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import { auth } from '../services';

function PrivateRoute(props) {
  const { component: Component, ...rest } = props;

  const toRender = (propsRender) => {
    if (auth.currentUser !== null) {
      return <Component {...propsRender} />;
    }

    return (<Redirect to={{
      pathname: '/login',
      state: { from: propsRender.location },
    }}
    />);
  };

  return <Route {...rest} render={toRender} />;
}

PrivateRoute.propTypes = {
  component: PropTypes.element.isRequired,
};

export default PrivateRoute;
