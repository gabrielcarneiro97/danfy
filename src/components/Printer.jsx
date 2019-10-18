import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import { Divider, Row, Col, Button } from 'antd';

import { MovimentosTable, ServicosTable, TableToPrint, AcumuladosTable, CotasTable } from '.';
import { R$, retornarTipo, somaTotalMovimento, somaTotalServico, pegaMes, cnpjMask, mesInicioFim, eDoMes, calcularCotas, temTabelaCotas, floating } from '../services';

import './Printer.css';

const temServicos = props => props.dados.trimestreData.servicosPool.length > 0;
const temMovimentos = props => props.dados.trimestreData.movimentosPool.length > 0;


function defineTableMovimentos(props) {
  const { dados } = props;
  const { notasPool } = dados;
  const { mes, ano } = dados.complementares;
  const { movimentosPool } = dados.trimestreData;

  let totais;

  const mesTimes = mesInicioFim(mes, ano);

  const movimentosPoolMes = movimentosPool.filter(mP => eDoMes(mP, mesTimes));

  let printSource = movimentosPoolMes.map((movimentoPool) => {
    const { movimento, impostoPool } = movimentoPool;
    const { imposto, icms } = impostoPool;
    const key = movimento.id;
    const notaFinal = notasPool.find(n => n.chave === movimento.notaFinalChave);
    const notaInicial = notasPool.find(n => n.chave === movimento.notaInicialChave);
    const valores = {
      key,
      numero: notaFinal.numero,
      valorInicial: R$(notaInicial.valor),
      valorFinal: R$(notaFinal.valor),
      tipoMovimento: retornarTipo(notaFinal.cfop),
      lucro: R$(movimento.lucro),
      baseIcms: R$(icms.baseCalculo),
      icms: R$(icms.proprio),
      difalOrigem: icms.difalOrigem ? R$(icms.difalOrigem) : '0,00',
      difalDestino: icms.difalDestino ? R$(icms.difalDestino) : '0,00',
      pis: R$(imposto.pis),
      cofins: R$(imposto.cofins),
      csll: R$(imposto.csll),
      irpj: R$(imposto.irpj),
      total: R$(imposto.total),
    };

    valores.cor = floating(valores.valorFinal) < floating(valores.valorInicial) ? '#FFF701' : null;

    totais = somaTotalMovimento(valores, totais);

    return valores;
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

function eCancelada(nota) {
  return nota.status === 'CANCELADA';
}

function defineTableServicos(props) {
  const { dados } = props;
  const { notasServicoPool } = dados;
  const { mes, ano } = dados.complementares;
  const { servicosPool } = dados.trimestreData;

  const mesTimes = mesInicioFim(mes, ano);

  const servicosPoolMes = servicosPool.filter(sP => eDoMes(sP, mesTimes));
  let totais;

  let printSource = servicosPoolMes.map((servicoPool) => {
    const { servico, imposto, retencao } = servicoPool;

    const numero = parseInt(servico.notaChave.substring(18), 10);
    const nota = notasServicoPool.find(n => n.chave === servico.notaChave);

    const valores = {
      key: servico.notaChave,
      nota: numero,
      status: nota.status,
      data: moment(servico.data).format('DD[/]MMM'),
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
    };

    totais = somaTotalServico(valores, totais);

    return valores;
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
  const { complementares, trimestreData } = props.dados;
  const columnsGuias = [];
  const dataSourceGuias = [];
  const data = {};
  const { acumulado, retencao, impostoPool } = trimestreData[complementares.mes].totalSomaPool;
  const { imposto, icms } = impostoPool;
  const trimestre = trimestreData.trim.totalSomaPool;

  if (temMovimentos(props)) {
    columnsGuias.push({
      title: 'ICMS',
      dataIndex: 'icms',
      key: 'icms',
    });
    data.icms = R$(icms.proprio + icms.difalOrigem);
  }

  if (temServicos(props)) {
    columnsGuias.push({
      title: 'ISS',
      dataIndex: 'iss',
      key: 'iss',
    });
    data.iss = R$(imposto.iss - retencao.iss);
  }

  columnsGuias.push({
    title: 'PIS',
    dataIndex: 'pis',
    key: 'pis',
  });

  data.pis = R$((imposto.pis - retencao.pis) + acumulado.pis);

  columnsGuias.push({
    title: 'COFINS',
    dataIndex: 'cofins',
    key: 'cofins',
  });

  data.cofins = R$((imposto.cofins - retencao.cofins) + acumulado.cofins);

  if (parseInt(complementares.mes, 10) % 3 === 0 &&
    complementares.formaPagamento !== 'PAGAMENTO ANTECIPADO') {
    columnsGuias.push({
      title: 'CSLL',
      dataIndex: 'csll',
      key: 'csll',
    });
    data.csll = R$(trimestre.impostoPool.imposto.csll - trimestre.retencao.csll);

    columnsGuias.push({
      title: 'IRPJ + ADICIONAL',
      dataIndex: 'irpj',
      key: 'irpj',
    });
    data.irpj = R$((trimestre.impostoPool.imposto.irpj - trimestre.retencao.irpj) +
      trimestre.impostoPool.imposto.adicionalIr);
  } else if (parseInt(complementares.mes, 10) % 3 !== 0 &&
    complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
    columnsGuias.push({
      title: 'CSLL',
      dataIndex: 'csll',
      key: 'csll',
    });

    data.csll = R$(imposto.csll - retencao.csll);

    columnsGuias.push({
      title: 'IRPJ',
      dataIndex: 'irpj',
      key: 'irpj',
    });
    data.irpj = R$(imposto.irpj - retencao.irpj);
  } else if (parseInt(complementares.mes, 10) % 3 === 0 &&
    complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
    columnsGuias.push({
      title: 'CSLL',
      dataIndex: 'csll',
      key: 'csll',
    });
    data.csll = R$(imposto.csll - retencao.csll);

    columnsGuias.push({
      title: 'IRPJ + ADICIONAL',
      dataIndex: 'irpj',
      key: 'irpj',
    });
    data.irpj = R$((imposto.irpj - retencao.irpj) +
    trimestre.impostoPool.imposto.adicionalIr);
  }

  data.key = 'guias';

  dataSourceGuias.push(data);

  return {
    dataSourceGuias,
    columnsGuias,
  };
}

function defineTableAcumulados(props) {
  const stg = str => <strong>{str}</strong>;

  const { trimestreData } = props.dados;
  const dataSource = [];

  Object.keys(trimestreData).forEach((key) => {
    if (key !== 'movimentosPool' && key !== 'servicosPool') {
      const mes = key === 'trim' ? <strong>Trimestre</strong> : pegaMes(key);


      const { totalSomaPool } = trimestreData[key];
      const { retencao, totalSoma } = totalSomaPool;
      const { imposto } = totalSomaPool.impostoPool;

      dataSource.push({
        key: `acumulado-${key}`,
        mes,
        csll: key === 'trim' ? stg(R$(imposto.csll - retencao.csll)) : R$(imposto.csll - retencao.csll),
        irpj: key === 'trim' ? stg(R$(imposto.irpj - retencao.irpj)) : R$(imposto.irpj - retencao.irpj),
        faturamento: key === 'trim' ? stg(R$(totalSoma.valorMovimento + totalSoma.valorServico)) : R$(totalSoma.valorMovimento + totalSoma.valorServico),
      });
    }
  });

  return dataSource;
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

  return (
    <div>
      <ReactToPrint
        trigger={() => <Button>Imprimir</Button>}
        content={() => printRef}
      />
      <div style={{ display: 'none' }}>
        <div ref={(el) => { printRef = el; }}>
          <h2
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '2%',
            }}
          >
            ({dados.complementares.numeroSistema})
            &nbsp;
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
          <Row type="flex" justify="center">
            {
              dataTableMovimentos.length !== 0
              &&
              <React.Fragment>
                <Divider orientation="left">Relatório de Vendas</Divider>
                <Col span={24}>
                  <TableToPrint
                    dataSource={dataTableMovimentos}
                    columns={MovimentosTable.columns}
                  />
                </Col>
              </React.Fragment>
            }
            {
              dataTableServicos.length !== 0
              &&
              <React.Fragment>
                <Divider orientation="left">Relatório de Serviços Prestados</Divider>
                <Col span={24}>
                  <TableToPrint
                    dataSource={dataTableServicos}
                    columns={ServicosTable.columns}
                  />
                </Col>
              </React.Fragment>
            }
            <Divider orientation="left">Relatório de Guias</Divider>
            <Col span={24}>
              <TableToPrint
                dataSource={dataSourceGuias}
                columns={columnsGuias}
              />
            </Col>
            <Divider orientation="left">Acumulados</Divider>
            <Col span={24}>
              <TableToPrint
                dataSource={dataTableAcumulados}
                columns={AcumuladosTable.columns}
              />
            </Col>
            {
              dataTableCotas.length !== 0
              &&
              <React.Fragment>
                <Divider orientation="left">Cotas</Divider>
                <Col span={24}>
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
    movimentos: PropTypes.array,
    servicos: PropTypes.array,
    notas: PropTypes.object,
    complementares: PropTypes.object,
    trimestre: PropTypes.object,
  }).isRequired,
};

export default Printer;
