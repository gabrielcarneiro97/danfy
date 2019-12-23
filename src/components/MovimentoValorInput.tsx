import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

function MovimentoValorInput(props) {
  const {
    onChange,
    movimentoPoolWithKey,
    name: propsName,
    value: propsValue,
    disabled: propsDisabled,
  } = props;
  const [name] = useState(propsName);
  const [value, setValue] = useState(propsValue);
  const [disabled] = useState(propsDisabled);

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange(e.target.value, name, movimentoPoolWithKey);
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
