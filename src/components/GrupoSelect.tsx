import React, { useState } from 'react';

import { Select } from 'antd';

import Connect from '../store/Connect';
import { ClientesStore } from '../types';

const { Option } = Select;

type propTypes = {
  store : ClientesStore;
  onChange? : Function;
  disabled? : boolean;
  initialValue? : string | number;
}

function GrupoSelect(props : propTypes) : JSX.Element {
  const {
    store,
    onChange = () : boolean => true,
    disabled = false,
    initialValue = '',
  } = props;
  const { grupos } = store;

  const [value, setValue] = useState(initialValue);

  const options = [<Option key="null" value={undefined}>&nbsp;</Option>].concat(
    grupos.map((grupo) => (
      <Option key={grupo.id} value={grupo.id}>{grupo.nome}</Option>
    )),
  );

  return (
    <Select
      style={{ width: '100%' }}
      disabled={disabled}
      value={value}
      onChange={(v : string | number) : void => {
        setValue(v);
        onChange(v);
      }}
    >
      {options}
    </Select>
  );
}

export default Connect(GrupoSelect);
