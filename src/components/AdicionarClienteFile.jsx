import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Upload,
  Button,
  message,
} from 'antd';

import { api } from '../services';

function AdicionarClienteFile(props) {
  const { onData, disabled } = props;

  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const loading = () => {
    setBtnLoading(true);
    setBtnDisabled(true);
  };

  const loadingEnd = () => {
    setBtnLoading(false);
    setBtnDisabled(false);
  };

  const uploadChange = async (info) => {
    const data = info.file.response;

    if (info.file.status === 'done') {
      onData(data);
      loadingEnd();
      message.success(`Arquivo: ${info.file.name} aceito!`);
    } else if (info.file.status === 'error') {
      loadingEnd();
      message.error(`Arquivo: ${info.file.name} invalido!`);
    }
  };

  return (
    <Upload
      name="file"
      action={`${api}/file`}
      accept=".xml"
      showUploadList={false}
      headers={{
        authorization: 'authorization-text',
        'Access-Control-Allow-Origin': '*',
      }}
      onChange={uploadChange}
      beforeUpload={loading}
    >
      <Button
        disabled={btnDisabled || disabled}
        loading={btnLoading}
        icon="file-text"
        type="primary"
      >
        Selecionar XML
      </Button>
    </Upload>
  );
}

AdicionarClienteFile.propTypes = {
  onData: PropTypes.func,
  disabled: PropTypes.bool,
};

AdicionarClienteFile.defaultProps = {
  onData: () => false,
  disabled: false,
};

export default AdicionarClienteFile;
