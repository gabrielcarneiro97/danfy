import React from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, Row, Col } from 'antd';
import { MovimentosTable, ServicosTable, GuiasTable, AcumuladosTable, CotasTable } from '.';

import './VisualizarTables.css';

const { Step } = Steps;

function temTabelaCotas({ formaPagamento, mes }) {
  return formaPagamento === 'PAGAMENTO EM COTAS' &&
    parseInt(mes, 10) % 3 === 0;
}

class VisualizarTables extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    dados: PropTypes.shape({
      movimentos: PropTypes.object,
      servicos: PropTypes.object,
      notas: PropTypes.object,
    }).isRequired,
  }

  static defaultProps = {
    show: true,
  }

  state = {
    current: 0,
  }

  next(current) {
    this.setState({ current: current + 1 });
  }
  prev(current) {
    this.setState({ current: current - 1 });
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

  defineContent = (current, dados) => {
    let content = '';
    if (current === 0) {
      content = (
        <MovimentosTable
          movimentos={dados.movimentos}
          notas={dados.notas}
          trimestre={dados.trimestre}
          complementares={dados.complementares}
          onChange={this.movimentosHandleChange}
        />
      );
    } else if (current === 1) {
      content = (
        <ServicosTable
          servicos={dados.servicos}
          notas={dados.notas}
          onChange={this.servicosHandleChange}
        />
      );
    } else if (current === 2) {
      content = (
        <GuiasTable
          dados={dados}
        />
      );
    } else if (current === 3) {
      content = (
        <AcumuladosTable
          dados={dados}
        />
      );
    } else if (current === 4) {
      content = (
        <CotasTable
          dados={dados}
        />
      );
    }
    return content;
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

    const content = this.defineContent(current, dados);

    return (
      this.props.show
      &&
      <div>
        <Steps progressDot current={current}>
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </Steps>
        <div className="steps-action">
          <Row>
            <Col span={12} style={{ textAlign: 'left' }}>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => this.prev(current)}
                disabled={current === 0}
              >
                Voltar
              </Button>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={() => this.next(current)}
                disabled={current >= steps.length - 1}
              >
                Próximo
              </Button>
            </Col>
          </Row>
        </div>
        <div className="steps-content-tables">{content}</div>
      </div>
    );
  }
}

export default VisualizarTables;
