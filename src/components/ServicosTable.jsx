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
  alterarGrupoServico,
  somaTotalServico,
  eDoMes,
} from '../services';

import GrupoSelect from './GrupoSelect';

import Connect from '../store/Connect';
import { carregarMovimento } from '../store/movimento';

import '../assets/colors.css';

function eCancelada(nota) {
  return nota.status === 'CANCELADA';
}

function sorter(a, b) {
  if (!a.numero || (parseInt(a.numero, 10) > parseInt(b.numero, 10))) {
    return 1;
  }
  return -1;
}

function numRender(numero, data) {
  if (data.$$typeof) return data;
  if (!numero) return '';

  return (
    <Popconfirm
      title="Deseja mesmo excluir esse serviço?"
      okText="Sim"
      cancelText="Não"
      onConfirm={data.excluir}
    >
      <Button type="ghost" style={{ width: '100%' }}>{numero}</Button>
    </Popconfirm>
  );
}

const lpColumns = [
  {
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
    fixed: true,
    defaultSortOrder: 'ascend',
    sorter,
    render: numRender,
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

const simplesColumns = [
  {
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
    defaultSortOrder: 'ascend',
    sorter,
    render: numRender,
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
    }],
  }, {
    title: 'ISS',
    dataIndex: 'iss',
    key: 'iss',
  }, {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

function ServicosTable(props) {
  const {
    dispatch,
    store,
    printable,
  } = props;
  const {
    simplesData,
    trimestreData,
    notasServicoPool,
    competencia,
    empresa,
    grupos,
  } = store;

  const { simples } = empresa;

  const { servicosPool } = simples ? simplesData : trimestreData;

  const columns = simples ? [...simplesColumns] : [...lpColumns];

  if (grupos.length > 0) {
    console.log(grupos.length, printable);
    columns.push({
      title: 'Grupo',
      dataIndex: 'grupoId',
      key: 'grupoId',
      render: (value, row) => <GrupoSelect initialValue={value} onChange={row.mudarGrupo} />,
    });
  }

  const update = (dados) => dispatch(carregarMovimento(dados));

  const apagaServico = (servicoPool) => () => excluirServico(servicoPool).then(update);

  const mudarGrupo = (servicoPool) => (novoGrupoId) => alterarGrupoServico(
    servicoPool, novoGrupoId,
  ).then(update);

  let totais;

  const servicosPoolMes = simples ? servicosPool : servicosPool.filter(
    (sP) => eDoMes(sP, competencia),
  );

  const dataSource = servicosPoolMes.map((servicoPool) => {
    const { servico, imposto, retencao } = servicoPool;

    const numero = parseInt(servico.notaChave.substring(18), 10);
    const nota = notasServicoPool.find((n) => n.chave === servico.notaChave);

    const grupo = grupos.find((g) => g.id === servico.grupoId);

    const valores = {
      cor: grupo && grupo.cor,
      key: servico.notaChave,
      numero,
      grupoId: printable ? (grupo && grupo.nome) || '' : servico.grupoId,
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
      mudarGrupo: mudarGrupo(servicoPool),
    };

    totais = somaTotalServico(valores, totais);

    return valores;
  });

  if (totais) {
    dataSource.push(totais);
  }

  if (printable) {
    dataSource.sort(sorter);
    return (
      <TableToPrint
        dataSource={dataSource}
        columns={columns}
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
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: simples ? 'max-content' : '110%' }}
          pagination={{ position: 'top', simple: true }}
          rowClassName={({ cor }) => (cor ? cor.replace('#', 'color-') : '')}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

ServicosTable.propTypes = {
  printable: PropTypes.bool,
  store: PropTypes.shape({
    dominio: PropTypes.array,
    grupos: PropTypes.array,
    trimestreData: PropTypes.object,
    simplesData: PropTypes.object,
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
