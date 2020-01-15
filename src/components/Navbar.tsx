import React from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Icon } from 'antd';

import { auth } from '../services/api.service';
import { version } from '../services/publics';

import './Navbar.css';

function Navbar() : JSX.Element {
  const history = useHistory();
  const icon = auth.currentUser ? 'logout' : 'login';

  const handleClick = () : void => {
    if (auth.currentUser) {
      auth.signOut().then(() => history.push('/login'));
    } else {
      history.push('/login');
    }
  };

  return (
    <Row style={{ color: '#FFF' }}>
      <Col span={12}>
        <a style={{ color: '#FFF' }}> { /* eslint-disable-line */ }
          <span style={{ fontWeight: 'bolder' }}>DANFY </span>
          <span style={{ fontWeight: 'lighter' }}>{version}</span>
        </a>
      </Col>
      <Col span={12} style={{ textAlign: 'right' }}>
        <a className="login-btn" onClick={handleClick}> { /* eslint-disable-line */ }
          <Icon type={icon} />
        </a>
      </Col>
    </Row>
  );
}

export default Navbar;
