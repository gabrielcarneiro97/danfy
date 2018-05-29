import React from 'react';
import { Table, Row, Col, Checkbox } from 'antd';

class ConciliarServicos extends React.Component {
  static columns = [{
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
  }]

  state = {}

  render() {
    const dataSource = [];
    const dominioCnpjs = Object.values(this.props.dominio());

    const { nfse } = this.props.dados;

    nfse.forEach((nota, id) => {
      if (dominioCnpjs.includes(nota.emitente)) {
        dataSource.push({
          key: `servico-${id}-${nota.emitente}`,
          numero: id + 1,
          nota: nota.geral.numero,
          status: nota.geral.status,
          valor: nota.valor.servico,
          confirmar: <Checkbox />,
        });
      }
    });

    return (
      <Row
        type="flex"
        justify="center"
        align="top"
      >
        <Col span={23} style={{ textAlign: 'center' }}>
          <Table dataSource={dataSource} columns={ConciliarServicos.columns} />
        </Col>
      </Row>
    );
  }
}

export default ConciliarServicos;
