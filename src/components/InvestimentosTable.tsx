import React, { useState } from 'react';
import {
  Table,
  Row,
  Col,
  Input,
  Button,
  Popconfirm,
} from 'antd';

import TableToPrint from './TableToPrint';
import {
  R$, floating,
} from '../services/calculador.service';

import { useStore, useDispatch } from '../store/Connect';
import {
  Investimentos,
  MovimentoStore,
} from '../types';

import { carregarInvestimentos } from '../store/movimento';
import { enviarInvestimentos } from '../services/api.service';

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
    title: 'Tipo',
    dataIndex: 'tipo',
    key: 'tipo',
    width: '25%',
  }, {
    title: 'Valor',
    dataIndex: 'valor',
    key: 'valor',
    width: '25%',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
    width: '25%',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
    width: '25%',
  },
];

type inputPropTypes = {
  onChange? : Function;
  name? : string;
  value? : number | string;
  disabled? : boolean;
}

function InvestimentoValorInput(props : inputPropTypes) : JSX.Element {
  const {
    onChange = () : boolean => true,
    name: propsName,
    value: propsValue = '',
    disabled: propsDisabled = false,
  } = props;

  const [name] = useState(propsName);
  const [value, setValue] = useState(propsValue);
  const [disabled] = useState(propsDisabled);

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) : void => {
    setValue(e.target.value);
    onChange(e.target.value, name);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      disabled={disabled}
      size="small"
    />
  );
}

function InvestimentosTable(props : propTypes) : JSX.Element {
  const store = useStore<MovimentoStore>();
  const dispatch = useDispatch();

  const { printable = false } = props; // TODO fazer o print no PDF
  const {
    competencia,
    empresa,
    investimentos,
  } = store;

  const valores : any = {
    rendimentos: R$(investimentos?.income || 0),
    jurosDescontos: R$(investimentos?.fees_discounts || 0),
    ganhoCapital: R$(investimentos?.capital_gain || 0),
  }

  const [
    valorTotal, 
    setValorTotal
  ] = useState(R$((investimentos?.income || 0) + (investimentos?.fees_discounts || 0) + (investimentos?.capital_gain || 0)));

  const [
    investimentosAlterados,
    setInvestimentosAlterados,
  ] : [{ [key : string] : number }, Function] = useState({});

  const handleChange = (
    valor : string,
    nome : string,
  ) : void => {
    const valorInicial = valores[nome];
    const novoValorTotal = investimentosAlterados[nome] == null
      ? floating(valorTotal) - floating(valorInicial) + floating(valor)
      : floating(valorTotal) - investimentosAlterados[nome] + floating(valor);

    setValorTotal(R$(novoValorTotal));
    
    setInvestimentosAlterados({
      ...investimentosAlterados,
      [nome]: floating(valor)
    });
  };

  const update = (dados : Investimentos) : void => dispatch(carregarInvestimentos(dados));

  const editarInvestimentos = () : void => {
    const rendimentos = investimentosAlterados['rendimentos'] == null
      ? floating(valores['rendimentos']) : investimentosAlterados['rendimentos'];
    const jurosDescontos = investimentosAlterados['jurosDescontos'] == null
      ? floating(valores['jurosDescontos']) : investimentosAlterados['jurosDescontos'];
    const ganhoCapital = investimentosAlterados['ganhoCapital'] == null
      ? floating(valores['ganhoCapital']) : investimentosAlterados['ganhoCapital'];

    var investimentos: Investimentos = {
      owner: empresa?.cnpj || '',
      year: Number(competencia?.ano) || 0,
      month: Number(competencia?.mes) || 0,
      income: rendimentos,
      fees_discounts: jurosDescontos,
      capital_gain: ganhoCapital,
      retention: 0, // TODO
    }

    enviarInvestimentos(investimentos).then(update);
  };

  const editar = (
    <Popconfirm
      title="Realmente deseja editar investimentos?"
      okText="Sim"
      cancelText="Não"
      onConfirm={() : void => editarInvestimentos()}
    >
      <Button
        type="ghost"
        icon="edit"
      />
    </Popconfirm>
  );

  const defineInvestimentoValorInput = (nome : string) : JSX.Element => (
    <InvestimentoValorInput
      onChange={handleChange}
      value={valores[nome]}
      name={nome}
    />
  );
  
  const stg = (str : string) : JSX.Element => <strong>{str}</strong>;

  const dataSource = [{ 
    key: 1,
    editar: undefined,
    tipo: stg('Rendimentos'),
    valor: defineInvestimentoValorInput('rendimentos'),
    csll: R$(0), // TODO calcular
    irpj: R$(0), // TODO calcular
  }, { 
    key: 2,
    editar: undefined,
    tipo: stg('Juros / Descontos'),
    valor: defineInvestimentoValorInput('jurosDescontos'),
    csll: R$(0), // TODO calcular
    irpj: R$(0), // TODO calcular
  }, { 
    key: 3,
    editar: undefined,
    tipo: stg('Ganho de Capital'),
    valor: defineInvestimentoValorInput('ganhoCapital'),
    csll: R$(0), // TODO calcular
    irpj: R$(0), // TODO calcular
  }, { 
    key: 4,
    editar,
    tipo: stg('Totais'),
    valor: valorTotal,
    csll: R$(0), // TODO calcular
    irpj: R$(0), // TODO calcular
  }];

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
          style={{
            marginBottom: '20px',
          }}
          pagination={false}
        />
      </Col>
    </Row>
  );
}

export default InvestimentosTable;
