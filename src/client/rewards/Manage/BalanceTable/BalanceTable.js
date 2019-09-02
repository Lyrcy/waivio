import React from 'react';
import PropTypes from 'prop-types';
import './BalanceTable.less';

const BalanceTable = props => {
  const { intl, budgetTotal } = props;
  return (
    <table className="BalanceTable">
      <thead>
        <tr>
          <th>{intl.formatMessage({ id: 'balance', defaultMessage: `Balance` })}</th>
          <th>{intl.formatMessage({ id: 'payable', defaultMessage: `Payable` })}*</th>
          <th>{intl.formatMessage({ id: 'reserved', defaultMessage: `Reserved` })}</th>
          <th>{intl.formatMessage({ id: 'remaining', defaultMessage: `Remaining` })}**</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{budgetTotal.sum_budget}</td>
          <td>{budgetTotal.sum_payable}</td>
          <td>{budgetTotal.sum_reserved}</td>
          <td>{budgetTotal.remaining}</td>
        </tr>
      </tbody>
    </table>
  );
};

BalanceTable.propTypes = {
  budgetTotal: PropTypes.shape(),
  intl: PropTypes.shape(),
};

BalanceTable.defaultProps = {
  budgetTotal: {},
  intl: {},
};

export default BalanceTable;
