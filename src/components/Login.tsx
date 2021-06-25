import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { Row, Col, Layout } from 'antd';

import { auth } from '../services/api.service';

import LoginForm from './LoginForm';

const { Content } = Layout;

function Login() : JSX.Element {
  const location: any = useLocation();
  const { from } = location.state || { from: { pathname: '/app' } };

  if (auth.currentUser !== null) {
    return <Redirect to={from} />;
  }

  return (
    <Content style={{ minHeight: '92vh' }}>
      <Row type="flex" justify="center" align="middle">
        <Col lg={6} md={8} sm={12}>
          <LoginForm />
        </Col>
      </Row>
    </Content>
  );
}

export default Login;
