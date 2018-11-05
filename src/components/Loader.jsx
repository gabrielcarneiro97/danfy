import React from 'react';
import { Row, Col, Icon } from 'antd';

function Loader() {
  return (
    <Row type="flex" justify="space-around" align="middle">
      <Col style={{ fontSize: '15vw' }}>
        <Icon type="loading" theme="outlined" />
      </Col>
    </Row>
  );
}

export default Loader;
