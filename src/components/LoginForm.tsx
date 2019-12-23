import React from 'react';
import { Form, Icon, Button } from 'antd';
import propTypes from 'prop-types';

import { loginGoogle } from '../services';

import './LoginForm.css';

const FormItem = Form.Item;


function LoginForm(props) {
  const { history } = props;

  const handleBtnGoogle = () => {
    const { from } = history.location.state || { from: { pathname: '/app' } };
    loginGoogle().then(() => {
      history.push(from);
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <Form className="login-form">
      <FormItem />
      <FormItem className="center-text">
        <Button className="login-form-button" onClick={handleBtnGoogle}>
          <Icon type="google" />
          Entrar com Google
        </Button>
      </FormItem>
    </Form>
  );
}

LoginForm.propTypes = {
  history: propTypes.shape({
    push: propTypes.func,
    location: propTypes.object,
  }).isRequired,
  form: propTypes.shape({
    getFieldDecorator: propTypes.func,
    validateFields: propTypes.func,
  }).isRequired,
};

export default Form.create()(LoginForm);
