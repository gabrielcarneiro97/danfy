import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class MovimentoValorInput extends React.Component {

  static propTypes = {
    movimento: PropTypes.object.isRequired, // eslint-disable-line
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

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      name: props.name,
      disabled: props.disabled,
    };
  }

  handleChange = (e) => {
    const { value } = e.target;

    this.props.onChange(value, this.state.name, this.props.movimento);
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
