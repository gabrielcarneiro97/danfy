import React from 'react';
import { Row, Col, Table } from 'antd';

import TableToPrint from './TableToPrint';
import { R$, floating, calcularImpostosInvestimentos } from '../services/calculador.service';

import { useStore } from '../store/Connect';
import { MovimentoStore, MesesNum, Investimentos } from '../types';

type propTypes = {
  printable? : boolean;
}

function GuiasTable(props : propTypes) : JSX.Element {
  const store = useStore<MovimentoStore>();

  const { printable = false } = props;
  const { trimestreData, competencia, empresa, investimentos, aliquotas } = store;
  const { movimentosPool, servicosPool } = trimestreData;
  const { mes } = competencia || { mes: '' };
  var aliquotaIr = 0;
  if (aliquotas) {
    aliquotaIr = aliquotas.irpj;
  }

  const temMovimentos = movimentosPool.length > 0;
  const temServicos = servicosPool.length > 0;

  const investimentosVazios: Investimentos = {
    owner: '',
    year: 0,
    month: 0,
    income: 0,
    fees_discounts: 0,
    capital_gain: 0,
    retention: 0,
  }
  const impostosInvestimentos = calcularImpostosInvestimentos(investimentos || investimentosVazios);

  const columns : any = [];
  const dataSource : any = [];
  const data : any = {};

  const mesNum = parseInt(mes, 10) as MesesNum;

  const mesData = trimestreData[mesNum];

  if (!mesData || !trimestreData || !trimestreData.trim || !empresa) {
    dataSource.push({});
  } else {
    const { acumulado, retencao, impostoPool } = mesData.totalSomaPool;
    const { imposto, icms } = impostoPool;
    const trimestre = trimestreData.trim.totalSomaPool;

    if (temMovimentos) {
      columns.push({
        title: 'ICMS',
        dataIndex: 'icms',
        key: 'icms',
      });
      data.icms = R$(icms.proprio + icms.difalOrigem);
    }

    if (temServicos) {
      columns.push({
        title: 'ISS',
        dataIndex: 'iss',
        key: 'iss',
      });
      data.iss = R$(imposto.iss - (retencao.iss || 0));
    }

    columns.push({
      title: 'PIS',
      dataIndex: 'pis',
      key: 'pis',
    });

    data.pis = R$((imposto.pis - (retencao.pis || 0)) + acumulado.pis);

    columns.push({
      title: 'COFINS',
      dataIndex: 'cofins',
      key: 'cofins',
    });

    data.cofins = R$((imposto.cofins - (retencao.cofins || 0)) + acumulado.cofins);

    if (parseInt(mes, 10) % 3 === 0
    && empresa.formaPagamento !== 'LUCRO PRESUMIDO - PAGAMENTO ANTECIPADO') {
      var adicionalIr = trimestre.impostoPool.imposto.adicionalIr;
      var csll = trimestre.impostoPool.imposto.csll - (trimestre.retencao.csll || 0);
      var irpj = (trimestre.impostoPool.imposto.irpj - (trimestre.retencao.irpj || 0));
      
      if (empresa.formaPagamento !== 'SIMPLES') {
        csll += floating(impostosInvestimentos.csllTotal);
        irpj += floating(impostosInvestimentos.irpjTotal);
        if (floating(impostosInvestimentos.valorTotal) > 0) {
          const baseMovimento = aliquotaIr === 0.012 ? 0.08 : 0.32;
          const montante = trimestre.totalSoma.valorMovimento * baseMovimento + trimestre.totalSoma.valorServico * 0.32 + floating(impostosInvestimentos.valorTotal);
          if (montante > 60000) {
            adicionalIr = (montante - 60000) * 0.1;
          }
        }
      }

      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(csll);

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$(irpj + adicionalIr);
    } else if (parseInt(mes, 10) % 3 !== 0
      && empresa.formaPagamento === 'LUCRO PRESUMIDO - PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });

      data.csll = R$(imposto.csll - (retencao.csll || 0));

      columns.push({
        title: 'IRPJ',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$(imposto.irpj - (retencao.irpj || 0));
    } else if (parseInt(mes, 10) % 3 === 0
      && empresa.formaPagamento === 'LUCRO PRESUMIDO - PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(imposto.csll - (retencao.csll || 0) + floating(impostosInvestimentos.csllTotal));

      var adicionalIr = trimestre.impostoPool.imposto.adicionalIr;
      if (impostosInvestimentos.valorTotal > 0) {
        const baseMovimento = aliquotaIr === 0.012 ? 0.08 : 0.32;
        const montante = trimestre.totalSoma.valorMovimento * baseMovimento + trimestre.totalSoma.valorServico * 0.32 + floating(impostosInvestimentos.valorTotal);
        if (montante > 60000) {
          adicionalIr = (montante - 60000) * 0.1;
        }
      }

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$((imposto.irpj - (retencao.irpj || 0) + floating(impostosInvestimentos.irpjTotal)) + adicionalIr);
    }

    data.key = 'guias';
    dataSource.push(data);
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
          pagination={{ position: undefined }}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

export default GuiasTable;
