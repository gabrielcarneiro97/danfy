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
  R$, floating, calcularImposto,
} from '../services/calculador.service';

import { useStore, useDispatch } from '../store/Connect';
import {
  Investimentos,
  MovimentoStore,
  ValorTributavel,
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
    width: '20%',
  }, {
    title: 'Valor',
    dataIndex: 'valor',
    key: 'valor',
    width: '20%',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
    width: '20%',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
    width: '20%',
  }, {
    title: 'Retenção',
    dataIndex: 'retencao',
    key: 'retencao',
    width: '20%',
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

type InvestimentosTableModel = {
  rendimentos: ValorTributavel;
  jurosDescontos: ValorTributavel;
  ganhoCapital: ValorTributavel;
  retencao: string;
  valorTotal: string;
  irpjTotal: string;
  csllTotal: string;
}

function initModel(investimentos?: Investimentos) : InvestimentosTableModel {
  const retencao = investimentos?.retention || 0;
  const rendimentos = calcularImposto(investimentos?.income || 0, retencao);
  const jurosDescontos = calcularImposto(investimentos?.fees_discounts || 0, retencao);
  const ganhoCapital = calcularImposto(investimentos?.capital_gain || 0, retencao);
  return buildModel(rendimentos, jurosDescontos, ganhoCapital, retencao);
}

function recalcularModel(model: InvestimentosTableModel) : InvestimentosTableModel {
  const retencao = floating(model.retencao);
  const rendimentos = calcularImposto(floating(model.rendimentos.valor), retencao);
  const jurosDescontos = calcularImposto(floating(model.jurosDescontos.valor), retencao);
  const ganhoCapital = calcularImposto(floating(model.ganhoCapital.valor), retencao);
  return buildModel(rendimentos, jurosDescontos, ganhoCapital, retencao);
}

function buildModel(
  rendimentos: ValorTributavel,
  jurosDescontos: ValorTributavel,
  ganhoCapital: ValorTributavel,
  retencao: number
) : InvestimentosTableModel {
  return {
    rendimentos,
    jurosDescontos,
    ganhoCapital,
    retencao: R$(retencao),
    valorTotal: R$(floating(rendimentos.valor) + floating(jurosDescontos.valor) + floating(ganhoCapital.valor)),
    irpjTotal: R$(floating(rendimentos.irpj) + floating(jurosDescontos.irpj) + floating(ganhoCapital.irpj)),
    csllTotal: R$(floating(rendimentos.csll) + floating(jurosDescontos.csll) + floating(ganhoCapital.csll)),
  }
}

function InvestimentosTable(props : propTypes) : JSX.Element {
  const store = useStore<MovimentoStore>();
  const dispatch = useDispatch();

  const { printable = false } = props;
  const {
    competencia,
    empresa,
    investimentos,
  } = store;

  const [editDisabled, setEditDisabled] = useState(true);
  const [model, setModel] : [InvestimentosTableModel, Function] = useState(initModel(investimentos));
  const mapaValores : any = {
    'rendimentos': model.rendimentos,
    'jurosDescontos': model.jurosDescontos,
    'ganhoCapital': model.ganhoCapital
  }

  const handleChange = (
    valor : string,
    nome : string,
  ) : void => {
    if (nome === 'retencao') {
      model[nome] = R$(valor);
    } else {
      mapaValores[nome].valor = R$(valor);
    }
    setModel(recalcularModel(model));
    setEditDisabled(false);
  };

  const update = (dados : Investimentos) : void => dispatch(carregarInvestimentos(dados));

  const editarInvestimentos = () : void => {
    var investimentos: Investimentos = {
      owner: empresa?.cnpj || '',
      year: Number(competencia?.ano) || 0,
      month: Number(competencia?.mes) || 0,
      income: floating(model.rendimentos.valor),
      fees_discounts: floating(model.jurosDescontos.valor),
      capital_gain: floating(model.ganhoCapital.valor),
      retention: floating(model.retencao),
    }

    enviarInvestimentos(investimentos).then(update);
    setEditDisabled(true);
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
        disabled={editDisabled}
        icon="edit"
      />
    </Popconfirm>
  );

  const defineInvestimentoValorInput = (nome : string) : JSX.Element => (
    <InvestimentoValorInput
      onChange={handleChange}
      value={nome === 'retencao' ? model.retencao : mapaValores[nome].valor}
      name={nome}
    />
  );
  
  const stg = (str : string) : JSX.Element => <strong>{str}</strong>;

  const dataSource = [{ 
    key: 1,
    editar: undefined,
    tipo: stg('Rendimentos'),
    valor: defineInvestimentoValorInput('rendimentos'),
    csll: model.rendimentos.csll,
    irpj: model.rendimentos.irpj,
    retencao: defineInvestimentoValorInput('retencao'),
  }, { 
    key: 2,
    editar: undefined,
    tipo: stg('Juros / Descontos'),
    valor: defineInvestimentoValorInput('jurosDescontos'),
    csll: model.jurosDescontos.csll,
    irpj: model.jurosDescontos.irpj,
  }, { 
    key: 3,
    editar: undefined,
    tipo: stg('Ganho de Capital'),
    valor: defineInvestimentoValorInput('ganhoCapital'),
    csll: model.ganhoCapital.csll,
    irpj: model.ganhoCapital.irpj,
  }, { 
    key: 4,
    editar,
    tipo: stg('Totais'),
    valor: model.valorTotal,
    csll: model.csllTotal,
    irpj: model.irpjTotal,
  }];

  if (printable) {
    const printableDataSource = [{
      key: 1,
      editar: undefined,
      tipo: stg('Rendimentos'),
      valor: model.rendimentos.valor,
      csll: model.rendimentos.csll,
      irpj: model.rendimentos.irpj,
      retencao: model.retencao,
    }, {
      key: 2,
      editar: undefined,
      tipo: stg('Juros / Descontos'),
      valor: model.jurosDescontos.valor,
      csll: model.jurosDescontos.csll,
      irpj: model.jurosDescontos.irpj,
    }, {
      key: 3,
      editar: undefined,
      tipo: stg('Ganho de Capital'),
      valor: model.ganhoCapital.valor,
      csll: model.ganhoCapital.csll,
      irpj: model.ganhoCapital.irpj,
    }, {
      key: 4,
      editar,
      tipo: stg('Totais'),
      valor: model.valorTotal,
      csll: model.csllTotal,
      irpj: model.irpjTotal,
    }];
    
    return (
      <TableToPrint
        dataSource={printableDataSource}
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
