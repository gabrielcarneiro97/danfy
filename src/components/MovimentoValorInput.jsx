import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

function MovimentoValorInput(props) {
  const { onChange, movimentoPoolWithKey } = props;
  const [name] = useState(props.name); // eslint-disable-line
  const [value, setValue] = useState(props.value); // eslint-disable-line
  const [disabled] = useState(props.disabled); // eslint-disable-line

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange(value, name, movimentoPoolWithKey);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      disabled={disabled}
      size="small"
    />
  );
}

MovimentoValorInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  movimentoPoolWithKey: PropTypes.object.isRequired, // eslint-disable-line
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  name: PropTypes.string,
  disabled: PropTypes.bool,
};

MovimentoValorInput.defaultProps = {
  name: '',
  disabled: false,
};

export default MovimentoValorInput;
