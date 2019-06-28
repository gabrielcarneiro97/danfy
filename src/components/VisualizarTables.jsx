import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';
import { MovimentosTable, ServicosTable, GuiasTable, AcumuladosTable, CotasTable } from '.';
import { mesInicioFim, eDoMes, temTabelaCotas } from '../services';

import './VisualizarTables.css';

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

  render() {
    const { dados } = this.props;
    const {
      complementares,
      trimestreData,
      notasPool,
      notasServicoPool,
    } = dados;
    const { mes, ano } = complementares;
    const { movimentosPool, servicosPool, trim } = trimestreData;

    const mesTimes = mesInicioFim(mes, ano);

    const movimentosPoolMes = movimentosPool.filter(mP => eDoMes(mP, mesTimes));
    const servicosPoolMes = servicosPool.filter(sP => eDoMes(sP, mesTimes));

    return (
      this.props.show
      &&
      <Fragment>
        <div className="steps-content-tables">
          {
            movimentosPoolMes.length !== 0
            &&
            <Fragment>
              <Divider orientation="left">Movimentos</Divider>
              <MovimentosTable
                movimentosPool={movimentosPoolMes}
                notasPool={notasPool}
                trim={trim}
                complementares={complementares}
                onChange={this.movimentosHandleChange}
              />
            </Fragment>
          }
          {
            servicosPoolMes.length !== 0
            &&
            <Fragment>
              <Divider orientation="left">Serviços</Divider>
              <ServicosTable
                servicosPoolMes={servicosPoolMes}
                notasServicoPool={notasServicoPool}
                onChange={this.servicosHandleChange}
              />
            </Fragment>
          }

          <Fragment>
            <Divider orientation="left">Guias</Divider>
            <GuiasTable
              dados={dados}
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
