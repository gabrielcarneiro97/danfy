import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Col,
  Row,
  Table,
  Checkbox,
} from 'antd';

import { NotaInicial } from '.';
import { auth, pegarDominioId, api } from '../services';

import { addNota, carregarMovimentos } from '../store/importacao';
import Connect from '../store/Connect';

function eSaida(nota) {
  return nota.tipo === '1' || nota.cfop === '1113' || nota.cfop === '1202' || nota.cfop === '2202';
}

function interestadual(notaPool) {
  return notaPool.nota.estadoDestinoId === notaPool.nota.estadoGeradorId
    ? 'DENTRO DO ESTADO'
    : `INTERESTADUAL ${notaPool.nota.estadoGeradorId} -> ${notaPool.nota.estadoDestinoId}`;
}


function ConciliarMovimentos(props) {
  const { store, dispatch } = props;
  const {
    movimentosWithIndex,
    empresa,
    notasPool,
    fileList,
  } = store;

  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const notasFinaisChave = fileList.filter(
      ({ response: { tipo, notaPool: { nota } } }) => {
        if (tipo === 'nfe') return eSaida(nota) && nota.emitenteCpfcnpj === empresa.cnpj;
        return false;
      },
    ).map(({ response: { notaPool: { nota } } }) => nota.chave);

    if (notasFinaisChave.length === 0) {
      setDataLoading(false);
      return;
    }

    pegarDominioId().then(async (dominioCodigo) => {
      const { email } = auth.currentUser;

      const usuario = {
        dominioCodigo,
        email,
      };

      const { data } = await axios.post(`${api}/movimentos/calcular`, { notasFinaisChave, usuario });
      const { movimentos, notasIniciais } = data;

      notasIniciais.forEach((np) => dispatch(addNota(np)));

      const movsWithId = movimentos.map((el, index) => ({ ...el, index }));

      dispatch(carregarMovimentos(movsWithId));
      setDataLoading(false);
    });
  }, []);

  const getNota = (chave) => notasPool.find((nP) => nP.nota.chave === chave);

  const alterarMovimento = (movimentoPoolWithIndex, notaPool) => {
    const movimentosWithIndexNovo = movimentosWithIndex.map((el) => {
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
    const notaFinalPool = getNota(movimento.notaFinalChave);
    const tipoOperacao = interestadual(notaFinalPool);
    const notaFinal = notaFinalPool.nota;

    const notaInicial = movimento.notaInicialChave
      ? getNota(movimento.notaInicialChave).nota
      : null;

    return {
      key: `${movimentoPoolWithIndex.index}-${notaFinal.numero}`,
      numero: movimentoPoolWithIndex.index + 1,
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
        onChange={(e) => {
          const movimentoPWINovo = {
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
          columns={ConciliarMovimentos.columns}
          loading={dataLoading}
        />
      </Col>
    </Row>
  );
}

ConciliarMovimentos.propTypes = {
  store: PropTypes.shape({
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
    fileList: PropTypes.array,
    movimentosWithIndex: PropTypes.array,
    notasPool: PropTypes.array,
    pessoasPool: PropTypes.array,
    dominio: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

ConciliarMovimentos.columns = [
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
    defaultSortOrder: 'ascend',
    sorter: (a, b) => {
      if (!a.notaFinal || a.notaFinal > b.notaFinal) {
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
    align: 'center',
  },
];

export default Connect(ConciliarMovimentos);
