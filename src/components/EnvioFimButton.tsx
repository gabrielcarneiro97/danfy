import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import {
  Popconfirm,
  Button,
  message,
} from 'antd';

import { gravarMovimentos, gravarServicos } from '../services/api.service';

import { useStore } from '../store/Connect';
import { ImportacaoStore } from '../types';

type propTypes = {
  disabled? : boolean;
}

function EnvioFimButton(props : propTypes) : JSX.Element {
  const store = useStore<ImportacaoStore>();

  const { disabled = false } = props;
  const { movimentosWithIndex, servicosWithIndex, empresa } = store;
  const { numeroSistema, cnpj } = empresa;

  const history = useHistory();

  let mesAno = '';

  const [loading, setLoading] = useState(false);

  const enviar = async () : Promise<void> => {
    setLoading(true);
    const movimentosConferidos = movimentosWithIndex.filter(
      (movPool) => {
        const { movimento } = movPool;
        const { dataHora } = movimento;
        mesAno = moment(dataHora).format('MM-YYYY');
        return movimento.conferido;
      },
    );
    const servicosConferidos = servicosWithIndex.filter(
      (servPool) => {
        const { servico } = servPool;
        const { dataHora } = servico;
        mesAno = moment(dataHora).format('MM-YYYY');
        return servico.conferido;
      },
    );

    try {
      await Promise.all([
        gravarMovimentos(movimentosConferidos, cnpj),
        gravarServicos(servicosConferidos, cnpj),
      ]);
      message.success('Tudo gravado com sucesso!');
      if (mesAno === '') history.push('/app/visualizar');
      else history.push(`/app/visualizar?numParam=${numeroSistema}&compParam=${mesAno}`);
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

export default EnvioFimButton;
