import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Table, Input,
} from 'antd';

import { carregarSimples } from '../store/movimento';

import TableToPrint from './TableToPrint';
import { R$ } from '../services';

import Connect from '../store/Connect';

function SimplesTable(props) {
  const { store, printable, dispatch } = props;
  const { simplesData } = store;
  const { simples } = simplesData;

  const handleSimplesChange = (fieldName) => (e) => {
    simples[fieldName] = e.target.value;
    dispatch(carregarSimples(simples));
  };

  const columns = [
    {
      title: 'Receitas',
      dataIndex: 'receitaNome',
      key: 'receitaNome',
      render: (a) => (
        <div style={{ width: '100%' }}>
          <strong>{a}</strong>
        </div>
      ),
      fontWeight: 'bold',
      width: '50%',
    },
    {
      title: 'Valor',
      dataIndex: 'receitaValor',
      key: 'receitaValor',
      width: '50%',
    },
  ];

  const dataSource = [
    {
      key: 'receitaVendas',
      receitaNome: 'Receita Vendas',
      receitaValor: R$(simples.totalMovimentos),
    },
    {
      key: 'retido',
      receitaNome: 'Receita Serviços (ISS Retido)',
      receitaValor: R$(simples.totalRetido),
    },
    {
      key: 'naoRetido',
      receitaNome: 'Receita Serviços (Sem Retenção)',
      receitaValor: R$(simples.totalNaoRetido),
    },
    {
      key: 'receitaMes',
      receitaNome: 'Receita Mês (Total)',
      receitaValor: R$(simples.totalMes),
    },
    {
      key: 'receitaAno',
      receitaNome: 'Receita Ano Atual',
      receitaValor: printable
        ? R$(simples.totalExercicio)
        : (
          <Input
            defaultValue={R$(simples.totalExercicio)}
            onChange={handleSimplesChange('totalExercicio')}
          />
        ),
    },
    {
      key: 'receitaDoze',
      receitaNome: 'Receita Últimos 12 Meses',
      receitaValor: printable
        ? R$(simples.totalDoze)
        : (
          <Input
            defaultValue={R$(simples.totalDoze)}
            onChange={handleSimplesChange('totalDoze')}
          />
        ),
    },
  ];

  if (printable) {
    return (
      <TableToPrint
        columns={columns}
        dataSource={dataSource}
        showHead={false}
      />
    );
  }

  return (
    <Row
      type="flex"
      justify="center"
    >
      <Col span={12}>
        <Table
          showHeader={false}
          bordered
          size="small"
          columns={columns}
          dataSource={dataSource}
          pagination={{ position: 'none' }}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

SimplesTable.propTypes = {
  printable: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  store: PropTypes.shape({
    simplesData: PropTypes.object,
  }).isRequired,
};

SimplesTable.defaultProps = {
  printable: false,
};

export default Connect(SimplesTable);
