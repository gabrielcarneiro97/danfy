import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Table,
  Row,
  Col,
  Popconfirm,
  Button,
} from 'antd';

import TableToPrint from './TableToPrint';

import {
  R$,
  excluirServico,
  somaTotalServico,
  eDoMes,
} from '../services';

import Connect from '../store/Connect';
import { carregarMovimento } from '../store/movimento';

function eCancelada(nota) {
  return nota.status === 'CANCELADA';
}

function ServicosTable(props) {
  const { dispatch, store, printable } = props;
  const { trimestreData, notasServicoPool, competencia } = store;

  const { servicosPool } = trimestreData;

  const update = (dados) => dispatch(carregarMovimento(dados));

  const apagaServico = (servicoPool) => () => excluirServico(servicoPool).then(update);

  const defineDataSource = () => {
    let totais;

    const servicosPoolMes = servicosPool.filter((sP) => eDoMes(sP, competencia));

    const dataSource = servicosPoolMes.map((servicoPool) => {
      const { servico, imposto, retencao } = servicoPool;

      const numero = parseInt(servico.notaChave.substring(18), 10);
      const nota = notasServicoPool.find((n) => n.chave === servico.notaChave);

      const valores = {
        key: servico.notaChave,
        numero,
        nota: numero,
        status: nota.status,
        data: moment(servico.dataHora).format('DD[/]MMM'),
        valorServico: R$(servico.valor),
        issRetido: eCancelada(nota) ? R$(0) : R$(retencao.iss),
        pisRetido: eCancelada(nota) ? R$(0) : R$(retencao.pis),
        cofinsRetido: eCancelada(nota) ? R$(0) : R$(retencao.cofins),
        csllRetido: eCancelada(nota) ? R$(0) : R$(retencao.csll),
        irpjRetido: eCancelada(nota) ? R$(0) : R$(retencao.irpj),
        totalRetido: eCancelada(nota) ? R$(0) : R$(retencao.total),
        iss: R$(imposto.iss),
        pis: R$(imposto.pis),
        cofins: R$(imposto.cofins),
        csll: R$(imposto.csll),
        irpj: R$(imposto.irpj),
        total: R$(imposto.total),
        excluir: apagaServico(servicoPool),
      };

      totais = somaTotalServico(valores, totais);

      return valores;
    });

    if (totais) {
      dataSource.push(totais);
    }
    return dataSource;
  };

  const dataSource = defineDataSource();

  if (printable) {
    return (
      <TableToPrint
        dataSource={dataSource}
        columns={ServicosTable.columns}
      />
    );
  }

  return (
    <Row
      type="flex"
      justify="center"
    >
      <Col span={23}>
        <Table
          bordered
          size="small"
          columns={ServicosTable.columns}
          dataSource={dataSource}
          scroll={{ x: '110%' }}
          pagination={{ position: 'top', simple: true }}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

ServicosTable.columns = [
  {
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
    fixed: true,
    defaultSortOrder: 'ascend',
    sorter: (a, b) => {
      if (!a.nota.numero || (a.nota.numero > b.nota.numero)) {
        return 1;
      }
      return -1;
    },
    render: (numero, data) => {
      if (data.$$typeof) {
        return data;
      }

      if (!numero) {
        return '';
      }

      return (
        <Popconfirm
          title="Deseja mesmo excluir esse serviço?"
          okText="Sim"
          cancelText="Não"
          onConfirm={data.excluir}
        >
          <Button type="ghost">{numero}</Button>
        </Popconfirm>
      );
    },
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'Data',
    dataIndex: 'data',
    key: 'data',
  }, {
    title: 'Valor do Serviço',
    dataIndex: 'valorServico',
    key: 'valorServico',
  }, {
    title: 'Retenções',
    children: [{
      title: 'ISS',
      dataIndex: 'issRetido',
      key: 'issRetido',
    }, {
      title: 'PIS',
      dataIndex: 'pisRetido',
      key: 'pisRetido',
    }, {
      title: 'COFINS',
      dataIndex: 'cofinsRetido',
      key: 'cofinsRetido',
    }, {
      title: 'CSLL',
      dataIndex: 'csllRetido',
      key: 'csllRetido',
    }, {
      title: 'IRPJ',
      dataIndex: 'irpjRetido',
      key: 'irpjRetido',
    }, {
      title: 'Total',
      dataIndex: 'totalRetido',
      key: 'totalRetido',
    }],
  }, {
    title: 'ISS',
    dataIndex: 'iss',
    key: 'iss',
  }, {
    title: 'PIS',
    dataIndex: 'pis',
    key: 'pis',
  }, {
    title: 'COFINS',
    dataIndex: 'cofins',
    key: 'cofins',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
  }, {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

ServicosTable.propTypes = {
  printable: PropTypes.bool,
  store: PropTypes.shape({
    dominio: PropTypes.array,
    trimestreData: PropTypes.object,
    notasPool: PropTypes.array,
    notasServicoPool: PropTypes.array,
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      formaPagamento: PropTypes.string,
      cnpj: PropTypes.string,
      simples: PropTypes.bool,
    }),
    competencia: PropTypes.shape({
      mes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      ano: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

ServicosTable.defaultProps = {
  printable: false,
};

export default Connect(ServicosTable);
