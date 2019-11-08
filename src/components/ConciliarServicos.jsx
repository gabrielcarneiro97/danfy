import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Table,
  Row,
  Col,
  Checkbox,
} from 'antd';

import { api, R$ } from '../services';

import { carregarServicos } from '../store/importacao';
import Connect from '../store/Connect';

function ConciliarServicos(props) {
  const { store, dispatch } = props;
  const { notasServicoPool, servicosWithIndex } = store;

  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (notasServicoPool.length === 0) {
      setDataLoading(false);
      return;
    }

    Promise.all(
      notasServicoPool.map(async ({ notaServico }, index) => {
        const { data: servico } = await axios.get(`${api}/servicos/calcular`, {
          params: {
            notaServicoChave: notaServico.chave,
          },
        });
        return {
          ...servico,
          index,
        };
      }),
    ).then((servsWithIds) => {
      dispatch(carregarServicos(servsWithIds));
      setDataLoading(false);
    });
  }, []);

  const getNotaServico = (
    chave,
  ) => notasServicoPool.find(({ notaServico }) => notaServico.chave === chave);

  const alterarServico = (servico) => {
    const servicosNovo = servicosWithIndex.map((el) => {
      if (el.index === servico.index) {
        return servico;
      }
      return el;
    });
    dispatch(carregarServicos(servicosNovo));
  };

  const dataSource = servicosWithIndex.map((servicoPoolWithIndex, id) => {
    const { servico } = servicoPoolWithIndex;
    const { notaServico } = getNotaServico(servico.notaChave);

    return {
      key: `servico-${id}-${notaServico.emitenteCpfcnpj}`,
      numero: id + 1,
      nota: notaServico.numero,
      status: notaServico.status,
      valor: R$(notaServico.valor),
      confirmar: <Checkbox
        checked={servico.conferido}
        onChange={(e) => {
          const servicoPWINovo = {
            ...servicoPoolWithIndex,
          };
          servicoPWINovo.servico.conferido = e.target.checked;
          alterarServico(servicoPWINovo);
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
          columns={ConciliarServicos.columns}
          loading={dataLoading}
        />
      </Col>
    </Row>
  );
}

ConciliarServicos.propTypes = {
  store: PropTypes.shape({
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
    servicosWithIndex: PropTypes.array,
    notasServicoPool: PropTypes.array,
    dominio: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

ConciliarServicos.columns = [
  {
    title: 'Número',
    dataIndex: 'numero',
    key: 'numero',
  }, {
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'Valor',
    dataIndex: 'valor',
    key: 'valor',
  }, {
    title: 'Confirmar',
    dataIndex: 'confirmar',
    key: 'confirmar',
    align: 'center',
  },
];

export default Connect(ConciliarServicos);
