import React, { useState } from 'react';
import {
  Upload,
  Button,
  message,
} from 'antd';
import { UploadChangeParam } from 'antd/lib/upload/interface';

import { api } from '../services/publics';

type propTypes = {
  onData?: Function;
  disabled?: boolean;
}

function AdicionarClienteFile(props : propTypes) : JSX.Element {
  const { onData = () : boolean => false, disabled = false } = props;

  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const loading = () : boolean => {
    setBtnLoading(true);
    setBtnDisabled(true);
    return true;
  };

  const loadingEnd = () : void => {
    setBtnLoading(false);
    setBtnDisabled(false);
  };

  const uploadChange = async (info : UploadChangeParam) : Promise<void> => {
    const data = info.file.response;

    if (info.file.status === 'done') {
      onData(data[0]);
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

export default AdicionarClienteFile;
