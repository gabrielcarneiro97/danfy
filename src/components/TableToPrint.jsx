import React from 'react';

import './TableToPrint.css';

class TableToPrint extends React.Component {
  state = {}

  render() {
    const { columns, dataSource } = this.props;

    console.log(dataSource);

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
      Object.keys(element).forEach((key) => {
        const index = keyOrder.indexOf(key);
        dataRows[num][index] = <td key={`${element.key}-${key}`}>{element[key]}</td>;
      });
    });

    return (
      <table className="table-print">
        <thead>
          {(() => {
            const rows = [];
            headRows.forEach((row, id) => {
              let each = [];
              row.forEach((r) => {
                each.push(r.content);
              });
              rows.push(<tr key={`${id}-head-row`}>{each}</tr>);
            });
            return rows;
          })()}
        </thead>
        <tbody>
          {(() => {
            const rows = [];
            dataRows.forEach((row, id) => {
              rows.push(<tr key={`${id}-data-row`}>{row}</tr>);
            });
            return rows;
          })()}
        </tbody>
      </table>
    );
  }
}

export default TableToPrint;
