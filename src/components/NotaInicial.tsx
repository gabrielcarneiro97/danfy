import React, { useState } from 'react';
import { Input, Button, Popconfirm } from 'antd';

import { floating } from '../services/calculador.service';

import { movimentoSlim } from '../services/api.service';
import { Nota, MovWithIndexAndKey } from '../types';

const InputGroup = Input.Group;

type propTypes = {
  notaInicial? : Nota | null;
  notaFinal : Nota;
  onChange : Function;
  movimentoPoolWithIndex : MovWithIndexAndKey;
}

function NotaInicial(props : propTypes) : JSX.Element {
  const { notaInicial = null, onChange, movimentoPoolWithIndex } = props;
  const { movimento } = movimentoPoolWithIndex;

  const [valorInput, setValorInput] = useState(notaInicial ? notaInicial.numero : '');

  const onInputChange = (
    e : React.ChangeEvent<HTMLInputElement>,
  ) : void => setValorInput(e.target.value);

  const handleClick = async () : Promise<void> => {
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

  const textoPop = movimento.notaInicialChave
    ? 'Deseja mesmo excluir essa nota?' : 'Deseja adicionar esse valor?';

  const icon = (movimento.notaInicialChave ? 'close' : 'plus');

  return (
    <InputGroup
      style={{ width: 100 }}
    >
      <Input
        size="small"
        style={{ width: 68 }}
        placeholder="Valor"
        value={valorInput}
        onChange={onInputChange}
        disabled={movimento.notaInicialChave !== null}
      />
      <Popconfirm
        title={textoPop}
        onConfirm={handleClick}
        okText="Sim"
        cancelText="Não"
      >
        <Button
          icon={icon}
          size="small"
        />
      </Popconfirm>
    </InputGroup>
  );
}

export default NotaInicial;
