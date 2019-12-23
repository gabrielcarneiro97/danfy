import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import moment from 'moment';

import Connect from '../store/Connect';
import { atualizarProduto } from '../store/estoque';

function EstoqueTabelaDatePicker({
  value,
  id,
  name,
  dispatch,
}) {
  const date = value ? new Date(value) : null;
  const onChange = (newVal) => {
    dispatch(atualizarProduto({ id, [name]: newVal }));
  };
  return <DatePicker onChange={onChange} value={date === null ? date : moment(date)} placeholder="Data" format="DD/MM/YYYY" />;
}

EstoqueTabelaDatePicker.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.object,
  ]),
  id: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]).isRequired,
  name: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number,
  ]).isRequired,
  dispatch: PropTypes.func.isRequired,
};

EstoqueTabelaDatePicker.defaultProps = {
  value: null,
};

export default Connect(EstoqueTabelaDatePicker);
