import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table } from 'antd';

import TableToPrint from './TableToPrint';

import Connect from '../store/Connect';

import { R$, pegaMes, dateToComp } from '../services/calculador.service';

function GruposTable(props) {
  const { store, printable } = props;
  const {
    empresa,
    simplesData,
    trimestreData,
    grupos,
    competencia,
  } = store;

  if (grupos.length === 0) return <div />;

  const { simples } = empresa;

  let columns = [
    {
      title: 'Grupo',
      dataIndex: 'grupoNome',
      key: 'grupoNome',
    },
    {
      title: 'Receita Serviços',
      dataIndex: 'receita',
      key: 'receita',
    },
    {
      title: 'ISS',
      dataIndex: 'iss',
      key: 'iss',
    },
  ];

  let dataSource = [];

  const { servicosPool } = simples ? simplesData : trimestreData;

  const meses = simples
    ? []
    : Object.keys(trimestreData).filter((k) => !Number.isNaN(parseInt(k, 10)));

  if (!simples) {
    columns = columns.concat([
      {
        title: 'PIS',
        dataIndex: 'pis',
        key: 'pis',
      },
      {
        title: 'COFINS',
        dataIndex: 'cofins',
        key: 'cofins',
      },
      {
        title: 'IRPJ',
        children: meses.map((m) => ({
          title: pegaMes(m),
          dataIndex: `irpj${m}`,
          key: `irpj${m}`,
        })).concat({
          title: 'Total',
          dataIndex: 'irpjTotal',
          key: 'irpjTotal',
        }),
      },
      {
        title: 'CSLL',
        children: meses.map((m) => ({
          title: pegaMes(m),
          dataIndex: `csll${m}`,
          key: `csll${m}`,
        })).concat({
          title: 'Total',
          dataIndex: 'csllTotal',
          key: 'csllTotal',
        }),
      },
    ]);
  }

  let totais = null;

  dataSource = grupos.concat({ id: null, nome: 'Sem Grupo' }).map((grupo) => {
    const { id } = grupo;
    const grupoServicosPool = servicosPool.filter(({ servico }) => servico.grupoId === id);

    if (grupoServicosPool.length === 0) return null;

    const data = simples ? {
      receita: 0,
      iss: 0,
    } : {
      receita: 0,
      iss: 0,
      pis: 0,
      cofins: 0,
      ...meses.reduce((acc, mes) => ({ ...acc, [`irpj${mes}`]: 0 }), {}),
      ...meses.reduce((acc, mes) => ({ ...acc, [`csll${mes}`]: 0 }), {}),
      irpjTotal: 0,
      csllTotal: 0,
    };

    if (!totais) totais = { ...data };

    const { mes } = competencia;

    grupoServicosPool.forEach((servicoPool) => {
      const { imposto, retencao, servico } = servicoPool;
      const { mes: mesAtual } = dateToComp(servico.dataHora);

      const posRet = {};

      Object.keys(imposto).forEach((k) => {
        posRet[k] = imposto[k] - (retencao[k] || 0);
      });

      if (mesAtual === parseInt(mes, 10)) {
        data.receita += servico.valor;
        data.iss += posRet.iss;
        if (!simples) {
          data.pis += posRet.pis;
          data.cofins += posRet.cofins;
        }
      }

      if (!simples) {
        data[`irpj${mesAtual}`] += posRet.irpj;
        data.irpjTotal += posRet.irpj;

        data[`csll${mesAtual}`] += posRet.csll;
        data.csllTotal += posRet.csll;
      }
    });

    const final = {
      grupoNome: grupo.nome,
      cor: grupo.cor,
    };

    Object.keys(data).forEach((k) => {
      totais[k] += data[k];
      final[k] = R$(data[k]);
    });

    return final;
  }).filter((d) => d !== null);

  if (totais) {
    Object.keys(totais).forEach((k) => {
      if (k !== 'cor' && k !== 'grupoNome') totais[k] = R$(totais[k]);
    });
    totais.grupoNome = <strong>Totais</strong>;
    dataSource.push(totais);
  }


  if (printable) {
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
          rowClassName={({ cor }) => (cor ? cor.replace('#', 'color-') : '')}
          pagination={{ position: 'none' }}
          style={{ marginBottom: '20px' }}
        />
      </Col>
    </Row>
  );
}

GruposTable.propTypes = {
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
};

GruposTable.defaultProps = {
  printable: false,
};

export default Connect(GruposTable);
