import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { getLenders } from '../../../waivioApi/ApiClient';
import PayableCard from '../Payables/PayableCard/PayableCard';
import './Receivables.less';

const Receivables = ({ intl, userName, currentSteemDollarPrice, filterData }) => {
  const payableFilters = {};
  _.map(filterData, f => {
    payableFilters[`${f.filterName}`] = f.value;
  });
  const [sponsors, setSponsors] = useState({});
  useEffect(() => {
    getLenders({
      sponsor: '',
      user: userName,
      filters: payableFilters,
    })
      .then(data => setSponsors(data))
      .catch(e => console.log(e));
  }, [filterData]);
  return (
    <div className="Receivables">
      <div className="Receivables__main-title">
        {intl.formatMessage({
          id: 'receivables_page_payables',
          defaultMessage: 'Receivables',
        })}
      </div>
      <div className="Receivables__information-row">
        <div className="Receivables__information-row-total-title">
          {intl.formatMessage({
            id: 'receivables_page_total',
            defaultMessage: 'Total',
          })}
          : {sponsors && sponsors.payable && sponsors.payable.toFixed(2)}
          {' SBD '}
          {currentSteemDollarPrice
            ? `(US$ ${(currentSteemDollarPrice * sponsors.payable).toFixed(2)})`
            : ''}
        </div>
        <div className="Receivables__information-row-pay">
          <Link to={'/rewards/pay-all'}>
            {intl.formatMessage({
              id: 'receivables_page_pay_all',
              defaultMessage: 'Pay all',
            })}
            (mock)
          </Link>
        </div>
      </div>
      {_.map(sponsors.histories, sponsor => (
        <PayableCard
          key={sponsor.guideName}
          name={sponsor.guideName}
          payable={sponsor.payable}
          alias={sponsor.alias}
          path={`/rewards/receivables/@${sponsor.guideName}`}
        />
      ))}
    </div>
  );
};

Receivables.propTypes = {
  intl: PropTypes.shape().isRequired,
  currentSteemDollarPrice: PropTypes.number.isRequired,
  userName: PropTypes.string.isRequired,
  filterData: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default injectIntl(Receivables);
