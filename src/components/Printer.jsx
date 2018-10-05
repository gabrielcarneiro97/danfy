import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import { Divider, Row, Col, Button } from 'antd';

import { MovimentosTable, ServicosTable, TableToPrint, AcumuladosTable, CotasTable } from '.';
import { R$, retornarTipo, somaTotalMovimento, somaTotalServico, pegaMes, cnpjMask } from '../services';

import './Printer.css';

const temServicos = props => Object.keys(props.dados.servicos).length > 0;
const temMovimentos = props => Object.keys(props.dados.movimentos).length > 0;

function temTabelaCotas({ formaPagamento, mes }) {
  return formaPagamento === 'PAGAMENTO EM COTAS' &&
    parseInt(mes, 10) % 3 === 0;
}

function defineTableMovimentos(props) {
  const { movimentos, notas } = props.dados;
  let printSource = [];
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

  printSource = printSource.sort((a, b) => {
    if (!a.numero) {
      return 1;
    } else if (!b.numero) {
      return -1;
    }
    if (a.numero > b.numero) {
      return 1;
    }
    return -1;
  });

  if (totais) {
    printSource.push(totais);
  }
  return printSource;
}

function defineTableServicos(props) {
  const { servicos } = props.dados;
  let printSource = [];
  let totais;

  Object.keys(servicos).forEach((key) => {
    const servico = servicos[key];

    const numero = parseInt(servico.nota.substring(18), 10);

    const valores = {
      key: servico.nota,
      nota: numero,
      status: servico.notaStatus,
      data: moment(servico.data).format('DD[/]MMM'),
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

  printSource = printSource.sort((a, b) => {
    if (!a.nota) {
      return 1;
    } else if (!b.nota) {
      return -1;
    }
    if (a.nota > b.nota) {
      return 1;
    }
    return -1;
  });

  if (totais) {
    printSource.push(totais);
  }
  return printSource;
}

function defineTableGuias(props) {
  const { complementares, trimestre } = props.dados;
  const columnsGuias = [];
  const dataSourceGuias = [];
  const data = {};

  if (temMovimentos(props)) {
    columnsGuias.push({
      title: 'ICMS',
      dataIndex: 'icms',
      key: 'icms',
    });
    data.icms = R$(trimestre[complementares.mes].totais.impostos.icms.proprio +
      trimestre[complementares.mes].totais.impostos.icms.difal.origem);
  }

  if (temServicos(props)) {
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

function defineTableAcumulados(props) {
  const { trimestre } = props.dados;
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

function calcularCotas(props) {
  const { totais } = props.dados.trimestre;

  const valorIr = totais.impostos.irpj +
    (totais.impostos.adicionalIr - totais.impostos.retencoes.irpj);
  const valorCsll = totais.impostos.csll - totais.impostos.retencoes.csll;

  let cotaIr = { valor: 0, numero: 0 };
  let cotaCsll = { valor: 0, numero: 0 };

  if (valorIr / 3 > 1000) {
    cotaIr = { valor: valorIr / 3, numero: 3 };
  } else if (valorIr / 2 > 1000) {
    cotaIr = { valor: valorIr / 2, numero: 2 };
  } else {
    cotaIr = { valor: valorIr, numero: 1 };
  }
  if (valorCsll / 3 > 1000) {
    cotaCsll = { valor: valorCsll / 3, numero: 3 };
  } else if (valorCsll / 2 > 1000) {
    cotaCsll = { valor: valorCsll / 2, numero: 2 };
  } else {
    cotaCsll = { valor: valorCsll, numero: 1 };
  }

  return { cotaCsll, cotaIr };
}

function defineTableCotas(props) {
  const { cotaCsll, cotaIr } = calcularCotas(props);

  const dataSource = [];
  if (temTabelaCotas(props.dados.complementares)) {
    for (let num = 1; num <= 3; num += 1) {
      const row = {
        key: `${num}-cotas-table`,
        numero: num,
        csll: '0,00',
        irpj: '0,00',
      };

      if (cotaCsll.numero >= num) {
        row.csll = R$(cotaCsll.valor);
      }

      if (cotaIr.numero >= num) {
        row.irpj = R$(cotaIr.valor);
      }

      dataSource.push(row);
    }
  }
  return dataSource;
}

function Printer(props) {
  const { dados } = props;
  const dataTableMovimentos = defineTableMovimentos(props);
  const dataTableServicos = defineTableServicos(props);
  const dataTableAcumulados = defineTableAcumulados(props);
  const { dataSourceGuias, columnsGuias } = defineTableGuias(props);
  const dataTableCotas = defineTableCotas(props);

  let printRef = React.createRef();

  console.log(dados.complementares);

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
              .nome} - {cnpjMask(dados.complementares.cnpj)}
          </h2>
          <h3
            style={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            Competência: {pegaMes(dados.complementares.mes)}/{dados.complementares.ano}
          </h3>
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
            {
              dataTableCotas.length !== 0
              &&
              <React.Fragment>
                <Col span={24}>
                  <h3 className="table-title">
                    Cotas
                  </h3>
                  <TableToPrint
                    dataSource={dataTableCotas}
                    columns={CotasTable.columns}
                  />
                </Col>
              </React.Fragment>
            }
          </Row>
        </div>
      </div>
    </div>
  );
}


Printer.propTypes = {
  dados: PropTypes.shape({ // eslint-disable-line
    movimentos: PropTypes.object,
    servicos: PropTypes.object,
    notas: PropTypes.object,
    complementares: PropTypes.object,
    trimestre: PropTypes.object,
  }).isRequired,
};

export default Printer;
