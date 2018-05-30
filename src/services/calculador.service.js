export function R$(valp) {
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

export const cfopCompra = ['1102', '2102'];
export const cfopDevolucao = ['1202', '2202'];
export const cfopDevolucaoCompra = ['5202'];
export const cfopVenda = ['5102', '6102', '6108'];
export const cfopConsignacao = ['1917', '2917'];
export const cfopCompraConsignacao = ['1113'];
export const cfopVendaConsignacao = ['5115', '6115', '5114'];
export const cfopDevolucaoConsignacao = ['5918', '6918'];
export const cfopDevolucaoDemonstracao = ['6913', '5913'];

export function retornarTipo(cfop) {
  if (cfopCompra.includes(cfop)) {
    return 'COMPRA';;
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
  }
}
