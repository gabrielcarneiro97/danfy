import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class MovimentoValorInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    movimentoPoolWithKey: PropTypes.object.isRequired, // eslint-disable-line
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
    name: PropTypes.string,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    name: '',
    disabled: false,
  }

  state = {
    value: this.props.value,
    name: this.props.name,
    disabled: this.props.disabled,
  };

  handleChange = (e) => {
    const { value } = e.target;

    this.props.onChange(value, this.state.name, this.props.movimentoPoolWithKey);
    this.setState({ value });
  }

  render() {
    return (<Input
      value={this.state.value}
      onChange={this.handleChange}
      disabled={this.state.disabled}
      size="small"
    />);
  }
}

export default MovimentoValorInput;
