import React from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import { Divider, Row, Col, Button } from 'antd';

import { MovimentosTable, ServicosTable, TableToPrint, AcumuladosTable } from '.';
import { R$, retornarTipo, somaTotalMovimento, somaTotalServico, pegaMes } from '../services';

import './Printer.css';

class Printer extends React.Component {
  static propTypes = {
    dados: PropTypes.shape({
      movimentos: PropTypes.object,
      servicos: PropTypes.object,
      notas: PropTypes.object,
    }).isRequired,
  }

  state = {}

  temServicos = () => Object.keys(this.props.dados.servicos).length > 0;
  temMovimentos = () => Object.keys(this.props.dados.movimentos).length > 0;

  defineTableMovimentos = () => {
    const { movimentos, notas } = this.props.dados;
    const printSource = [];
    let totais;

    Object.keys(movimentos).forEach((key) => {
      const movimento = movimentos[key];
      const notaFinal = notas[movimento.notaFinal];
      const notaInicial = notas[movimento.notaInicial];
      const valores = {
        key,
        numero: notaFinal.geral.numero,
        valorInicial: R$(notaInicial.valor.total),
        valorFinal: R$(notaFinal.valor.total),
        tipoMovimento: retornarTipo(notaFinal.geral.cfop),
        lucro: R$(movimento.valores.lucro),
        baseIcms: R$(movimento.valores.impostos.icms.baseDeCalculo),
        icms: R$(movimento.valores.impostos.icms.proprio),
        difalOrigem: movimento.valores.impostos.icms.difal ?
          R$(movimento.valores.impostos.icms.difal.origem) :
          '0,00',
        difalDestino: movimento.valores.impostos.icms.difal ?
          R$(movimento.valores.impostos.icms.difal.destino) :
          '0,00',
        pis: R$(movimento.valores.impostos.pis),
        cofins: R$(movimento.valores.impostos.cofins),
        csll: R$(movimento.valores.impostos.csll),
        irpj: R$(movimento.valores.impostos.irpj),
        total: R$(movimento.valores.impostos.total),
      };

      totais = somaTotalMovimento(valores, totais, retornarTipo(notaFinal.geral.cfop));

      printSource.push(valores);
    });
    if (totais) {
      printSource.push(totais);
    }
    return printSource;
  }

  defineTableServicos = () => {
    const { servicos } = this.props.dados;
    const printSource = [];
    let totais;

    Object.keys(servicos).forEach((key) => {
      const servico = servicos[key];

      const numero = parseInt(servico.nota.substring(18), 10);

      const valores = {
        key: servico.nota,
        nota: numero,
        status: servico.notaStatus,
        data: servico.data.toLocaleString('pt-br'),
        valorServico: R$(servico.valores.impostos.baseDeCalculo),
        issRetido: R$(servico.valores.impostos.retencoes.iss),
        pisRetido: R$(servico.valores.impostos.retencoes.pis),
        cofinsRetido: R$(servico.valores.impostos.retencoes.cofins),
        csllRetido: R$(servico.valores.impostos.retencoes.csll),
        irpjRetido: R$(servico.valores.impostos.retencoes.irpj),
        totalRetido: R$(servico.valores.impostos.retencoes.total),
        iss: R$(servico.valores.impostos.iss),
        pis: R$(servico.valores.impostos.pis),
        cofins: R$(servico.valores.impostos.cofins),
        csll: R$(servico.valores.impostos.csll),
        irpj: R$(servico.valores.impostos.irpj),
        total: R$(servico.valores.impostos.total),
      };

      totais = somaTotalServico(valores, totais);

      printSource.push(valores);
    });
    if (totais) {
      printSource.push(totais);
    }
    return printSource;
  }

  defineTableGuias = () => {
    const { complementares, trimestre } = this.props.dados;
    const columnsGuias = [];
    const dataSourceGuias = [];
    const data = {};

    if (this.temMovimentos()) {
      columnsGuias.push({
        title: 'ICMS',
        dataIndex: 'icms',
        key: 'icms',
      });
      data.icms = R$(trimestre[complementares.mes].totais.impostos.icms.proprio +
        trimestre[complementares.mes].totais.impostos.icms.difal.origem);
    }

    if (this.temServicos()) {
      columnsGuias.push({
        title: 'ISS',
        dataIndex: 'iss',
        key: 'iss',
      });
      data.iss = R$(trimestre[complementares.mes].totais.impostos.iss -
        trimestre[complementares.mes].totais.impostos.retencoes.iss);
    }

    columnsGuias.push({
      title: 'PIS',
      dataIndex: 'pis',
      key: 'pis',
    });

    data.pis = R$((trimestre[complementares.mes].totais.impostos.pis -
      trimestre[complementares.mes].totais.impostos.retencoes.pis) +
      trimestre[complementares.mes].totais.impostos.acumulado.pis);

    columnsGuias.push({
      title: 'COFINS',
      dataIndex: 'cofins',
      key: 'cofins',
    });

    data.cofins = R$((trimestre[complementares.mes].totais.impostos.cofins -
      trimestre[complementares.mes].totais.impostos.retencoes.cofins) +
      trimestre[complementares.mes].totais.impostos.acumulado.cofins);

    if (parseInt(complementares.mes, 10) % 3 === 0 &&
      complementares.formaPagamento !== 'PAGAMENTO ANTECIPADO') {
      columnsGuias.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(trimestre.totais.impostos.csll - trimestre.totais.impostos.retencoes.csll);

      columnsGuias.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$((trimestre.totais.impostos.irpj -
        trimestre.totais.impostos.retencoes.irpj) +
        trimestre.totais.impostos.adicionalIr);
    } else if (parseInt(complementares.mes, 10) % 3 !== 0 &&
      complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
      columnsGuias.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(trimestre[complementares.mes].totais.impostos.csll -
        trimestre[complementares.mes].totais.impostos.retencoes.csll);

      columnsGuias.push({
        title: 'IRPJ',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$(trimestre[complementares.mes].totais.impostos.irpj -
        trimestre[complementares.mes].totais.impostos.retencoes.irpj);
    } else if (parseInt(complementares.mes, 10) % 3 === 0 &&
      complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
      columnsGuias.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(trimestre[complementares.mes].totais.impostos.csll -
        trimestre[complementares.mes].totais.impostos.retencoes.csll);

      columnsGuias.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$((trimestre[complementares.mes].totais.impostos.irpj -
        trimestre[complementares.mes].totais.impostos.retencoes.irpj) +
        trimestre.totais.impostos.adicionalIr);
    }

    data.key = 'guias';

    dataSourceGuias.push(data);

    return {
      dataSourceGuias,
      columnsGuias,
    };
  }

  defineTableAcumulados = () => {
    const { trimestre } = this.props.dados;
    const dataSource = [];

    Object.keys(trimestre).forEach((key) => {
      if (key === 'totais') {
        const mes = <strong>Trimestre</strong>;
        const el = trimestre[key];

        dataSource.push({
          key: `acumulado-${key}`,
          mes,
          csll: <strong>{R$(el.impostos.csll - el.impostos.retencoes.csll)}</strong>,
          irpj: <strong>{R$(el.impostos.irpj - el.impostos.retencoes.irpj)}</strong>,
          faturamento: <strong>{R$(el.lucro + el.servicos)}</strong>,
        });
      } else {
        const mes = pegaMes(key);
        const el = trimestre[key];

        dataSource.push({
          key: `acumulado-${key}`,
          mes,
          csll: R$(el.totais.impostos.csll - el.totais.impostos.retencoes.csll),
          irpj: R$(el.totais.impostos.irpj - el.totais.impostos.retencoes.irpj),
          faturamento: R$(el.totais.lucro + el.totais.servicos),
        });
      }
    });

    return dataSource;
  }

  render() {
    const { dados } = this.props;
    const dataTableMovimentos = this.defineTableMovimentos();
    const dataTableServicos = this.defineTableServicos();
    const dataTableAcumulados = this.defineTableAcumulados();
    const { dataSourceGuias, columnsGuias } = this.defineTableGuias();

    let printRef = React.createRef();

    return (
      <div>
        <ReactToPrint
          trigger={() => <Button>Imprimir</Button>}
          content={() => printRef}
        />
        <div style={{ display: 'none' }}>
          <div ref={(el) => { printRef = el; }} style={{ padding: '10px' }}>
            <h2
              style={{
                width: '100%',
                textAlign: 'center',
                marginTop: '2%',
              }}
            >
              {dados
                .complementares
                .nome} - {pegaMes(dados.complementares.mes)}/{dados.complementares.ano}
            </h2>
            <Divider />
            <Row type="flex" justify="center">
              {
                dataTableMovimentos.length !== 0
                &&
                <React.Fragment>
                  <Col span={24}>
                    <h3 className="table-title">
                      Relatório de Vendas
                    </h3>
                    <TableToPrint
                      dataSource={dataTableMovimentos}
                      columns={MovimentosTable.columns}
                    />
                  </Col>
                </React.Fragment>
              }
              <Divider />
              {
                dataTableServicos.length !== 0
                &&
                <React.Fragment>
                  <Col span={24}>
                    <h3 className="table-title">
                      Relatório de Serviços Prestados
                    </h3>
                    <TableToPrint
                      dataSource={dataTableServicos}
                      columns={ServicosTable.columns}
                    />
                  </Col>
                </React.Fragment>
              }
              <Divider />
              <Col span={24}>
                <h3 className="table-title">
                  Relatório de Guias
                </h3>
                <TableToPrint
                  dataSource={dataSourceGuias}
                  columns={columnsGuias}
                />
              </Col>
              <Divider />
              <Col span={24}>
                <h3 className="table-title">
                  Acumulados
                </h3>
                <TableToPrint
                  dataSource={dataTableAcumulados}
                  columns={AcumuladosTable.columns}
                />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

export default Printer;
