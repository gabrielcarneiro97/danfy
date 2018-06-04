import * as React from 'react';
import { Form, Icon, Input, Button } from 'antd';
import propTypes from 'prop-types';

import { loginGoogle } from '../services';

import './LoginForm.css';

const FormItem = Form.Item;

class LoginFormInternal extends React.Component {
  static propTypes = {
    history: propTypes.shape({
      push: propTypes.func,
      location: propTypes.object,
    }).isRequired,
    form: propTypes.shape({
      getFieldDecorator: propTypes.func,
      validateFields: propTypes.func,
    }).isRequired,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { from } = this.props.history.location.state || { from: { pathname: '/app' } };

    const handleBtnGoogle = () => {
      loginGoogle({}).then((user) => {
        console.log(user);
        this.props.history.push(from);
      }).catch((err) => {
        console.error(err);
      });
    };

    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem />
        <FormItem>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Por favor insira seu login!' }],
          })(<Input disabled prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Login" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Por favor insira sua senha!' }],
          })(<Input disabled prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Senha" />)}
        </FormItem>
        <FormItem className="center-text">
          <Button disabled type="primary" htmlType="submit" className="login-form-button">
            Entrar
          </Button>
          <Button className="login-form-button" onClick={handleBtnGoogle}>
            <Icon type="google" /> Entrar com Google
          </Button>
          {/* <a>Registre-se!</a> */}
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(LoginFormInternal);
