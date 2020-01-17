import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import { auth } from '../services/api.service';

type propTypes = {
  component : Function;
  [key : string] : any;
}

function PrivateRoute(props : propTypes) : JSX.Element {
  const { component: Component, ...rest } = props;
  const toRender = (propsRender : { [key : string] : any }) : JSX.Element => (
    auth.currentUser
      ? <Component {...propsRender} /> // eslint-disable-line
      : (
        <Redirect
          to={{
            pathname: '/',
            state: { from: propsRender.location },
          }}
        />
      )
  );

  return <Route {...rest} render={toRender} />; // eslint-disable-line
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
};

export default PrivateRoute;
