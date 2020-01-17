import React, { useState } from 'react';
import {
  Table,
  Row,
  Col,
  Button,
  Popconfirm,
} from 'antd';

import MovimentoValorInput from './MovimentoValorInput';
import TableToPrint from './TableToPrint';
import {
  R$,
  retornarTipo,
  floating,
  eDoMes,
  somaTotalMovimento,
} from '../services/calculador.service';
import {
  cancelarMovimento,
  editarMovimento,
  auth,
} from '../services/api.service';

import { useStore, useDispatch } from '../store/Connect';
import { carregarMovimento } from '../store/movimento';
import {
  MovimentoStore, MovWithIndexAndKey, Icms, Imposto, Movimento,
} from '../types';

function valoresRender(valor : any, renderObj : any) : JSX.Element {
  if (renderObj.key === 'total-movimento') {
    return valor;
  }
  const valorFinal = floating(renderObj.valorFinal);
  const valorInicial = floating(renderObj.valorInicial);

  if (valorFinal >= valorInicial) {
    return valor;
  }

  return (
    <span style={{
      color: 'red',
    }}
    >
      {valor}
    </span>
  );
}

function sorter(a : { num : string }, b : { num : string }) : number {
  if (!a.num || parseInt(a.num, 10) > parseInt(b.num, 10)) {
    return 1;
  }
  return -1;
}

type propTypes = {
  printable? : boolean;
}

const columns : any = [
  {
    title: 'Editar',
    dataIndex: 'editar',
    key: 'editar',
    fixed: true,
  }, {
    title: 'Número',
    dataIndex: 'numero',
    key: 'numero',
    defaultSortOrder: 'ascend',
    sorter,
    render: (data : any) : any => {
      if (data.$$typeof) {
        return data;
      }

      return (
        <Popconfirm
          title="Deseja mesmo excluir esse movimento?"
          okText="Sim"
          cancelText="Não"
          onConfirm={() : void => data.cancelarMovimento(data.key, data.emitente)}
        >
          <Button
            type="ghost"
          >
            {data.numero}
          </Button>
        </Popconfirm>
      );
    },
  }, {
    title: 'Valor Nota Inicial',
    dataIndex: 'valorInicial',
    key: 'valorInicial',
    width: '6.67%',
    render: valoresRender,
  }, {
    title: 'Valor Nota Final',
    dataIndex: 'valorFinal',
    key: 'valorFinal',
    width: '6.67%',
    render: valoresRender,
  }, {
    title: 'Tipo de Movimento',
    dataIndex: 'tipoMovimento',
    key: 'tipoMovimento',
    width: '10%',
  }, {
    title: 'Lucro',
    dataIndex: 'lucro',
    key: 'lucro',
    width: '6.67%',
  }, {
    title: 'Base ICMS',
    dataIndex: 'baseIcms',
    key: 'baseIcms',
    width: '6.67%',
  }, {
    title: 'ICMS',
    dataIndex: 'icms',
    key: 'icms',
    width: '6.67%',
  }, {
    title: 'DIFAL',
    children: [{
      title: 'Originário',
      dataIndex: 'difalOrigem',
      key: 'difalOrigem',
      width: '6.67%',
    }, {
      title: 'Destinatário (GNRE)',
      dataIndex: 'difalDestino',
      key: 'difalDestino',
      width: '6.67%',
    }],
  }, {
    title: 'PIS',
    dataIndex: 'pis',
    key: 'pis',
    width: '6.67%',
  }, {
    title: 'COFINS',
    dataIndex: 'cofins',
    key: 'cofins',
    width: '6.67%',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
    width: '6.67%',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
    width: '6.67%',
  }, {
    title: 'TOTAL',
    dataIndex: 'total',
    key: 'total',
    width: '6.67%',
  },
];

function MovimentosTable(props : propTypes) : JSX.Element {
  const store = useStore<MovimentoStore>();
  const dispatch = useDispatch();

  const { printable = false } = props;
  const {
    trimestreData,
    simplesData,
    notas,
    competencia,
    empresa,
  } = store;

  const { simples } = empresa || { simples: false };

  const { movimentosPool } = simples ? simplesData : trimestreData;

  const movimentosPoolMes = movimentosPool.filter((mP) => eDoMes(mP, competencia));

  const update = (dados : MovimentoStore) : void => dispatch(carregarMovimento(dados));

  const [
    movimentosAlterados,
    setMovimentosAlterados,
  ] : [{ [key : string] : MovWithIndexAndKey }, Function] = useState({});

  let totais : any;

  const handleChange = (
    valor : string,
    nome : string,
    movimentoPoolWithKey : MovWithIndexAndKey,
  ) : void => {
    const movimentoPoolNovo = {
      ...movimentoPoolWithKey,
      ...movimentosAlterados[movimentoPoolWithKey?.key || ''],
    };

    const { movimento, impostoPool } = movimentoPoolNovo;
    const { imposto, icms } = impostoPool;

    if (Object.keys(icms).includes(nome)) {
      icms[(nome as keyof Icms)] = floating(valor);
    } else if (Object.keys(imposto).includes(nome)) {
      imposto[(nome as keyof Imposto)] = floating(valor);
    } else if (nome === 'icms') {
      icms.proprio = floating(valor);
    } else if (nome === 'baseIcms') {
      icms.baseCalculo = floating(valor);
    } else {
      movimento[(nome as keyof Movimento)] = floating(valor);
    }

    imposto.total = imposto.pis
    + imposto.cofins
    + imposto.irpj
    + imposto.csll
    + icms.proprio
    + icms.difalDestino
    + icms.difalOrigem;

    setMovimentosAlterados({
      ...movimentosAlterados,
      [movimentoPoolNovo.key || '']: {
        ...movimentoPoolNovo,
      },
    });
  };

  const cancelarMov = (
    movimentoId : string,
    cnpj : string,
  ) : Promise<void> => cancelarMovimento(cnpj, movimentoId).then(update);

  const editarMov = (key : number | string) : void => {
    const movimentoPoolEditado = { ...movimentosAlterados[key] };
    delete movimentoPoolEditado.movimento.id;
    delete movimentoPoolEditado.key;

    movimentoPoolEditado.metaDados = {
      email: auth.currentUser?.email || '',
      mdDataHora: new Date(),
      tipo: 'SUB',
      ativo: true,
      refMovimentoId: parseInt(key.toString(), 10),
    };

    editarMovimento(movimentoPoolEditado).then(update);
  };

  const dataSource = movimentosPoolMes.map((movimentoPool) => {
    const { movimento, impostoPool } = movimentoPool;
    const { imposto, icms } = impostoPool;
    const key = movimento.id;
    const notaFinal = notas.find((n) => n.chave === movimento.notaFinalChave);
    const notaInicial = notas.find((n) => n.chave === movimento.notaInicialChave);
    const valores : any = {
      key,
      numero: notaFinal?.numero,
      num: notaFinal?.numero,
      valorInicial: R$(notaInicial?.valor || 0),
      valorFinal: R$(notaFinal?.valor || 0),
      tipoMovimento: retornarTipo(notaFinal?.cfop || ''),
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
      cor: '',
      fontWeight: '',
    };

    totais = somaTotalMovimento(valores, totais);

    const prejuizo = floating(valores.valorFinal) < floating(valores.valorInicial);


    if (printable) {
      valores.cor = prejuizo ? '#FFF701' : null;
      valores.fontWeight = prejuizo ? 'bold' : 'normal';
      return valores;
    }

    const disabled = !Object.keys(movimentosAlterados).includes(key.toString());

    const editar = (
      <Popconfirm
        title="Deseja mesmo editar esse movimento?"
        okText="Sim"
        cancelText="Não"
        onConfirm={() : void => editarMov(key)}
      >
        <Button
          type="ghost"
          disabled={disabled}
          icon="edit"
        />
      </Popconfirm>
    );

    const defineMovimentoValorInput = (nome : string) : JSX.Element => (
      <MovimentoValorInput
        movimentoPoolWithKey={{ ...movimentoPool, key }}
        onChange={handleChange}
        value={valores[nome]}
        name={nome}
      />
    );


    return {
      key,
      editar,
      num: valores.num,
      numero: {
        key,
        numero: valores.numero,
        emitente: notaFinal?.emitenteCpfcnpj,
        cancelarMovimento: cancelarMov,
      },
      valorInicial: valores.valorInicial,
      valorFinal: valores.valorFinal,
      tipoMovimento: valores.tipoMovimento,
      lucro: defineMovimentoValorInput('lucro'),
      baseIcms: defineMovimentoValorInput('baseIcms'),
      icms: defineMovimentoValorInput('icms'),
      difalOrigem: defineMovimentoValorInput('difalOrigem'),
      difalDestino: defineMovimentoValorInput('difalDestino'),
      pis: defineMovimentoValorInput('pis'),
      cofins: defineMovimentoValorInput('cofins'),
      csll: defineMovimentoValorInput('csll'),
      irpj: defineMovimentoValorInput('irpj'),
      total: valores.total,
    };
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
          scroll={{ x: '150%' }}
          style={{
            marginBottom: '20px',
          }}
          pagination={{ position: 'top', simple: true }}
        />
      </Col>
    </Row>
  );
}

MovimentosTable.defaultProps = {
  printable: false,
};

export default MovimentosTable;
