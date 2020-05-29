import { Checkbox } from 'antd';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import './RewardsFiltersPanel.less';

const RewardsFiltersPanel = ({
  sponsors,
  activeFilters,
  activePayableFilters,
  setFilterValue,
  campaignsTypes,
  setPayablesFilterValue,
  intl,
  location,
}) => {
  const filterLayout = (filterName, key, checked) => (
    <div key={`${key}-${filterName}`} className="RewardsFiltersPanel__item-wrap">
      <Checkbox onChange={() => setFilterValue(filterName, key)} checked={checked} />
      <div className="RewardsFiltersPanel__name">{filterName}</div>
    </div>
  );

  const filterPaymentLayout = (obj, checked) => (
    <div key={`${obj.filterName}`} className="RewardsFiltersPanel__item-wrap">
      <Checkbox onChange={() => setPayablesFilterValue(obj)} checked={checked} />
      <div className="RewardsFiltersPanel__name">
        {intl.formatMessage(
          { id: `filter_${obj.filterName}`, defaultMessage: obj.defaultMessage },
          { value: obj.value },
        )}
      </div>
    </div>
  );

  const payablesFilterData = [
    {
      filterName: 'days',
      value: location.pathname === '/rewards/payables' ? 15 : 30,
      defaultMessage: `Over {value} days`,
    },
    {
      filterName: 'payable',
      value: location.pathname === '/rewards/payables' ? 10 : 20,
      defaultMessage: `Over {value} HIVE`,
    },
  ];

  const campaignsTypesMessages = [
    {
      filterName: 'open',
      value: 'Open',
      defaultMessage: `{value} cases`,
    },
    {
      filterName: 'closed',
      value: 'Closed',
      defaultMessage: `{value} cases`,
    },
  ];

  const rewardsTypesMessages = ['Reserved', 'Completed', 'Released', 'Expired', 'Rejected'];

  return (
    <div className="RewardsFiltersPanel">
      <div className="RewardsFiltersPanel__container">
        <div className="RewardsFiltersPanel__title">
          <i className="iconfont icon-trysearchlist SidebarContentBlock__icon" />
          <FormattedMessage id="filter_rewards" defaultMessage="Filter rewards" />
        </div>
        {location.pathname !== '/rewards/payables' &&
        location.pathname !== '/rewards/receivables' &&
        location.pathname !== '/rewards/messages' ? (
          <React.Fragment>
            <div className="RewardsFiltersPanel__title-text">
              {`${intl.formatMessage({
                id: 'rewards_for',
                defaultMessage: `Rewards for`,
              })}:`}
            </div>
            {_.map(campaignsTypes, type =>
              filterLayout(type, 'types', _.includes(activeFilters.types, type)),
            )}
            <div className="RewardsFiltersPanel__title-text">
              {`${intl.formatMessage({
                id: 'sponsors',
                defaultMessage: `Sponsors`,
              })}:`}
            </div>
            {_.map(sponsors, sponsor =>
              filterLayout(sponsor, 'guideNames', _.includes(activeFilters.guideNames, sponsor)),
            )}
          </React.Fragment>
        ) : (
          location.pathname !== '/rewards/messages' && (
            <React.Fragment>
              <div className="RewardsFiltersPanel__title-text">
                {location.pathname === '/rewards/payables'
                  ? intl.formatMessage({
                      id: 'payables',
                      defaultMessage: 'Payables',
                    })
                  : intl.formatMessage({
                      id: 'sidenav_rewards_receivables',
                      defaultMessage: 'Receivables',
                    })}
              </div>
              {_.map(payablesFilterData, payable =>
                filterPaymentLayout(
                  payable,
                  activePayableFilters.some(f => f.filterName === payable.filterName),
                ),
              )}
            </React.Fragment>
          )
        )}
        {location.pathname === '/rewards/messages' && (
          <React.Fragment>
            <div className="RewardsFiltersPanel__title-text">
              {`${intl.formatMessage({
                id: 'case_status',
                defaultMessage: 'Case status',
              })}:`}
            </div>
            {_.map(campaignsTypesMessages, type =>
              filterPaymentLayout(
                type,
                activePayableFilters.some(f => f.filterName === type.filterName),
              ),
            )}
            <div className="RewardsFiltersPanel__title-text">
              {`${intl.formatMessage({
                id: 'mobnav_rewards',
                defaultMessage: `Rewards`,
              })}:`}
            </div>
            {_.map(rewardsTypesMessages, type =>
              filterLayout(type, 'types', _.includes(activeFilters.types, type)),
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

RewardsFiltersPanel.propTypes = {
  sponsors: PropTypes.arrayOf(PropTypes.string).isRequired,
  campaignsTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeFilters: PropTypes.shape().isRequired,
  intl: PropTypes.shape().isRequired,
  setFilterValue: PropTypes.func.isRequired,
  location: PropTypes.shape().isRequired,
  setPayablesFilterValue: PropTypes.func.isRequired,
  activePayableFilters: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

RewardsFiltersPanel.defaultProps = {
  sponsors: [],
  campaignsTypes: [],
  activeFilters: {},
};

export default injectIntl(RewardsFiltersPanel);
