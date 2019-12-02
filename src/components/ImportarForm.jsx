import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Button,
  Row,
  Col,
} from 'antd';

import {
  pegarDominio,
  pegarPessoaId,
  cnpjMask,
} from '../services';

import Connect from '../store/Connect';
import {
  carregarDominio,
  carregarEmpresa,
} from '../store/importacao';

function ImportarForm(props) {
  const { store, dispatch, onSubmit } = props;
  const {
    dominio,
    empresa,
  } = store;
  const [num, setNum] = useState('');
  const [submit, setSubmit] = useState(false);
  const [disableNum, setDisableNum] = useState(true);
  const [acheiEmpresa, setAcheiEmpresa] = useState(false);

  const [cnpjInput, setCnpjInput] = useState('');
  const [nomeInput, setNomeInput] = useState('');

  useEffect(() => {
    pegarDominio().then((dominioRes) => {
      dispatch(carregarDominio(dominioRes));
      setDisableNum(false);
    });
  }, []);

  useEffect(() => {
    if (cnpjInput !== '') {
      setSubmit(true);
    } else setSubmit(false);
  }, [num, acheiEmpresa, cnpjInput]);

  const handleSubmit = async () => {
    const emp = {
      nome: nomeInput,
      cnpj: cnpjInput,
      numeroSistema: num,
    };

    dispatch(carregarEmpresa(emp));
    setSubmit(false);
    onSubmit();
  };

  const limparInputs = () => {
    setNomeInput('');
    setCnpjInput('');
    setAcheiEmpresa(false);
  };

  const handleNum = async (e) => {
    const numInput = e.target.value;
    setNum(numInput);

    const empresaSelected = dominio.find((o) => o.numero === numInput);
    if (empresaSelected) {
      const { cnpj } = empresaSelected;
      try {
        const pessoaPg = await pegarPessoaId(cnpj);


        setNomeInput(pessoaPg.nome);
        setCnpjInput(cnpj);

        setAcheiEmpresa(true);
      } catch (err) {
        limparInputs();
        console.error(err);
      }
    } else {
      limparInputs();
    }
  };

  return (
    <>
      <Row
        gutter={8}
        justify="center"
        type="flex"
        style={{
          marginBottom: '5%',
        }}
      >
        <Col span={4} className="form-input">
          <Input
            addonBefore="Número"
            onChange={handleNum}
            value={num}
            disabled={disableNum || !!empresa.cnpj}
          />
        </Col>
        <Col span={12} className="form-input">
          <Input addonBefore="Nome" value={nomeInput} disabled />
        </Col>
        <Col span={6} className="form-input">
          <Input addonBefore="CNPJ" value={cnpjMask(cnpjInput)} disabled />
        </Col>
        <Col
          className="form-input"
          span={2}
        >
          <Button type="primary" onClick={handleSubmit} disabled={!submit}>Selecionar</Button>
        </Col>
      </Row>
    </>
  );
}

ImportarForm.propTypes = {
  store: PropTypes.shape({
    dominio: PropTypes.array,
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
    competencia: PropTypes.shape({
      mes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      ano: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    trimestreData: PropTypes.object,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

ImportarForm.defaultProps = {
  onSubmit: () => true,
};

export default Connect(ImportarForm);
