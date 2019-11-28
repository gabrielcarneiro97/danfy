import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withRouter } from 'react-router-dom';

import {
  Popconfirm,
  Button,
  message,
} from 'antd';

import { gravarMovimentos, gravarServicos } from '../services';

import Connect from '../store/Connect';

function EnvioFimButton(props) {
  const { disabled, store, history } = props;
  const { movimentosWithIndex, servicosWithIndex, empresa } = store;
  const { numeroSistema } = empresa;

  let mesAno = '00-0000';

  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    setLoading(true);
    const movimentosConferidos = movimentosWithIndex.filter(
      (movPool) => {
        const { movimento, dataHora } = movPool;
        mesAno = moment(dataHora).format('MM-YYYY');
        return movimento.conferido;
      },
    );
    const servicosConferidos = servicosWithIndex.filter(
      (servPool) => {
        const { servico, dataHora } = servPool;
        mesAno = moment(dataHora).format('MM-YYYY');
        return servico.conferido;
      },
    );

    try {
      await Promise.all([
        gravarMovimentos(movimentosConferidos),
        gravarServicos(servicosConferidos),
      ]);
      message.success('Tudo gravado com sucesso!');
      history.push(`/app/visualizar/${numeroSistema}/${mesAno}`);
    } catch (err) {
      message.error('Erro no envio dos arquivos!');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Popconfirm
      title="Confirmar envio?"
      okText="Sim"
      cancelText="Não"
      onConfirm={enviar}
    >
      <Button
        type="primary"
        disabled={disabled || loading}
        loading={loading}
      >
        Enviar
      </Button>
    </Popconfirm>
  );
}

EnvioFimButton.propTypes = {
  store: PropTypes.shape({
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
    servicosWithIndex: PropTypes.array,
    movimentosWithIndex: PropTypes.array,
  }).isRequired,
  disabled: PropTypes.bool,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

EnvioFimButton.defaultProps = {
  disabled: false,
};

export default withRouter(Connect(EnvioFimButton));
