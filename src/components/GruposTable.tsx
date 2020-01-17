import React from 'react';
import { Row, Col, Table } from 'antd';

import TableToPrint from './TableToPrint';

import { useStore } from '../store/Connect';

import { R$, pegaMes, dateToComp } from '../services/calculador.service';
import {
  MovimentoStore, MesesNum, Imposto, Retencao, ColType,
} from '../types';

type propTypes = {
  printable? : boolean;
}

function GruposTable(props : propTypes) : JSX.Element {
  const store = useStore<MovimentoStore>();

  const { printable } = props;
  const {
    empresa,
    simplesData,
    trimestreData,
    grupos,
    competencia,
  } = store;

  if (grupos.length === 0) return <div />;

  const { simples } = empresa || { simples: false };

  let columns : ColType[] = [
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

  let dataSource : any[] = [];

  const { servicosPool } = simples ? simplesData : trimestreData;

  const meses : MesesNum[] = simples
    ? []
    : Object.keys(trimestreData)
      .filter((k) => !Number.isNaN(parseInt(k, 10))).map((m) => parseInt(m, 10) as MesesNum);

  if (!simples) {
    columns = columns.concat(
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
    );
  }

  type TotaisSimples = {
    receita : number | string;
    iss : number | string;
    [key : string] : number | string | JSX.Element;
  };

  type TotaisLp = {
    receita : number | string;
    iss : number | string;
    pis : number | string;
    cofins : number | string;
    [key : string] : number | string | JSX.Element;
    irpjTotal : number | string;
    csllTotal : number | string;
  };

  const totais : TotaisSimples | TotaisLp = simples ? {
    receita: 0,
    iss: 0,
  } : {
    receita: 0,
    iss: 0,
    pis: 0,
    cofins: 0,
    ...meses.reduce((acc, mes : MesesNum) => ({ ...acc, [`irpj${mes}`]: 0 }), {}),
    ...meses.reduce((acc, mes : MesesNum) => ({ ...acc, [`csll${mes}`]: 0 }), {}),
    irpjTotal: 0,
    csllTotal: 0,
  };

  dataSource = grupos.concat({ id: 0, nome: 'Sem Grupo' }).map((grupo) => {
    const { id } = grupo;
    const grupoServicosPool = servicosPool.filter(({ servico }) => servico.grupoId === id);

    if (grupoServicosPool.length === 0) return null;

    const data : TotaisSimples | TotaisLp = simples ? {
      receita: 0,
      iss: 0,
    } : {
      receita: 0,
      iss: 0,
      pis: 0,
      cofins: 0,
      ...meses.reduce((acc, mes : MesesNum) => ({ ...acc, [`irpj${mes}`]: 0 }), {}),
      ...meses.reduce((acc, mes : MesesNum) => ({ ...acc, [`csll${mes}`]: 0 }), {}),
      irpjTotal: 0,
      csllTotal: 0,
    };

    if (!competencia) return null;

    const { mes } = competencia;

    grupoServicosPool.forEach((servicoPool) => {
      const { imposto, retencao, servico } = servicoPool;
      const { mes: mesAtual } = dateToComp(servico.dataHora);

      const posRet : Retencao = {};

      Object.keys(imposto).forEach((k) => {
        const key = k as keyof Imposto;
        posRet[key as keyof Retencao] = imposto[key] - (retencao[key as keyof Retencao] || 0);
      });

      if (parseInt(mesAtual, 10) === parseInt(mes, 10)) {
        (data.receita as number) += (servico.valor as number);
        (data.iss as number) += posRet.iss || 0;
        if (!simples) {
          ((data as TotaisLp).pis as number) += posRet.pis || 0;
          ((data as TotaisLp).cofins as number) += posRet.cofins || 0;
        }
      }

      if (!simples) {
        ((data as TotaisLp)[`irpj${mesAtual}`] as number) += posRet.irpj || 0;
        ((data as TotaisLp).irpjTotal as number) += posRet.irpj || 0;

        ((data as TotaisLp)[`csll${mesAtual}`] as number) += posRet.csll || 0;
        ((data as TotaisLp).csllTotal as number) += posRet.csll || 0;
      }
    });

    type Cor = {
      grupoNome : string;
      cor : string;
    }

    type SimplesCor = {
      receita : string;
      iss : string;
    } & Cor;

    type LpCor = {
      receita : string;
      iss : string;
      pis : string;
      cofins : string;
      [key : string] : string;
      irpjTotal : string;
      csllTotal : string;
    } & Cor;

    const final : SimplesCor | LpCor = {
      grupoNome: grupo.nome,
      cor: grupo.cor || '',
      receita: '',
      iss: '',
      pis: '',
      cofins: '',
      irpjTotal: '',
      csllTotal: '',
    };

    Object.keys(data).forEach((k) => {
      if (simples) {
        (totais[k as keyof TotaisSimples] as number) += (data[k as keyof TotaisSimples] as number);
        final[k as keyof TotaisSimples] = R$(data[k as keyof TotaisSimples] as number | string);
      } else {
        (totais[k as keyof TotaisLp] as number) += (data[k as keyof TotaisLp] as number);
        final[k as keyof TotaisLp] = R$((data as TotaisLp)[k as keyof TotaisLp] as number | string);
      }
    });

    return final;
  }).filter((d) => d !== null);

  if (totais) {
    Object.keys(totais).forEach((k) => {
      if (k !== 'cor' && k !== 'grupoNome' && totais) totais[k] = R$(totais[k] as number | string);
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
          rowClassName={({ cor }) : string => (cor ? cor.replace('#', 'color-') : '')}
          pagination={{ position: undefined }}
          style={{ marginBottom: '20px' }}
        />
      </Col>
    </Row>
  );
}

export default GruposTable;
