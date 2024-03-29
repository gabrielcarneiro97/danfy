import React from 'react';
import moment from 'moment';
import 'moment-timezone';
import {
  Empresa, Competencia, MesesNum, TrimestreData, Cota, MovimentoPool, ServicoPool, ValorTributavel, Investimentos, ImpostosInvestimentos, TotalSomaPool, Aliquotas,
} from '../types';


export function R$(valp : number | string) : string {
  if (!valp) return '0,00';
  let valor = valp.toString();
  valor = valor.replace(/,/g, '.');
  valor = parseFloat(valor).toFixed(2);

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

export function floating(stringVal?: string) : number {
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

export function somaTotalServico(servico : any, total : any) : any {
  let retorno = { ...total };
  if (!total) {
    retorno = {
      key: 'total-servicos',
      grupoId: '',
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

  Object.keys(retorno).forEach((key : string) => {
    if (key !== 'nota'
      && key !== 'status'
      && key !== 'key'
      && key !== 'data'
      && key !== 'grupoId') {
      retorno[key] = R$(floating(retorno[key]) + floating(servico[key]));
    }
  });

  return retorno;
}

export function somaTotalMovimento(movimento : any, total : any) : any {
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
      basePisCofins: 0,
      pis: 0,
      cofins: 0,
      csll: 0,
      irpj: 0,
      total: 0,
    };
  }
  Object.keys(retorno).forEach((key) => {
    if (key !== 'editar'
      && key !== 'numero'
      && key !== 'key'
      && key !== 'tipoMovimento'
      && key !== 'valorInicial'
      && key !== 'valorFinal') {
      retorno[key] = R$(floating(retorno[key]) + floating(movimento[key]));
    } else if ((key === 'valorInicial' || key === 'valorFinal') && movimento.tipoMovimento !== 'DEVOLUÇÃO DE VENDA') {
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
export const cfopRemessa = ['5917'];
export const cfopCompraConsignacao = ['1113'];
export const cfopVendaConsignacao = ['5115', '6115', '5114'];
export const cfopDevolucaoConsignacao = ['5918', '6918'];
export const cfopDevolucaoDemonstracao = ['6913', '5913'];
export const cfopDevolucaoSimbolica = ['5919', '6919'];

export function retornarTipo(cfop : string | number) : string {
  const cfopStr = cfop.toString();

  if (cfopCompra.includes(cfopStr)) {
    return 'COMPRA';
  } if (cfopDevolucao.includes(cfopStr)) {
    return 'DEVOLUÇÃO DE VENDA';
  } if (cfopVenda.includes(cfopStr) || cfopVendaConsignacao.includes(cfopStr)) {
    return 'VENDA';
  } if (cfopConsignacao.includes(cfopStr)) {
    return 'CONSIGNAÇÃO';
  } if (cfopRemessa.includes(cfopStr)) {
    return 'REMESSA';
  } if (cfopCompraConsignacao.includes(cfopStr)) {
    return 'COMPRA DEFINITIVA';
  } if (cfopDevolucaoConsignacao.includes(cfopStr)) {
    return 'DEVOLUÇÃO DE CONSIGNAÇÃO';
  } if (cfopDevolucaoCompra.includes(cfopStr)) {
    return 'DEVOLUÇÃO DE COMPRA';
  } if (cfopDevolucaoDemonstracao.includes(cfopStr)) {
    return 'DEVOLUÇÃO DEMONSTRAÇÃO';
  } if (cfopDevolucaoSimbolica.includes(cfopStr)) {
    return 'DEVOLUÇÃO SIMBÓLICA';
  }
  return '';
}

export function pegaMes(mes : MesesNum) : string {
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

export function cnpjMask(cnpj : string, tirar? : boolean) : string {
  const strCnpj = String(cnpj);

  if (tirar && strCnpj.length === 18) {
    return strCnpj.replace(/\./g, '').replace(/-/g, '').replace(/\//g, '');
  }

  if (strCnpj.length !== 14) {
    return cnpj;
  }

  return `${strCnpj.slice(0, 2)}.${strCnpj.slice(2, 5)}.${strCnpj.slice(5, 8)}/${strCnpj.slice(8, 12)}-${strCnpj.slice(12, 14)}`;
}

export function mesInicioFim(mes : number | string,
  ano : number | string) : { inicio : Date; fim : Date } {
  const inicio = new Date(parseInt(ano.toString(), 10), parseInt(mes.toString(), 10) - 1);
  const fim = new Date(
    new Date(parseInt(ano.toString(), 10), parseInt(mes.toString(), 10)).getTime() - 1,
  );

  return {
    inicio, fim,
  };
}

export function eDoMes(movOuServPool : MovimentoPool | ServicoPool,
  competencia? : Competencia) : boolean {
  if (!competencia) return false;

  const { mes, ano } = competencia;

  if (!(movOuServPool as MovimentoPool).movimento && !(movOuServPool as ServicoPool).servico) {
    return false;
  }

  const { dataHora } = (movOuServPool as MovimentoPool).movimento
    ? (movOuServPool as MovimentoPool).movimento : (movOuServPool as ServicoPool).servico;

  const data = moment.utc(dataHora);
  const dataAno = parseInt(data.format('YYYY'), 10);
  const dataMes = parseInt(data.format('MM'), 10);

  return parseInt(mes, 10) === dataMes && parseInt(ano, 10) === dataAno;
}

export function calcularAdicionalIr(
  adicionalIrDefault: number,
  impostosInvestimentos: ImpostosInvestimentos,
  aliquotaIr: number,
  trimestre: TotalSomaPool
): number {
  var adicionalIr = adicionalIrDefault;
  if (floating(impostosInvestimentos.valorTotal) > 0) {
    const baseMovimento = aliquotaIr === 0.012 ? 0.08 : 0.32;
    const montante = trimestre.totalSoma.valorMovimento * baseMovimento + trimestre.totalSoma.valorServico * 0.32 + floating(impostosInvestimentos.valorTotal);
    if (montante > 60000) {
      adicionalIr = (montante - 60000) * 0.1;
    }
  }
  return adicionalIr;
}

export function calcularCotas(
  trimestreData : TrimestreData, investimentos? : Investimentos, aliquotas? : Aliquotas
) : { cotaCsll : Cota; cotaIr : Cota } {
  if (!trimestreData.trim) {
    return { cotaCsll: { valor: 0, numero: 0 }, cotaIr: { valor: 0, numero: 0 } };
  }

  var aliquotaIr = 0;
  if (aliquotas) {
    aliquotaIr = aliquotas.irpj;
  }

  const impostosInvestimentos = calcularImpostosInvestimentos(investimentos);
  const trimestre = trimestreData.trim.totalSomaPool;
  var adicionalIr = calcularAdicionalIr(trimestre.impostoPool.imposto.adicionalIr, impostosInvestimentos, aliquotaIr, trimestre);

  const valorIr = (trimestre.impostoPool.imposto.irpj - (trimestre.retencao.irpj || 0)) + floating(impostosInvestimentos.irpjTotal) + adicionalIr;
  const valorCsll = trimestre.impostoPool.imposto.csll - (trimestre.retencao.csll || 0) + floating(impostosInvestimentos.csllTotal);

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

export function temTabelaCotas(empresa?: Empresa, competencia?: Competencia) : boolean {
  if (!empresa || !competencia) return false;
  const { formaPagamento } = empresa;
  const { mes } = competencia;
  return formaPagamento === 'LUCRO PRESUMIDO - PAGAMENTO EM COTAS'
    && parseInt(mes, 10) % 3 === 0;
}

export function dateToComp(date : Date) : Competencia {
  const d = new Date(date);

  return { mes: (d.getMonth() + 1).toString(), ano: d.getFullYear().toString() };
}

export function compToDate(comp : Competencia) : Date {
  return new Date(parseInt(comp.ano, 10), parseInt(comp.mes, 10) - 1);
}

export function calcularImposto(valor: number, retencao: number) : ValorTributavel {
  return {
    valor: R$(valor),
    irpj: R$((valor * 0.15) - retencao),
    csll: R$(valor * 0.09),
  }
}

export function calcularImpostosInvestimentos(investimentos?: Investimentos) : ImpostosInvestimentos {
  if (!investimentos) {
    investimentos = {
      owner: '',
      year: 0,
      month: 0,
      income: 0,
      fees_discounts: 0,
      capital_gain: 0,
      retention: 0,
    }
  }
  const retencao = investimentos?.retention || 0;
  const rendimentos = calcularImposto(investimentos?.income || 0, retencao);
  const jurosDescontos = calcularImposto(investimentos?.fees_discounts || 0, 0);
  const ganhoCapital = calcularImposto(investimentos?.capital_gain || 0, 0);
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
