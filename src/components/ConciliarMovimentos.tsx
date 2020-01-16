import React, { useEffect, useState } from 'react';
import {
  Col,
  Row,
  Table,
  Checkbox,
} from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';

import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import NotaInicial from './NotaInicial';
import { auth, pegarDominioId, calcularMovimentos } from '../services/api.service';

import { addNota, carregarMovimentos } from '../store/importacao';
import Connect from '../store/Connect';
import {
  Nota, NotaPool, MovimentoPool, MovimentoPoolWithIndex, ImportacaoStore, FileZ, MovWithIndexAndKey,
} from '../types';

function eSaida(nota : Nota) : boolean {
  return nota.tipo === '1' || nota.cfop === '1113' || nota.cfop === '1202' || nota.cfop === '2202';
}

function interestadual(notaPool : NotaPool) : string {
  return notaPool.nota.estadoDestinoId === notaPool.nota.estadoGeradorId
    ? 'DENTRO DO ESTADO'
    : `INTERESTADUAL ${notaPool.nota.estadoGeradorId} -> ${notaPool.nota.estadoDestinoId}`;
}

type propTypes = {
  store : ImportacaoStore;
  dispatch : Function;
}

const columns = [
  {
    title: 'Número',
    dataIndex: 'numero',
    key: 'numero',
  }, {
    title: 'Nota Inicial',
    dataIndex: 'notaInicial',
    key: 'notaInicial',
  }, {
    title: 'Nota Final',
    dataIndex: 'notaFinal',
    key: 'notaFinal',
    defaultSortOrder: 'ascend' as 'ascend',
    sorter: (a?: { notaFinal : string }, b?: { notaFinal : string }) : number => {
      if (!a || !b) return -1;
      if (!a.notaFinal || parseInt(a.notaFinal, 10) > parseInt(b.notaFinal, 10)) {
        return 1;
      }
      return -1;
    },
  }, {
    title: 'Base Impostos',
    dataIndex: 'baseImpostos',
    key: 'baseImpostos',
  }, {
    title: 'Tipo Operação',
    dataIndex: 'tipoOperacao',
    key: 'tipoOperacao',
  }, {
    title: 'Confirmar',
    dataIndex: 'confirmar',
    key: 'confirmar',
    align: 'center' as 'center',
  },
];

function ConciliarMovimentos(props : propTypes) : JSX.Element {
  const { store, dispatch } = props;
  const {
    movimentosWithIndex,
    empresa,
    notasPool,
    fileList,
  } = store;

  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const notasFinaisChave = fileList.reduce(
      (acc : FileZ[], crr : UploadFile<FileZ>) => (crr.response ? acc.concat([crr.response]) : acc),
      [],
    ).filter(
      ({ tipo, notaPool }) => {
        if (!tipo) return false;

        const nota = tipo === 'nfe' ? (notaPool as NotaPool).nota : null;

        if (!nota) return false;
        if (tipo === 'nfe') return eSaida(nota) && nota.emitenteCpfcnpj === empresa.cnpj;

        return false;
      },
    ).map(({ tipo, notaPool }) => {
      const nota = tipo === 'nfe' ? (notaPool as NotaPool).nota : null;

      if (!nota) return '';
      return nota.chave;
    });

    if (notasFinaisChave.length === 0) {
      setDataLoading(false);
      return;
    }

    pegarDominioId().then(async (dominioCodigo) => {
      const { currentUser } = auth;

      if (!currentUser) return;

      const { email } = currentUser;

      const usuario = {
        dominioCodigo,
        email,
      };

      const { movimentos, notasIniciais } = await calcularMovimentos(notasFinaisChave, usuario);

      notasIniciais.forEach((np : NotaPool) => dispatch(addNota(np)));

      const movsWithId : MovWithIndexAndKey[] = movimentos.map(
        (el : MovimentoPool, index : number) : MovWithIndexAndKey => ({ ...el, index }),
      );

      dispatch(carregarMovimentos(movsWithId));
      setDataLoading(false);
    });
  }, []);

  const getNota = (chave : string) : NotaPool | undefined => notasPool.find(
    (nP : NotaPool) => nP.nota.chave === chave,
  );

  const alterarMovimento = (movimentoPoolWithIndex : MovimentoPoolWithIndex,
    notaPool?: NotaPool) : void => {
    const movimentosWithIndexNovo = movimentosWithIndex.map((el : MovimentoPoolWithIndex) => {
      if (el.index === movimentoPoolWithIndex.index) {
        return movimentoPoolWithIndex;
      }
      return el;
    });

    if (notaPool) {
      dispatch(addNota(notaPool));
      dispatch(carregarMovimentos(movimentosWithIndexNovo));
    } else {
      dispatch(carregarMovimentos(movimentosWithIndexNovo));
    }
  };

  const dataSource = movimentosWithIndex.map((movimentoPoolWithIndex) => {
    const { movimento } = movimentoPoolWithIndex;
    const notaFinalPool = getNota(movimento.notaFinalChave || '');

    if (!notaFinalPool) return undefined;

    const tipoOperacao = interestadual(notaFinalPool);
    const notaFinal = notaFinalPool.nota;

    const notaInicial = movimento.notaInicialChave
      ? getNota(movimento.notaInicialChave)?.nota
      : null;

    return {
      key: `${movimentoPoolWithIndex.index}-${notaFinal.numero}`,
      numero: (movimentoPoolWithIndex?.index || 0 + 1) || 0,
      notaInicial: <NotaInicial
        movimentoPoolWithIndex={movimentoPoolWithIndex}
        notaFinal={notaFinal}
        notaInicial={notaInicial}
        onChange={alterarMovimento}
      />,
      notaFinal: notaFinal.numero,
      baseImpostos: movimento.lucro,
      tipoOperacao,
      confirmar: <Checkbox
        checked={movimento.conferido}
        onChange={(e : CheckboxChangeEvent) : void => {
          const movimentoPWINovo : MovimentoPoolWithIndex = {
            ...movimentoPoolWithIndex,
          };
          movimentoPWINovo.movimento.conferido = e.target.checked;
          alterarMovimento(movimentoPWINovo);
        }}
      />,
    };
  });

  return (
    <Row
      type="flex"
      justify="center"
      align="top"
    >
      <Col span={23} style={{ textAlign: 'center' }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={dataLoading}
        />
      </Col>
    </Row>
  );
}

export default Connect(ConciliarMovimentos);
