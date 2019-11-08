import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  const { movimentosWithIndex, servicosWithIndex } = store;

  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    setLoading(true);
    const movimentosConferidos = movimentosWithIndex.filter(
      (movPool) => movPool.movimento.conferido,
    );
    const servicosConferidos = servicosWithIndex.filter(
      (servPool) => servPool.servico.conferido,
    );

    try {
      await Promise.all([
        gravarMovimentos(movimentosConferidos),
        gravarServicos(servicosConferidos),
      ]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    message.success('Tudo gravado com sucesso!');
    history.push('/app/visualizar');
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
