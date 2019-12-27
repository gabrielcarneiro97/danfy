import React from 'react';
import { Input } from 'antd';

import Connect from '../store/Connect';
import { atualizarProduto } from '../store/estoque';

type propTypes = {
  value? : string | number;
  id : string | number;
  name : string | number;
  dispatch : Function;
}

function EstoqueTabelaInput(props : propTypes) : JSX.Element {
  const {
    value = '',
    id,
    name,
    dispatch,
  } = props;
  const onChange = (e : React.ChangeEvent<HTMLInputElement>) : void => {
    dispatch(atualizarProduto({ id: parseInt(id.toString(), 10), [name]: e.target.value }));
  };
  return <Input value={value} onChange={onChange} />;
}

export default Connect(EstoqueTabelaInput);
