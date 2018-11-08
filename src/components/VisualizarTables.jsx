import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';
import { MovimentosTable, ServicosTable, GuiasTable, AcumuladosTable, CotasTable } from '.';

import './VisualizarTables.css';

function temTabelaCotas({ formaPagamento, mes }) {
  return formaPagamento === 'PAGAMENTO EM COTAS' &&
    parseInt(mes, 10) % 3 === 0;
}

class VisualizarTables extends Component {
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

    return (
      this.props.show
      &&
      <Fragment>
        <div className="steps-content-tables">
          {
            dados.movimentos.length !== 0
            &&
            <Fragment>
              <Divider orientation="left">Movimentos</Divider>
              <MovimentosTable
                movimentos={dados.movimentos}
                notas={dados.notas}
                trimestre={dados.trimestre}
                complementares={dados.complementares}
                onChange={this.movimentosHandleChange}
              />
            </Fragment>
          }
          {
            dados.servicos.length !== 0
            &&
            <Fragment>
              <Divider orientation="left">Serviços</Divider>
              <ServicosTable
                servicos={dados.servicos}
                onChange={this.servicosHandleChange}
              />
            </Fragment>
          }
          <Fragment>
            <Divider orientation="left">Guias</Divider>
            <GuiasTable
              dados={dados}
              onChange={this.guiasHandleChange}
            />
          </Fragment>
          <Fragment>
            <Divider orientation="left">Acumulados</Divider>
            <AcumuladosTable
              dados={dados}
            />
          </Fragment>
          {
            temTabelaCotas(complementares)
            &&
            <Fragment>
              <Divider orientation="left">Cotas</Divider>
              <CotasTable
                dados={dados}
              />
            </Fragment>
          }
        </div>
      </Fragment>
    );
  }
}

export default VisualizarTables;
