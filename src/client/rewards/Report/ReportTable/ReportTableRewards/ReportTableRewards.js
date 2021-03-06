import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { map, filter, find, get } from 'lodash';
import { useSelector } from 'react-redux';
import ReportTableRewardsRow from '../ReportTableRewards/ReportTableRewardsRow';
import ReportTableRewardsRowTotal from './ReportTableRewardsRowTotal';
import { getSingleReportData } from '../../../../reducers';
import './ReportTableRewards.less';

const ReportTableRewards = ({ intl }) => {
  const singleReportData = useSelector(getSingleReportData);
  const filteredHistory = filter(
    singleReportData.histories,
    obj => obj.type === 'review' || obj.type === 'beneficiary_fee',
  );

  const beneficiaries = map(filteredHistory, obj => {
    const userName = get(obj, ['userName']);
    const benef = get(obj, ['details', 'beneficiaries']);
    const account = find(benef, ['account', userName]);
    const totalWeight = benef.reduce((sum, item) => sum + item.weight, 0);

    return {
      account: get(obj, ['userName']) || '',
      weight: account ? account.weight / 100 : (10000 - totalWeight) / 100,
      votesAmount: get(obj, ['details', 'votesAmount']) || null,
      amount: get(obj, ['amount']) || null,
      payableInDollars: get(obj, ['details', 'payableInDollars']) || null,
    };
  });

  const totalUSD = Number(
    map(beneficiaries, benef => benef.payableInDollars).reduce((sum, usd) => sum + usd, 0),
  );
  const totalVotesAmount = map(beneficiaries, benef => benef.votesAmount).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const totalAmount = map(beneficiaries, benef => benef.amount).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const totalHive = Number(totalVotesAmount + totalAmount);

  return (
    <React.Fragment>
      <div className="ReportTableRewards__header">
        <span>{intl.formatMessage({ id: 'user_rewards', defaultMessage: 'User rewards:' })}</span>
      </div>
      <table className="ReportTableRewards">
        <thead>
          <tr>
            <th className="ReportTableRewards maxWidth" rowSpan="2">
              {intl.formatMessage({
                id: 'post_beneficiaries',
                defaultMessage: 'Post beneficiaries',
              })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({ id: 'shares', defaultMessage: `Shares` })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({ id: 'hive_power', defaultMessage: `Hive** Power` })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl
                .formatMessage({
                  id: 'hive',
                  defaultMessage: 'HIVE',
                })
                .toUpperCase()}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({
                id: 'total_hive)',
                defaultMessage: 'Total (HIVE)',
              })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({
                id: 'total_usd',
                defaultMessage: 'Total* (USD)',
              })}
            </th>
          </tr>
        </thead>
        <tbody>
          {map(beneficiaries, beneficiary => (
            <ReportTableRewardsRow key={beneficiary.account} {...beneficiary} />
          ))}
          <ReportTableRewardsRowTotal totalUSD={totalUSD} totalHive={totalHive} />
        </tbody>
      </table>
    </React.Fragment>
  );
};

ReportTableRewards.propTypes = {
  intl: PropTypes.shape().isRequired,
};

export default injectIntl(ReportTableRewards);
