/* global FileReader */
import React from 'react';
import { Row, Col, message, Upload, Button, Icon } from 'antd';

let ended = 0;

const upProps = {
  name: 'file',
  action: '//jsonplaceholder.typicode.com/posts/',
  accept: '.xml',
  headers: {
    authorization: 'authorization-text',
  },
  multiple: true,
  onChange(info) {
    if (info.file.status === 'done') {
      ended += 1;
      const read = new FileReader();
      // message.success(`${info.file.name} file uploaded successfully`);
      // console.log(info.file);
      read.readAsBinaryString(info.file.originFileObj);

      read.onloadend = () => {
        // console.log(read.result);
      };
    } else if (info.file.status === 'error') {
      ended += 1;
      message.error(`${info.file.name} file upload failed.`);
    }
    console.log(ended, info.fileList.length);
    if (ended === info.fileList.length) {
      console.log('cabo');
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
