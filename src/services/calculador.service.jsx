import React from 'react';
import moment from 'moment';
import 'moment-timezone';


export function R$(valp) {
  if (valp === null) return '0,00';
  let valor = parseFloat(valp).toFixed(2);

  let negativo = '';

  if (valor.charAt(0) === '-') {
    negativo = '-';
    valor = valor.replace('-', '');
  }

  valor = valor.toString().replace('.', ',');

  let esquerda = valor.split(',')[0];
  const direita = valor.split(',')[1];

  let counter = 0;
  const esquerdaArr = [];
  for (let i = esquerda.length - 1; i >= 0; i -= 1) {
    counter += 1;
    esquerdaArr.push(esquerda[i]);
    if (counter === 3 && i > 0) {
      esquerdaArr.push('.');
      counter = 0;
    }
  }
  esquerda = esquerdaArr.reverse().join('');

  return `${negativo}${esquerda},${direita}`;
}

export function floating(stringVal) {
  if (stringVal === undefined || stringVal === null) {
    return 0;
  }
  if (typeof stringVal === 'number') {
    return stringVal;
  }
  if (stringVal === '' || Number.isNaN(parseFloat(stringVal.replace(/\./g, '').replace(/,/g, '.')))) {
    return 0;
  }
  return parseFloat(stringVal.replace(/\./g, '').replace(/,/g, '.'));
}

export function somaTotalServico(servico, total) {
  let retorno = { ...total };
  if (!total) {
    retorno = {
      key: 'total-servicos',
      nota: '',
      status: <strong>TOTAIS: </strong>,
      data: '',
      valorServico: 0,
      issRetido: 0,
      pisRetido: 0,
      cofinsRetido: 0,
      csllRetido: 0,
      irpjRetido: 0,
      totalRetido: 0,
      iss: 0,
      pis: 0,
      cofins: 0,
      csll: 0,
      irpj: 0,
      total: 0,
    };
  }

  Object.keys(retorno).forEach((key) => {
    if (key !== 'nota' && key !== 'status' && key !== 'key' && key !== 'data') {
      retorno[key] = R$(floating(retorno[key]) + floating(servico[key]));
    }
  });

  return retorno;
}

export function somaTotalMovimento(movimento, total) {
  let retorno = { ...total };
  if (!total) {
    retorno = {
      key: 'total-movimento',
      editar: '',
      numero: <strong>TOTAIS: </strong>,
      tipoMovimento: '',
      valorInicial: 0,
      valorFinal: 0,
      lucro: 0,
      baseIcms: 0,
      icms: 0,
      difalOrigem: 0,
      difalDestino: 0,
      pis: 0,
      cofins: 0,
      csll: 0,
      irpj: 0,
      total: 0,
    };
  }
  Object.keys(retorno).forEach((key) => {
    if (key !== 'editar' &&
      key !== 'numero' &&
      key !== 'key' &&
      key !== 'tipoMovimento' &&
      key !== 'valorFinal') {
      retorno[key] = R$(floating(retorno[key]) + floating(movimento[key]));
    } else if (key === 'valorFinal' && movimento.tipoMovimento !== 'DEVOLUÇÃO DE VENDA') {
      retorno[key] = R$(floating(retorno[key]) + floating(movimento[key]));
    }
  });

  return retorno;
}

export const cfopCompra = ['1102', '2102'];
export const cfopDevolucao = ['1202', '2202'];
export const cfopDevolucaoCompra = ['5202', '5413', '6202'];
export const cfopVenda = ['5102', '6102', '6108'];
export const cfopConsignacao = ['1917', '2917'];
export const cfopCompraConsignacao = ['1113'];
export const cfopVendaConsignacao = ['5115', '6115', '5114'];
export const cfopDevolucaoConsignacao = ['5918', '6918'];
export const cfopDevolucaoDemonstracao = ['6913', '5913'];
export const cfopDevolucaoSimbolica = ['5919', '6919'];

export function retornarTipo(cfop) {
  if (cfopCompra.includes(cfop)) {
    return 'COMPRA';
  } else if (cfopDevolucao.includes(cfop)) {
    return 'DEVOLUÇÃO DE VENDA';
  } else if (cfopVenda.includes(cfop) || cfopVendaConsignacao.includes(cfop)) {
    return 'VENDA';
  } else if (cfopConsignacao.includes(cfop)) {
    return 'CONSIGNAÇÃO';
  } else if (cfopCompraConsignacao.includes(cfop)) {
    return 'COMPRA DEFINITIVA';
  } else if (cfopDevolucaoConsignacao.includes(cfop)) {
    return 'DEVOLUÇÃO DE CONSIGNAÇÃO';
  } else if (cfopDevolucaoCompra.includes(cfop)) {
    return 'DEVOLUÇÃO DE COMPRA';
  } else if (cfopDevolucaoDemonstracao.includes(cfop)) {
    return 'DEVOLUÇÃO DEMONSTRAÇÃO';
  } else if (cfopDevolucaoSimbolica.includes(cfop)) {
    return 'DEVOLUÇÃO SIMBÓLICA';
  }
  return '';
}

export function pegaMes(mes) {
  return {
    1: 'Janeiro',
    2: 'Fevereiro',
    3: 'Março',
    4: 'Abril',
    5: 'Maio',
    6: 'Junho',
    7: 'Julho',
    8: 'Agosto',
    9: 'Setembro',
    10: 'Outubro',
    11: 'Novembro',
    12: 'Dezembro',
  }[mes];
}

export function cnpjMask(cnpj, tirar) {
  const strCnpj = String(cnpj);

  if (tirar && strCnpj.length === 18) {
    return strCnpj.replace(/\./g, '').replace(/-/g, '').replace(/\//g, '');
  }

  if (strCnpj.length !== 14) {
    return '';
  }

  return `${strCnpj.slice(0, 2)}.${strCnpj.slice(2, 5)}.${strCnpj.slice(5, 8)}/${strCnpj.slice(8, 12)}-${strCnpj.slice(12, 14)}`;
}

export function mesInicioFim(mes, ano) {
  const inicio = new Date(ano, parseInt(mes, 10) - 1);
  const fim = new Date(new Date(ano, parseInt(mes, 10)) - 1);

  return {
    inicio, fim,
  };
}

export function eDoMes(movOuServPool, { mes, ano }) {
  if (!movOuServPool.movimento && !movOuServPool.servico) return false;

  const { dataHora } = movOuServPool.movimento ? movOuServPool.movimento : movOuServPool.servico;

  const data = moment.utc(dataHora);
  const dataAno = parseInt(data.format('YYYY'), 10);
  const dataMes = parseInt(data.format('MM'), 10);

  return parseInt(mes, 10) === dataMes && parseInt(ano, 10) === dataAno;
}

export function calcularCotas(props) {
  const { trimestreData } = props.dados;
  const trimestre = trimestreData.trim.totalSomaPool;

  const valorIr = (trimestre.impostoPool.imposto.irpj - trimestre.retencao.irpj) +
    trimestre.impostoPool.imposto.adicionalIr;
  const valorCsll = trimestre.impostoPool.imposto.csll - trimestre.retencao.csll;

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

export function temTabelaCotas({ formaPagamento }, { mes }) {
  return formaPagamento === 'PAGAMENTO EM COTAS'
    && parseInt(mes, 10) % 3 === 0;
}
