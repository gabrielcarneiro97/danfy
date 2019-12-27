import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

import Connect from '../store/Connect';
import { atualizarProduto } from '../store/estoque';

type propTypes = {
  value? : string | number | null;
  id : string | number;
  name : 'dataEntrada' | 'dataSaida';
  dispatch : Function;
}

function EstoqueTabelaDatePicker(props : propTypes) : JSX.Element {
  const {
    value = null,
    id,
    name,
    dispatch,
  } = props;
  const date = value ? new Date(value) : null;

  const onChange = (newVal : moment.Moment | null) : void => {
    dispatch(atualizarProduto({ id: parseInt(id.toString(), 10), [name]: newVal }));
  };
  return <DatePicker onChange={onChange} value={date === null ? date : moment(date)} placeholder="Data" format="DD/MM/YYYY" />;
}

export default Connect(EstoqueTabelaDatePicker);
