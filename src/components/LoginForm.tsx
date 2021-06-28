import React from 'react';
import { Form, Icon, Button } from 'antd';
import { useHistory } from 'react-router';

import { loginGoogle } from '../services/api.service';

import './LoginForm.css';

const FormItem = Form.Item;

function LoginForm() : JSX.Element {
  const history: any = useHistory();

  const handleBtnGoogle = () : void => {
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

export default Form.create()(LoginForm);
