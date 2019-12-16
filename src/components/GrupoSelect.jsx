import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'antd';

import Connect from '../store/Connect';

const { Option } = Select;

function GrupoSelect(props) {
  const {
    store,
    onChange,
    disabled,
    initialValue,
  } = props;
  const { grupos } = store;

  const [value, setValue] = useState(initialValue);

  const options = [<Option key="null" value={null}>&nbsp;</Option>].concat(
    grupos.map((grupo) => (
      <Option key={grupo.id} value={grupo.id}>{grupo.nome}</Option>
    )),
  );

  return (
    <Select
      style={{ width: '100%' }}
      disabled={disabled}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    >
      {options}
    </Select>
  );
}

GrupoSelect.propTypes = {
  store: PropTypes.shape({
    grupos: PropTypes.array,
  }).isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

GrupoSelect.defaultProps = {
  onChange: () => true,
  disabled: false,
  initialValue: '',
};

export default Connect(GrupoSelect);
