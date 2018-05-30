import React from 'react';
import { Steps, Button, Row, Col } from 'antd';

import './VisualizarTables.css';

const { Step } = Steps;


class VisualizarTables extends React.Component {
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
  render() {
    const { current } = this.state;
    let content = '';

    console.log(this.props.dados);

    if (current === 0) {
      content = 'Poo';
    } else if (current === 1) {
      content = 'Second-content';
    } else if (current === 2) {
      content = 'Last-Content';
    }

    const steps = [{
      title: 'Movimentos',
    }, {
      title: 'Serviços',
    }, {
      title: 'Acumulado',
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
        <div className="steps-content">{content}</div>
      </div>
    );
  }
}

export default VisualizarTables;
