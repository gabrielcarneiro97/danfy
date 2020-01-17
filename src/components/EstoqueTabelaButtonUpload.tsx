import React from 'react';
import { Button } from 'antd';

import { editarEstoqueProduto } from '../services/api.service';
import Connect from '../store/Connect';
import { atualizacaoPersistida } from '../store/estoque';
import { EstoqueStore } from '../types';

type propTypes = {
  id : number | string;
  dispatch : Function;
  store : EstoqueStore;
}

function EstoqueTabelaButtonUpload(props : propTypes) : JSX.Element {
  const { id, dispatch, store } = props;
  const { modificadosId, estoque } = store;

  let disabled = !modificadosId.includes(parseInt(id.toString(), 10));

  const onClick = async () : Promise<void> => {
    const produtoEstoque = estoque[id];
    disabled = true;
    await editarEstoqueProduto(id.toString(), produtoEstoque);

    dispatch(atualizacaoPersistida(produtoEstoque));
  };

  return <Button icon="edit" onClick={onClick} disabled={disabled} />;
}

export default Connect(EstoqueTabelaButtonUpload);
