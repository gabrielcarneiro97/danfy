import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Row,
  Col,
} from 'antd';

import {
  cnpjMask,
} from '../services/calculador.service';

import {
  pegarDominio,
  pegarPessoaId,
} from '../services/api.service';

import { useStore, useDispatch } from '../store/Connect';
import {
  carregarDominio,
  carregarEmpresa,
} from '../store/importacao';

import { ImportacaoStore } from '../types';

type propTypes = {
  onSubmit? : Function;
}

function ImportarForm(props : propTypes) : JSX.Element {
  const store = useStore<ImportacaoStore>();
  const dispatch = useDispatch();

  const {
    onSubmit = () : boolean => true,
  } = props;
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

  const handleSubmit = async () : Promise<void> => {
    const emp = {
      nome: nomeInput,
      cnpj: cnpjInput,
      numeroSistema: num,
    };

    dispatch(carregarEmpresa(emp));
    setSubmit(false);
    onSubmit();
  };

  const limparInputs = () : void => {
    setNomeInput('');
    setCnpjInput('');
    setAcheiEmpresa(false);
  };

  const handleNum = async (e : React.ChangeEvent<HTMLInputElement>) : Promise<void> => {
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

export default ImportarForm;
