import React from 'react';
import { Row, Col } from 'antd';

type propTypes = {
  hex? : string;
}

function ShowColor(props : propTypes) : JSX.Element {
  const { hex = '#000000' } = props;

  return (
    <Row>
      <Col span={4}>
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: hex,
            borderColor: 'black',
            borderWidth: '1.5px',
            borderStyle: 'solid',
          }}
        />
      </Col>
      <Col span={16}>
        {hex}
      </Col>
    </Row>
  );
}

export default ShowColor;
