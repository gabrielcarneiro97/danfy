import React from 'react';
import { Steps, Button, Icon } from 'antd';

import { EnviarArquivos, AdicionarEmpresa } from '.';
import './ImportarNotas.css';

const { Step } = Steps;

class ImportarNotas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      envio: false,
      notas: null,
    };
  }

  fimEnvio = (notas) => {
    this.setState({ notas }, () => {
      this.setState({ envio: this.state.notas.nfe.length > 0 || this.state.notas.nfse.length > 0 });
    });
  }

  steps = [
    {
      title: 'Enviar Arquivos',
      content: <EnviarArquivos onEnd={this.fimEnvio} />,
      icon: <Icon type="file-add" />,
    },
    {
      title: 'Conciliar Movimentos',
      content: 'Second-content',
      icon: <Icon type="check-square-o" />,
    },
  ];

  next = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  }
  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  render = () => {
    const { current } = this.state;
    return (
      <div>
        <AdicionarEmpresa />
        <Steps current={current}>
          {this.steps.map(item => <Step key={item.title} title={item.title} icon={item.icon} />)}
        </Steps>
        <div className="steps-action">
          {
            this.state.current < this.steps.length - 1
            &&
            <Button type="primary" onClick={() => this.next()} disabled={!this.state.envio}>Conciliar</Button>
          }
          {
            this.state.current === this.steps.length - 1
            &&
            <Button type="primary">Done</Button>
          }
        </div>
        <div className="steps-content">{this.steps[this.state.current].content}</div>
      </div>
    );
  }
}

export default ImportarNotas;
