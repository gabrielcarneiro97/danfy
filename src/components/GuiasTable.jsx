import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table } from 'antd';

import { AdicionalDeducaoBtn } from '.';
import { R$, floating } from '../services';

class GuiasTable extends Component {
  static propTypes = {
    dados: PropTypes.shape({ // eslint-disable-line
      servicos: PropTypes.array,
      movimentos: PropTypes.array,
      complementares: PropTypes.object,
      trimestre: PropTypes.object,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
  };

  state = {
    complementares: this.props.dados.complementares,
    trimestre: this.props.dados.trimestre,
  };

  temServicos = () => Object.keys(this.props.dados.servicos).length > 0;
  temMovimentos = () => Object.keys(this.props.dados.movimentos).length > 0;

  updateImposto = (valor, tipo, imposto) => new Promise((resolve) => {
    const { dados } = this.props;
    const { mes } = this.state.complementares;
    const totaisMes = dados.trimestre[mes];
    const tipoPlural = tipo === 'adicional' ? 'adicionais' : 'deducoes';

    if (!totaisMes[tipoPlural]) totaisMes[tipoPlural] = {};

    totaisMes[tipoPlural][imposto] = valor.toString();

    this.props.onChange(dados);
    resolve();
  });

  valorRender(valor, imposto, complementares, totaisMes) {
    const { adicionais, deducoes } = totaisMes;

    let adicional;
    if (adicionais) adicional = floating(adicionais[imposto]);

    let deducao;
    if (deducoes) deducao = floating(deducoes[imposto]);

    let valorLiquido = floating(valor);
    if (deducao) valorLiquido -= deducao;

    if (adicional) valorLiquido += adicional;

    const check = adicional || deducao;

    return (
      <Row
        type="flex"
      >
        <Col span={16}>
          {R$(valor)}
          {check ? <span>&nbsp;</span> : ''}
          {adicional ? <span>+ {R$(adicional)} </span> : ''}
          {deducao ? <span>- {R$(deducao)} </span> : ''}
          {check ? <span>= {R$(valorLiquido)} </span> : ''}
        </Col>
        <Col
          span={8}
          style={{
            textAlign: 'right',
          }}
        >
          <AdicionalDeducaoBtn
            complementares={complementares}
            imposto={imposto}
            onChange={this.updateImposto}
            totais={totaisMes}
          />
        </Col>
      </Row>
    );
  }

  gerarTable() {
    const { complementares, trimestre } = this.state;
    const columns = [];
    const dataSource = [];
    const data = {};
    const totaisMes = trimestre[complementares.mes];
    const { impostos } = totaisMes.totais;

    if (this.temMovimentos()) {
      const icmsValor = impostos.icms.proprio + impostos.icms.difal.origem;
      columns.push({
        title: 'ICMS',
        dataIndex: 'icms',
        key: 'icms',
        render: valor => this.valorRender(valor, 'icms', complementares, totaisMes),
      });
      data.icms = icmsValor;
    }

    if (this.temServicos()) {
      columns.push({
        title: 'ISS',
        dataIndex: 'iss',
        key: 'iss',
        render: valor => this.valorRender(valor, 'iss', complementares, totaisMes),
      });
      data.iss = impostos.iss - impostos.retencoes.iss;
    }

    columns.push({
      title: 'PIS',
      dataIndex: 'pis',
      key: 'pis',
      render: valor => this.valorRender(valor, 'pis', complementares, totaisMes),
    });

    data.pis = (impostos.pis - impostos.retencoes.pis) + impostos.acumulado.pis;

    columns.push({
      title: 'COFINS',
      dataIndex: 'cofins',
      key: 'cofins',
      render: valor => this.valorRender(valor, 'cofins', complementares, totaisMes),
    });

    data.cofins = (impostos.cofins - impostos.retencoes.cofins) + impostos.acumulado.cofins;

    if (parseInt(complementares.mes, 10) % 3 === 0 &&
      complementares.formaPagamento !== 'PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
        render: valor => this.valorRender(valor, 'csll', complementares, totaisMes),
      });
      data.csll = (trimestre.totais.impostos.csll - trimestre.totais.impostos.retencoes.csll);

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
        render: valor => this.valorRender(valor, 'irpj', complementares, totaisMes),
      });
      data.irpj = ((trimestre.totais.impostos.irpj -
        trimestre.totais.impostos.retencoes.irpj) +
        trimestre.totais.impostos.adicionalIr);
    } else if (parseInt(complementares.mes, 10) % 3 !== 0 &&
      complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
        render: valor => this.valorRender(valor, 'csll', complementares, totaisMes),
      });
      data.csll = (impostos.csll - impostos.retencoes.csll);

      columns.push({
        title: 'IRPJ',
        dataIndex: 'irpj',
        key: 'irpj',
        render: valor => this.valorRender(valor, 'irpj', complementares, totaisMes),
      });
      data.irpj = (impostos.irpj - impostos.retencoes.irpj);
    } else if (parseInt(complementares.mes, 10) % 3 === 0 &&
      complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
        render: valor => this.valorRender(valor, 'csll', complementares, totaisMes),
      });
      data.csll = (impostos.csll - impostos.retencoes.csll);

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
        render: valor => this.valorRender(valor, 'irpj', complementares, totaisMes),
      });
      data.irpj = (impostos.irpj - impostos.retencoes.irpj) + trimestre.totais.impostos.adicionalIr;
    }

    data.key = 'guias';

    dataSource.push(data);

    return {
      dataSource,
      columns,
    };
  }

  render() {
    const { dataSource, columns } = this.gerarTable();

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
            pagination={{ position: 'none' }}
            style={{
              marginBottom: '20px',
            }}
          />
        </Col>
      </Row>
    );
  }
}

export default GuiasTable;
