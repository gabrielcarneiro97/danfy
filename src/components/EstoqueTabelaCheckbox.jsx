import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';
import axios from 'axios';

import { api } from '../services';
import Connect from '../store/Connect';
import { atualizacaoPersistida, atualizarProduto } from '../store/estoque';


function EstoqueTabelaCheckbox({
  ativo,
  id,
  store,
  dispatch,
}) {
  const { estoque } = store;
  let { disabled } = false;

  const onChange = async (e) => {
    const { checked } = e.target;
    const produtoEstoque = estoque[id];
    disabled = true;
    produtoEstoque.ativo = checked;
    dispatch(atualizarProduto(produtoEstoque));
    await axios.put(
      `${api}/estoque/${produtoEstoque.donoCpfcnpj}/${id}`,
      produtoEstoque,
    );
    dispatch(atualizacaoPersistida(produtoEstoque));
    disabled = false;
  };

  return <Checkbox onChange={onChange} checked={ativo} disabled={disabled}>{id}</Checkbox>;
}

EstoqueTabelaCheckbox.propTypes = {
  ativo: PropTypes.bool.isRequired,
  id: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]).isRequired,
  dispatch: PropTypes.func.isRequired,
  store: PropTypes.shape({
    estoque: PropTypes.object,
  }).isRequired,
};

export default Connect(EstoqueTabelaCheckbox);
