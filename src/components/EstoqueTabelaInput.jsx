import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import Connect from '../store/Connect';
import { atualizarProduto } from '../store/estoque';

function EstoqueTabelaInput({
  value,
  id,
  name,
  dispatch,
}) {
  const onChange = (e) => {
    dispatch(atualizarProduto({ id, [name]: e.target.value }));
  };
  return <Input value={value} onChange={onChange} />;
}

EstoqueTabelaInput.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]),
  id: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]).isRequired,
  name: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]).isRequired,
  dispatch: PropTypes.func.isRequired,
};

EstoqueTabelaInput.defaultProps = {
  value: '',
};

export default Connect(EstoqueTabelaInput);

