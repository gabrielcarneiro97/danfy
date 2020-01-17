import React, { useState } from 'react';
import { Input } from 'antd';

import { MovWithIndexAndKey } from '../types';

type propTypes = {
  onChange? : Function;
  movimentoPoolWithKey : MovWithIndexAndKey;
  name? : string;
  value? : number | string;
  disabled? : boolean;
}

function MovimentoValorInput(props : propTypes) : JSX.Element {
  const {
    onChange = () : boolean => true,
    movimentoPoolWithKey,
    name: propsName,
    value: propsValue = '',
    disabled: propsDisabled = false,
  } = props;

  const [name] = useState(propsName);
  const [value, setValue] = useState(propsValue);
  const [disabled] = useState(propsDisabled);

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) : void => {
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

export default MovimentoValorInput;
