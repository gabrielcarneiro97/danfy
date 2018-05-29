import { pegarEmpresaImpostos, pegarMovimentoNotaFinal } from './index';

export function calcularImpostosServico(notaServico, callback) {
  pegarEmpresaImpostos(notaServico.emitente, (err, aliquotas) => {
    if (err) {
      console.error(err);
    } else if (aliquotas.tributacao !== 'SN') {
      const valores = {};

      valores.servico = notaServico.geral.status === 'NORMAL' ? notaServico.valor.servico : 0;

      const baseDeCalculo = notaServico.geral.status === 'NORMAL' ? notaServico.valor.baseDeCalculo : 0;

      const { retencoes } = notaServico.valor;
      const iss = notaServico.valor.iss ?
        notaServico.valor.iss.valor :
        (baseDeCalculo * aliquotas.iss);
      const aliquotaIr = 0.048;
      const aliquotaCsll = 0.0288;

      valores.impostos = {
        baseDeCalculo,
        retencoes: {
          iss: notaServico.geral.status === 'NORMAL' ? retencoes.iss : 0,
          pis: notaServico.geral.status === 'NORMAL' ? retencoes.pis : 0,
          cofins: notaServico.geral.status === 'NORMAL' ? retencoes.cofins : 0,
          csll: notaServico.geral.status === 'NORMAL' ? retencoes.csll : 0,
          irpj: notaServico.geral.status === 'NORMAL' ? retencoes.irpj : 0,
          total: notaServico.geral.status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0,
        },
        iss: notaServico.geral.status === 'NORMAL' ? iss : 0,
        pis: (baseDeCalculo * aliquotas.pis),
        cofins: (baseDeCalculo * aliquotas.cofins),
        csll: (baseDeCalculo * aliquotaCsll),
        irpj: (baseDeCalculo * aliquotaIr),
        total: notaServico.geral.status === 'NORMAL' ? (parseFloat(iss) + (baseDeCalculo * aliquotaIr) + (baseDeCalculo * aliquotas.pis) + (baseDeCalculo * aliquotas.cofins) + (baseDeCalculo * aliquotaCsll)) : 0,
      };

      callback(null, valores);
    } else {
      const valores = {};

      valores.servico = notaServico.geral.status === 'NORMAL' ? notaServico.valor.servico : 0;

      const baseDeCalculo = notaServico.geral.status === 'NORMAL' ? notaServico.valor.baseDeCalculo : 0;

      const { retencoes } = notaServico.valor;
      const aliquotaIss = notaServico.valor.iss ? (notaServico.valor.iss.aliquota ? parseFloat(notaServico.valor.iss.aliquota) : aliquotas.iss) : aliquotas.iss; // eslint-disable-line
      const iss = notaServico.valor.iss ? (notaServico.valor.iss.valor ? notaServico.valor.iss.valor : 0) : (baseDeCalculo * aliquotaIss); // eslint-disable-line

      valores.impostos = {
        baseDeCalculo,
        retencoes: {
          iss: notaServico.geral.status === 'NORMAL' ? retencoes.iss : 0,
          pis: notaServico.geral.status === 'NORMAL' ? retencoes.pis : 0,
          cofins: notaServico.geral.status === 'NORMAL' ? retencoes.cofins : 0,
          csll: notaServico.geral.status === 'NORMAL' ? retencoes.csll : 0,
          irpj: notaServico.geral.status === 'NORMAL' ? retencoes.irpj : 0,
          total: notaServico.geral.status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0,
        },
        iss: notaServico.geral.status === 'NORMAL' ? iss : 0,
        pis: 0,
        cofins: 0,
        csll: 0,
        irpj: 0,
        total: notaServico.geral.status === 'NORMAL' ? iss : 0,
      };
      callback(null, valores);
    }
  });
}

export function calcularImpostosMovimento(notaInicial, notaFinal, aliquotas, callback) {
  let valorSaida = parseFloat(notaFinal.valor.total);
  let lucro = parseFloat(notaFinal.valor.total)
    - parseFloat(notaInicial ? notaInicial.valor.total : 0);
  const { estadoGerador, estadoDestino, destinatarioContribuinte } = notaFinal.informacoesEstaduais;

  if (estadoGerador !== 'MG') {
    callback(new Error(`Estado informado não suportado! Estado: ${estadoGerador}`), null);
  }

  if (lucro < 0 && estadoGerador !== estadoDestino) {
    lucro = 0;
  }
  if ((lucro < 0 && notaFinal.geral.cfop !== '1202' && notaFinal.geral.cfop !== '2202') || (notaFinal.geral.cfop === '6918' || notaFinal.geral.cfop === '5918') || (notaFinal.geral.cfop === '6913' || notaFinal.geral.cfop === '5913')) {
    callback(null, {
      lucro: 0,
      valorSaida,
      impostos: {
        pis: 0,
        cofins: 0,
        csll: 0,
        irpj: 0,
        icms: {
          baseDeCalculo: 0,
          proprio: 0,
        },
        total: 0,
      },
    });
  } else {
    const proximoPasso = () => {
      const valores = {
        lucro,
        valorSaida,
        impostos: {
          pis: (lucro * aliquotas.pis),
          cofins: (lucro * aliquotas.cofins),
          csll: (lucro * aliquotas.csll),
          irpj: (lucro * aliquotas.irpj),
          total: ((lucro * aliquotas.irpj)
            + (lucro * aliquotas.pis)
            + (lucro * aliquotas.cofins)
            + (lucro * aliquotas.csll)),
        },
      };

      const icmsEstados = {
        SC: {
          externo: 0.12,
          interno: 0.12,
        },
        DF: {
          externo: 0.07,
          interno: 0.12,
        },
        MS: {
          externo: 0.07,
          interno: 0.17,
        },
        MT: {
          externo: 0.07,
          interno: 0.17,
        },
        SP: {
          externo: 0.12,
          interno: 0.18,
        },
        RJ: {
          externo: 0.12,
          interno: 0.18,
        },
        GO: {
          externo: 0.07,
          interno: 0.17,
        },
        RO: {
          externo: 0.07,
          interno: 0.175,
        },
        ES: {
          externo: 0.07,
          interno: 0.12,
        },
        AC: {
          externo: 0.07,
          interno: 0.17,
        },
        CE: {
          externo: 0.07,
          interno: 0.17,
        },
        PR: {
          externo: 0.12,
          interno: 0.18,
        },
        PI: {
          externo: 0.07,
          interno: 0.17,
        },
        PE: {
          externo: 0.12,
          interno: 0.18,
        },
        MA: {
          externo: 0.07,
          interno: 0.18,
        },
        PA: {
          externo: 0.07,
          interno: 0.17,
        },
        RN: {
          externo: 0.07,
          interno: 0.18,
        },
        BA: {
          externo: 0.07,
          interno: 0.18,
        },
        RS: {
          externo: 0.12,
          interno: 0.18,
        },
        TO: {
          externo: 0.07,
          interno: 0.18,
        },
      };

      const estadosSemReducao = ['RN', 'BA', 'RS', 'TO'];

      if (estadoGerador === estadoDestino) {
        valores.impostos.icms = {
          baseDeCalculo: (lucro * aliquotas.icms.reducao),
          proprio: (lucro * aliquotas.icms.reducao * aliquotas.icms.aliquota),
        };
        valores.impostos.total =
          (parseFloat(valores.impostos.total)
          + (lucro * aliquotas.icms.reducao
          * aliquotas.icms.aliquota));
      } else {
        if (destinatarioContribuinte === '2' || destinatarioContribuinte === '9') { // eslint-disable-line
          const composicaoDaBase = valorSaida / (1 - icmsEstados[estadoDestino].interno);
          const baseDeCalculo = 0.05 * composicaoDaBase;
          const baseDifal =
            estadosSemReducao.includes(estadoDestino) ?
              composicaoDaBase :
              baseDeCalculo;
          const proprio = baseDifal * icmsEstados[estadoDestino].externo;
          const difal = (baseDifal * icmsEstados[estadoDestino].interno) - proprio;

          valores.impostos.icms = {
            composicaoDaBase,
            baseDeCalculo,
            proprio,
            difal: {
              origem: (difal * 0.2),
              destino: (difal * 0.8),
            },
          };

          valores.impostos.total =
            (parseFloat(valores.impostos.total) + (difal * 0.8) + (difal * 0.2) + proprio);
        } else if (destinatarioContribuinte === '1') {
          const baseDeCalculo = 0.05 * valorSaida;
          const valor = baseDeCalculo * icmsEstados[estadoDestino].externo;

          valores.impostos.icms = {
            composicaoDaBase: null,
            difal: null,
            baseDeCalculo,
            proprio: valor,
          };

          valores.impostos.total = parseFloat(valores.impostos.total) + valor;
        }
      }

      callback(null, valores);
    };
    if (notaFinal.geral.cfop === '1202' || notaFinal.geral.cfop === '2202') {
      pegarMovimentoNotaFinal(
        notaFinal.emitente, notaInicial ? notaInicial.chave : notaInicial,
        (err, movimentoAnterior) => {
          if (err) {
            console.error(err);
          } else if (movimentoAnterior) {
            lucro = (-1) * movimentoAnterior.valores.lucro;
            valorSaida = 0;
            proximoPasso();
          } else {
            valorSaida = 0;
            proximoPasso();
          }
        },
      );
    } else {
      proximoPasso();
    }
  }
}

/**
* @function R$ recebe um número e converte em uma string com formatação numérica brasileira
*   @param {Number} valor número qualquer
*   @return {String} contém o valor na formatação numérica brasileira, substituindo '.' por ',' e colocando um '.' a cada três número antes da ','
**/
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
