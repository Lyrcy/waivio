import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import UserAccuracyChart from '../UserAccuracyChart/UserAccuracyChart';
import UserProfitability from '../UserProfitability/UserProfitability';
import './UserStatisticContainer.less';

const UserStatisticContainer = ({ intl, contentType, accuracy }) => (
  <div className="UserStatisticContainer">
    <div className="UserStatisticContainer__title">
      {contentType === 'forecast'
        ? intl.formatMessage({
            id: 'user_statistics_forecast_accuracy',
            defaultMessage: 'Forecast accuracy',
          })
        : intl.formatMessage({
            id: 'user_statistics_profitability_per_post',
            defaultMessage: 'Profitability per post',
          })}
    </div>
    <div className="UserStatisticContainer__period">
      <div className="UserStatisticContainer__period-item">
        {contentType === 'forecast' ? (
          <UserAccuracyChart statisticsData={accuracy.d1} />
        ) : (
          <UserProfitability statisticsData={accuracy.d1} />
        )}
        <div className="UserStatisticContainer__period-item-value">
          {intl.formatMessage({
            id: 'user_statistics_per_day',
            defaultMessage: 'Per day',
          })}
        </div>
      </div>
      <div className="UserStatisticContainer__period-item border">
        {contentType === 'forecast' ? (
          <UserAccuracyChart statisticsData={accuracy.d7} />
        ) : (
          <UserProfitability statisticsData={accuracy.d7} />
        )}
        <div className="UserStatisticContainer__period-item-value">
          {intl.formatMessage({
            id: 'user_statistics_per_week',
            defaultMessage: 'Per week',
          })}
        </div>
      </div>
      <div className="UserStatisticContainer__period-item border">
        {contentType === 'forecast' ? (
          <UserAccuracyChart statisticsData={accuracy.m1} />
        ) : (
          <UserProfitability statisticsData={accuracy.m1} />
        )}
        <div className="UserStatisticContainer__period-item-value">
          {intl.formatMessage({
            id: 'user_statistics_per_month',
            defaultMessage: 'Per month',
          })}
        </div>
      </div>
      <div className="UserStatisticContainer__period-item border">
        {contentType === 'forecast' ? (
          <UserAccuracyChart statisticsData={accuracy.m12} />
        ) : (
          <UserProfitability statisticsData={accuracy.m12} />
        )}
        <div className="UserStatisticContainer__period-item-value">
          {intl.formatMessage({
            id: 'user_statistics_per_year',
            defaultMessage: 'Per year',
          })}
        </div>
      </div>
    </div>
  </div>
);

UserStatisticContainer.propTypes = {
  intl: PropTypes.shape().isRequired,
  contentType: PropTypes.string.isRequired,
  accuracy: PropTypes.shape().isRequired,
};

export default injectIntl(UserStatisticContainer);