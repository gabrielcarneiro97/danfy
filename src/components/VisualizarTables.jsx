import React from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';
import { MovimentosTable, ServicosTable, GuiasTable, AcumuladosTable, CotasTable } from '.';

import './VisualizarTables.css';

function temTabelaCotas({ formaPagamento, mes }) {
  return formaPagamento === 'PAGAMENTO EM COTAS' &&
    parseInt(mes, 10) % 3 === 0;
}

class VisualizarTables extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    dados: PropTypes.shape({
      movimentos: PropTypes.array,
      servicos: PropTypes.array,
      notas: PropTypes.object,
    }).isRequired,
  }

  static defaultProps = {
    show: true,
  }

  state = {}

  movimentosHandleChange = (infosMudadas) => {
    const { dados } = this.props;

    this.props.onChange({
      ...dados,
      ...infosMudadas,
    });
  }

  servicosHandleChange = (infosMudadas) => {
    const { dados } = this.props;

    this.props.onChange({
      ...dados,
      ...infosMudadas,
    });
  }

  guiasHandleChange = (infosMudadas) => {
    const { dados } = this.props;
    this.props.onChange({
      ...dados,
      ...infosMudadas,
    });
  }

  render() {
    const { dados } = this.props;
    const { complementares } = dados;
    let { current } = this.state;

    const steps = [{
      title: 'Movimentos',
    }, {
      title: 'Serviços',
    }, {
      title: 'Guias',
    }, {
      title: 'Acumulados',
    }];

    if (temTabelaCotas(complementares)) {
      steps.push({
        title: 'Cotas',
      });
    }

    if (current > steps.length - 1) {
      current = steps.length - 1;
    }

    return (
      this.props.show
      &&
      <div>
        <div className="steps-content-tables">
          {
            dados.movimentos.length !== 0
            &&
            <div>
              <Divider orientation="left">Movimentos</Divider>
              <MovimentosTable
                movimentos={dados.movimentos}
                notas={dados.notas}
                trimestre={dados.trimestre}
                complementares={dados.complementares}
                onChange={this.movimentosHandleChange}
              />
            </div>
          }
          {
            dados.servicos.length !== 0
            &&
            <div>
              <Divider orientation="left">Serviços</Divider>
              <ServicosTable
                servicos={dados.servicos}
                onChange={this.servicosHandleChange}
              />
            </div>
          }
          <div>
            <Divider orientation="left">Guias</Divider>
            <GuiasTable
              dados={dados}
              onChange={this.guiasHandleChange}
            />
          </div>
          <div>
            <Divider orientation="left">Acumulados</Divider>
            <AcumuladosTable
              dados={dados}
            />
          </div>
          {
            temTabelaCotas(complementares)
            &&
            <div>
              <Divider orientation="left">Cotas</Divider>
              <CotasTable
                dados={dados}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

export default VisualizarTables;
