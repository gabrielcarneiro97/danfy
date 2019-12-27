import React from 'react';
import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import { editarEstoqueProduto } from '../services/api.service';
import Connect from '../store/Connect';
import { atualizacaoPersistida, atualizarProduto } from '../store/estoque';
import { EstoqueStore } from '../types';

type propTypes = {
  ativo : boolean;
  id : number | string;
  dispatch : Function;
  store : EstoqueStore;
}

function EstoqueTabelaCheckbox(props : propTypes) : JSX.Element {
  const {
    ativo,
    id,
    store,
    dispatch,
  } = props;
  const { estoque } = store;
  let disabled = false;

  const onChange = async (e : CheckboxChangeEvent) : Promise<void> => {
    const { checked } = e.target;
    const produtoEstoque = estoque[id];
    disabled = true;
    produtoEstoque.ativo = checked;
    dispatch(atualizarProduto(produtoEstoque));

    await editarEstoqueProduto(id, produtoEstoque);

    dispatch(atualizacaoPersistida(produtoEstoque));
    disabled = false;
  };

  return <Checkbox onChange={onChange} checked={ativo} disabled={disabled}>{id}</Checkbox>;
}

export default Connect(EstoqueTabelaCheckbox);
