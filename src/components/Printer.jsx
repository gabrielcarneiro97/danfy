import React from 'react';
import PropTypes from 'prop-types';

import { R$, retornarTipo } from '../services';

class Printer extends React.Component {
  static propTypes = {
    dados: PropTypes.shape({
      movimentos: PropTypes.object,
      servicos: PropTypes.object,
      notas: PropTypes.object,
    }).isRequired,
  }

  state = {}

  defineTableMovimentos = () => {
    const { movimentos, notas } = this.props.dados;
    const printSource = [];

    Object.keys(movimentos).forEach((key) => {
      const movimento = movimentos[key];
      const notaFinal = notas[movimento.notaFinal];
      const notaInicial = notas[movimento.notaInicial];

      printSource.push({
        key,
        numero: notaFinal.geral.numero,
        valorInicial: R$(notaInicial.valor.total),
        valorFinal: R$(notaFinal.valor.total),
        tipoMovimento: retornarTipo(notaFinal.geral.cfop),
        lucro: R$(movimento.valores.lucro),
        baseIcms: R$(movimento.valores.impostos.icms.baseDeCalculo),
        icms: R$(movimento.valores.impostos.icms.proprio),
        difalOrigem: movimento.valores.impostos.icms.difal ?
          R$(movimento.valores.impostos.icms.difal.origem) :
          '0,00',
        difalDestino: movimento.valores.impostos.icms.difal ?
          R$(movimento.valores.impostos.icms.difal.destino) :
          '0,00',
        pis: R$(movimento.valores.impostos.pis),
        cofins: R$(movimento.valores.impostos.cofins),
        csll: R$(movimento.valores.impostos.csll),
        irpj: R$(movimento.valores.impostos.irpj),
        total: R$(movimento.valores.impostos.total),
      });
    });
    return printSource;
  }

  defineTableServicos = () => {
    const { servicos } = this.props.dados;
    const printSource = [];

    Object.keys(servicos).forEach((key) => {
      const servico = servicos[key];

      const numero = parseInt(servico.nota.substring(18), 10);

      printSource.push({
        key: servico.nota,
        nota: numero,
        status: servico.notaStatus,
        data: servico.data.toLocaleString('pt-br'),
        valorServico: R$(servico.valores.impostos.baseDeCalculo),
        issRetido: R$(servico.valores.impostos.retencoes.iss),
        pisRetido: R$(servico.valores.impostos.retencoes.pis),
        cofinsRetido: R$(servico.valores.impostos.retencoes.cofins),
        csllRetido: R$(servico.valores.impostos.retencoes.csll),
        irpjRetido: R$(servico.valores.impostos.retencoes.irpj),
        totalRetido: R$(servico.valores.impostos.retencoes.total),
        iss: R$(servico.valores.impostos.iss),
        pis: R$(servico.valores.impostos.pis),
        cofins: R$(servico.valores.impostos.cofins),
        csll: R$(servico.valores.impostos.csll),
        irpj: R$(servico.valores.impostos.irpj),
        total: R$(servico.valores.impostos.total),
      });
    });

    return printSource;
  }

  render() {
    const dataTableMovimentos = this.defineTableMovimentos();
    const dataTableServicos = this.defineTableServicos();

    // const printRef = React.createRef();

    /* <ReactToPrint
            trigger={() => <a href="#">Print this out!</a>}
            content={() => printRef}
          />
          <div style={{ display: 'none' }}>
            <TableToPrint
              dataSource={printSource}
              columns={MovimentosTable.columns}
              ref={(el) => { printRef = el; }}
            />
          </div> */

    return <div />;
  }
}

export default Printer;
