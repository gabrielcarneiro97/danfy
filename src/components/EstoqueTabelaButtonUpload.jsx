import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import { editarEstoqueProduto } from '../services/api.service';
import Connect from '../store/Connect';
import { atualizacaoPersistida } from '../store/estoque';

function EstoqueTabelaButtonUpload({ id, dispatch, store }) {
  const { modificadosId, estoque } = store;

  let disabled = !modificadosId.includes(id);

  const onClick = async () => {
    const produtoEstoque = estoque[id];
    disabled = true;
    await editarEstoqueProduto(id, produtoEstoque);

    dispatch(atualizacaoPersistida(produtoEstoque));
  };

  return <Button icon="edit" onClick={onClick} disabled={disabled} />;
}

EstoqueTabelaButtonUpload.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]).isRequired,
  dispatch: PropTypes.func.isRequired,
  store: PropTypes.shape({
    modificadosId: PropTypes.array,
    estoque: PropTypes.object,
  }).isRequired,
};

export default Connect(EstoqueTabelaButtonUpload);
