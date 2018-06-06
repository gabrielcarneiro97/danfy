import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { Row, Col, Layout } from 'antd';
import PropTypes from 'prop-types';

import { auth } from '../services';

import { LoginForm } from '.';

const { Content } = Layout;

function Login(props) {
  const { from } = props.location.state || { from: { pathname: '/app' } };

  // console.log(from);

  if (auth.currentUser !== null) {
    return <Redirect to={from} />;
  }

  return (
    <Content style={{ minHeight: '92vh' }}>
      <Row type="flex" justify="center" align="middle">
        <Col lg={6} md={8} sm={12}>
          <LoginForm history={props.history} />
        </Col>
      </Row>
    </Content>
  );
}

Login.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.object,
  }).isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
};

export default Login;
