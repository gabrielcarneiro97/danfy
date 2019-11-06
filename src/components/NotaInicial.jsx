import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Input, Button, Popconfirm } from 'antd';

import { api, floating } from '../services';

const InputGroup = Input.Group;

function NotaInicial(props) {
  const { notaInicial, onChange, movimentoPoolWithIndex } = props;
  const { movimento } = movimentoPoolWithIndex;

  const [valorInput, setValorInput] = useState(notaInicial ? notaInicial.numero : '');

  const onInputChange = (e) => setValorInput(e.target.value);

  const handleClick = async () => {
    const { notaFinal } = props;

    if (movimento.notaInicialChave) {
      const { data } = await axios.get(`${api}/movimentos/slim`, {
        params: {
          valorInicial: 0,
          notaFinalChave: movimento.notaFinalChave,
          cnpj: notaFinal.emitenteCpfcnpj,
        },
      });
      const { movimentoPool } = data;
      setValorInput('');
      movimentoPool.movimento.conferido = false;
      movimentoPool.movimento.notaInicialChave = null;

      onChange({
        ...movimentoPool,
        index: movimentoPoolWithIndex.index,
      });
    } else if (!Number.isNaN(floating(valorInput))) {
      const { data } = await axios.get(`${api}/movimentos/slim`, {
        params: {
          valorInicial: floating(valorInput),
          notaFinalChave: movimento.notaFinalChave,
          cnpj: notaFinal.emitenteCpfcnpj,
        },
      });

      const { movimentoPool, notaInicialPool } = data;
      setValorInput('INTERNO');
      movimentoPool.movimento.conferido = false;

      onChange({
        ...movimentoPool,
        index: movimentoPoolWithIndex.index,
      }, notaInicialPool);
    }
  };

  const defineTextoPop = () => (movimento.notaInicialChave ? 'Deseja mesmo excluir essa nota?' : 'Deseja adicionar esse valor?');

  const defineIcon = () => (movimento.notaInicialChave ? 'close' : 'plus');

  const inputRender = () => (
    <Input
      size="small"
      style={{ width: 68 }}
      placeholder="Valor"
      value={valorInput}
      onChange={onInputChange}
      disabled={movimento.notaInicialChave !== null}
    />
  );

  const buttonRender = () => (
    <Popconfirm
      title={defineTextoPop()}
      onConfirm={handleClick}
      okText="Sim"
      cancelText="Não"
    >
      <Button
        icon={defineIcon()}
        size="small"
      />
    </Popconfirm>
  );

  return (
    <InputGroup
      style={{ width: 100 }}
    >
      {inputRender()}
      {buttonRender()}
    </InputGroup>
  );
}

NotaInicial.propTypes = {
  onChange: PropTypes.func.isRequired,
  notaInicial: PropTypes.shape({
    geral: PropTypes.object,
  }),
  notaFinal: PropTypes.shape({
    emitente: PropTypes.string,
  }).isRequired,
  movimentoPoolWithIndex: PropTypes.shape({
    movimento: PropTypes.shape({
      notaFinalChave: PropTypes.string,
      notaInicialChave: PropTypes.string,
    }),
  }).isRequired,
};

NotaInicial.defaultProps = {
  notaInicial: null,
};

export default NotaInicial;
