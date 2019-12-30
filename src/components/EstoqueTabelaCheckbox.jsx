import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';

import { editarEstoqueProduto } from '../services';
import Connect from '../store/Connect';
import { atualizacaoPersistida, atualizarProduto } from '../store/estoque';


function EstoqueTabelaCheckbox({
  ativo,
  id,
  store,
  dispatch,
}) {
  const { estoque } = store;
  const [disabled, setDisabled] = useState(false);

  const onChange = async (e) => {
    const { checked } = e.target;
    const produtoEstoque = estoque[id];
    setDisabled(true);
    produtoEstoque.ativo = checked;
    dispatch(atualizarProduto(produtoEstoque));

    await editarEstoqueProduto(id, produtoEstoque);

    dispatch(atualizacaoPersistida(produtoEstoque));
    setDisabled(false);
  };

  return <Checkbox onChange={onChange} checked={ativo} disabled={disabled} />;
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
