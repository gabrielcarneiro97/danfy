import React from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, Row, Col } from 'antd';
import { MovimentosTable, ServicosTable, GuiasTable } from '.';

import './VisualizarTables.css';

const { Step } = Steps;


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

  constructor(props) {
    super(props);
    this.state = {
      current: 0,
    };
  }

  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  movimentosHandleChange = (movimentos) => {
    const { dados } = this.props;

    this.props.onChange({
      ...dados,
      movimentos,
    });
  }

  servicosHandleChange = (servicos) => {
    const { dados } = this.props;

    this.props.onChange({
      ...dados,
      servicos,
    });
  }

  defineContent = (current, dados) => {
    let content = '';
    console.log(dados);
    if (current === 0) {
      content = (
        <MovimentosTable
          movimentos={dados.movimentos}
          notas={dados.notas}
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
    }
    return content;
  }

  render() {
    const { dados } = this.props;
    const { current } = this.state;

    const content = this.defineContent(current, dados);

    const steps = [{
      title: 'Movimentos',
    }, {
      title: 'Serviços',
    }, {
      title: 'Guias',
    }, {
      title: 'Acumulados',
    }];

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
                onClick={() => this.prev()}
                disabled={current === 0}
              >
                Voltar
              </Button>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={() => this.next()}
                disabled={current === steps.length - 1}
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
