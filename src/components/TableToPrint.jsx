import React from 'react';
import PropTypes from 'prop-types';
import './TableToPrint.css';

class TableToPrint extends React.Component {
  static propTypes = {
    columns: PropTypes.array, // eslint-disable-line
    dataSource: PropTypes.array, // eslint-disable-line
  }

  state = {}

  render() {
    const { columns, dataSource } = this.props;

    if (dataSource.length === 0) {
      return <div />;
    }

    const headRows = [];
    const keyOrder = [];
    headRows[0] = [];
    headRows[1] = [];
    const dataRows = [];

    columns.forEach((el) => {
      if (el.children) {
        headRows[0].push({
          hasChildren: true,
          key: el.title,
          content: <th key={el.title} colSpan={el.children.length}>{el.title}</th>,
        });
        el.children.forEach((child) => {
          keyOrder.push(child.key);
          headRows[1].push({
            key: child.key,
            content: <th key={child.key}>{child.title}</th>,
          });
        });
      } else if (el.key !== 'editar') {
        keyOrder.push(el.key);
        headRows[0].push({
          key: el.key,
          content: <th key={el.key} rowSpan="2">{el.title}</th>,
        });
      }
    });

    dataSource.forEach((element, num) => {
      dataRows[num] = [];
      if (element) {
        Object.keys(element).forEach((key) => {
          const index = keyOrder.indexOf(key);
          dataRows[num][index] = <td key={`${element.key}-${key}`}>{element[key]}</td>;
        });
      }
    });

    return (
      <table className="table-print">
        <thead>
          {(() => {
            const rows = [];
            headRows.forEach((row, id) => {
              const each = [];
              row.forEach((r) => {
                each.push(r.content);
              });
              rows.push(<tr key={`${id}-head-row`}>{each}</tr>); // eslint-disable-line
            });
            return rows;
          })()}
        </thead>
        <tbody>
          {(() => {
            const rows = [];
            dataRows.forEach((row, id) => {
              rows.push(<tr key={`${id}-data-row`}>{row}</tr>); // eslint-disable-line
            });
            return rows;
          })()}
        </tbody>
      </table>
    );
  }
}

export default TableToPrint;
