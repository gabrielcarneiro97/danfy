import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Popconfirm } from 'antd';

import { floating } from '../services/calculador.service';

import { movimentoSlim } from '../services/api.service';

const InputGroup = Input.Group;

function NotaInicial(props) {
  const { notaInicial, onChange, movimentoPoolWithIndex } = props;
  const { movimento } = movimentoPoolWithIndex;

  const [valorInput, setValorInput] = useState(notaInicial ? notaInicial.numero : '');

  const onInputChange = (e) => setValorInput(e.target.value);

  const handleClick = async () => {
    const { notaFinal } = props;

    if (movimento.notaInicialChave) {
      const { movimentoPool } = await movimentoSlim(movimento, notaFinal, 0);

      setValorInput('');
      movimentoPool.movimento.conferido = false;
      movimentoPool.movimento.notaInicialChave = null;

      onChange({
        ...movimentoPool,
        index: movimentoPoolWithIndex.index,
      });
    } else if (!Number.isNaN(floating(valorInput))) {
      const {
        movimentoPool,
        notaInicialPool,
      } = await movimentoSlim(movimento, notaFinal, floating(valorInput));

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
    numero: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  notaFinal: PropTypes.shape({
    emitenteCpfcnpj: PropTypes.string,
  }).isRequired,
  movimentoPoolWithIndex: PropTypes.shape({
    index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
