import React from 'react';
import moment from 'moment';
import './TableToPrint.css';

type propTypes = {
  showHead? : boolean;
  columns : any[];
  dataSource : any[];
}

function TableToPrint(props : propTypes) : JSX.Element {
  const { columns, dataSource, showHead = true } = props;

  if (dataSource.length === 0) {
    return <div />;
  }

  const headRows : any[] = [];
  const keyOrder : any[] = [];
  headRows[0] = [];
  headRows[1] = [];
  const dataRows : any[] = [];

  columns.forEach((el) => {
    if (el.children) {
      headRows[0].push({
        hasChildren: true,
        key: el.title,
        content: <th key={el.title} colSpan={el.children.length}>{el.title}</th>,
      });
      el.children.forEach((child : any) => {
        keyOrder.push(child.key);
        headRows[1].push({
          key: child.key,
          content: <th key={child.key}>{child.title}</th>,
        });
      });
    } else if (el.key !== 'editar' && el.key !== 'id') {
      keyOrder.push(el.key);
      headRows[0].push({
        key: el.key,
        content: <th key={el.key} rowSpan={2}>{el.title}</th>,
      });
    }
  });

  dataSource.forEach((element, num) => {
    dataRows[num] = [];
    if (element) {
      Object.keys(element).forEach((key) => {
        const index = keyOrder.indexOf(key);
        dataRows[num][index] = (
          <td
            key={`${element.key}-${key}`}
            style={{
              backgroundColor: element.cor,
              fontWeight: element.fontWeight || (columns[index] && columns[index].fontWeight),
            }}
          >
            {moment.isMoment(element[key]) ? element[key].format('DD/MM/YYYY') : element[key]}
          </td>
        );
      });
    }
  });

  return (
    <table className="table-print">
      {
        showHead
        && (
          <thead>
            {(() : any => {
              const rows : any[] = [];
              headRows.forEach((row, id) => {
                const each : any[] = [];
                row.forEach((r : any) => {
                  each.push(r.content);
                });
                rows.push(<tr key={`${id}-head-row`}>{each}</tr>); // eslint-disable-line
              });
              return rows;
            })()}
          </thead>
        )
      }
      <tbody>
        {(() : any => {
          const rows : any[] = [];
          dataRows.forEach((row, id) => {
            rows.push(<tr key={`${id}-data-row`}>{row}</tr>); // eslint-disable-line
          });
          return rows;
        })()}
      </tbody>
    </table>
  );
}

export default TableToPrint;
