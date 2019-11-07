import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Row,
  Col,
  Button,
  Popconfirm,
} from 'antd';

import { MovimentoValorInput, TableToPrint } from '.';
import {
  R$,
  retornarTipo,
  somaTotalMovimento,
  cancelarMovimento,
  floating,
  editarMovimento,
  auth,
  eDoMes,
} from '../services';

import Connect from '../store/Connect';
import { carregarMovimento } from '../store/movimento';

function valoresRender(valor, renderObj) {
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

function sorter(a, b) {
  if (!a.numero || parseInt(a.numero, 10) > parseInt(b.numero, 10)) {
    return 1;
  }
  return -1;
}

function MovimentosTable(props) {
  const { store, dispatch, printable } = props;
  const { trimestreData, notasPool, competencia } = store;

  const { movimentosPool } = trimestreData;

  const movimentosPoolMes = movimentosPool.filter((mP) => eDoMes(mP, competencia));

  const update = (dados) => dispatch(carregarMovimento(dados));

  const [movimentosAlterados, setMovimentosAlterados] = useState({});

  let totais;

  const handleChange = (valor, nome, movimentoPoolWithKey) => {
    const movimentoPoolNovo = {
      ...movimentoPoolWithKey,
      ...movimentosAlterados[movimentoPoolWithKey.key],
    };

    const { movimento, impostoPool } = movimentoPoolNovo;
    const { imposto, icms } = impostoPool;

    if (Object.keys(icms).includes(nome)) {
      icms[nome] = floating(valor);
    } else if (Object.keys(imposto).includes(nome)) {
      imposto[nome] = floating(valor);
    } else if (nome === 'icms') {
      icms.proprio = floating(valor);
    } else if (nome === 'baseIcms') {
      icms.baseCalculo = floating(valor);
    } else {
      movimento[nome] = floating(valor);
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
      [movimentoPoolNovo.key]: {
        ...movimentoPoolNovo,
      },
    });
  };

  const cancelarMov = (movimentoId, cnpj) => cancelarMovimento(cnpj, movimentoId).then(update);

  const editarMov = (key) => {
    const movimentoPoolEditado = { ...movimentosAlterados[key] };
    delete movimentoPoolEditado.movimento.id;
    delete movimentoPoolEditado.key;

    movimentoPoolEditado.metaDados = {
      email: auth.currentUser.email,
      mdDataHora: new Date(),
      tipo: 'SUB',
      ativo: true,
      refMovimentoId: key,
    };

    editarMovimento(movimentoPoolEditado).then(update);
  };

  const dataSource = movimentosPoolMes.map((movimentoPool) => {
    const { movimento, impostoPool } = movimentoPool;
    const { imposto, icms } = impostoPool;
    const key = movimento.id;
    const notaFinal = notasPool.find((n) => n.chave === movimento.notaFinalChave);
    const notaInicial = notasPool.find((n) => n.chave === movimento.notaInicialChave);
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
        onConfirm={() => editarMov(key)}
      >
        <Button
          type="ghost"
          disabled={disabled}
          icon="edit"
        />
      </Popconfirm>
    );

    const defineMovimentoValorInput = (nome) => (
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
      numero: {
        key,
        numero: valores.numero,
        emitente: notaFinal.emitenteCpfcnpj,
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
        columns={MovimentosTable.columns}
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
          columns={MovimentosTable.columns}
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

MovimentosTable.propTypes = {
  store: PropTypes.shape({
    dominio: PropTypes.array,
    trimestreData: PropTypes.object,
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
  dispatch: PropTypes.func.isRequired,
  printable: PropTypes.bool,
};

MovimentosTable.defaultProps = {
  printable: false,
};

MovimentosTable.columns = [
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
    render: (data) => {
      if (data.$$typeof) {
        return data;
      }

      return (
        <Popconfirm
          title="Deseja mesmo excluir esse movimento?"
          okText="Sim"
          cancelText="Não"
          onConfirm={() => data.cancelarMovimento(data.key, data.emitente)}
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

export default Connect(MovimentosTable);
