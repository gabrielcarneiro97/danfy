import React from 'react';
import { withRouter } from 'react-router-dom';
import { Row, Col, Icon } from 'antd';
import PropTypes from 'prop-types';

import { auth, version } from '../services';

import './Navbar.css';

function Navbar(props) {
  const icon = auth.currentUser ? 'logout' : 'login';

  const handleClick = () => {
    if (auth.currentUser) {
      auth.signOut().then(() => props.history.push('/login'));
    } else {
      props.history.push('/login');
    }
  };

  return (
    <Row style={{ color: '#FFF' }}>
      <Col span={12}>DANFY {version}</Col>
      <Col span={12} style={{ textAlign: 'right' }}>
        {
          // eslint-disable-next-line
        }<a className="login-btn" onClick={handleClick}>
          <Icon type={icon} />
          {
            // eslint-disable-next-line
        }</a>
      </Col>
    </Row>
  );
}

Navbar.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default withRouter(Navbar);
