import React from 'react';
import { Row, Col, message, Upload, Button, Icon } from 'antd';

import { api } from '../services';

let ended = 0;
let xmlArray = [];

const upProps = {
  name: 'file',
  action: `${api}/file`,
  accept: '.xml',
  headers: {
    authorization: 'authorization-text',
    'Access-Control-Allow-Origin': '*',
  },
  multiple: true,
  // beforeUpload: () => false,
  onChange(info) {
    if (info.file.status === 'done') {
      console.log(info.file.response);
      ended += 1;
    } else if (info.file.status === 'error') {
      message.error(`Arquivo: ${info.file.name} invalido!`);
      ended += 1;
    } else if (info.file.status === 'removed') {
      ended -= 1;
    }

    if (ended === info.fileList.length) {
      message.success('Todas as notas foram importadas!');
    }
  },
};

class ImportarNotas extends React.Component {
  state = {}

  render() {
    return (
      <Row type="flex" justify="center" align="middle">
        <Col span={12}>
          <Upload {...upProps}>
            <Button>
              <Icon type="upload" /> Click to Upload
            </Button>
          </Upload>
        </Col>
      </Row>
    );
  }
}

export default ImportarNotas;
