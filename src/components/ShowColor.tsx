import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

function ShowColor(props) {
  const { hex } = props;

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

ShowColor.propTypes = {
  hex: PropTypes.string,
};

ShowColor.defaultProps = {
  hex: '#000000',
};

export default ShowColor;
