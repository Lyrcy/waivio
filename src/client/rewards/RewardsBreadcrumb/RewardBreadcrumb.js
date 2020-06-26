import { isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Breadcrumb } from 'antd';
import classNames from 'classnames';
import { getFieldWithMaxWeight } from '../../object/wObjectHelper';
import '../Rewards.less';

const rewardText = {
  all: { id: 'all', defaultMessage: 'All' },
  active: { id: 'eligible', defaultMessage: 'Eligible' },
  reserved: { id: 'reserved', defaultMessage: 'Reserved' },
  history: { id: 'history', defaultMessage: 'History' },
  created: { id: 'created', defaultMessage: 'Created' },
};
const RewardBreadcrumb = ({ intl, filterKey, reqObject }) => {
  const isCorrectFilter = !!rewardText[filterKey];
  const objName = !isEmpty(reqObject) ? getFieldWithMaxWeight(reqObject, 'name') : null;
  const breadCrumbText = `${
    isCorrectFilter ? intl.formatMessage(rewardText[filterKey]) : ''
  } ${intl.formatMessage({
    id: 'rewards',
    defaultMessage: 'rewards',
  })}`;
  return (
    <div className={classNames('RewardBreadcrumb', { 'ml3 mb3': !isEmpty(reqObject) })}>
      <Breadcrumb separator={'>'}>
        {objName ? (
          <React.Fragment>
            <Breadcrumb.Item href={`/rewards/${filterKey}`}>{breadCrumbText}</Breadcrumb.Item>
            <Breadcrumb.Item>{objName}</Breadcrumb.Item>
          </React.Fragment>
        ) : (
          <Breadcrumb.Item>{breadCrumbText}</Breadcrumb.Item>
        )}
      </Breadcrumb>
    </div>
  );
};

RewardBreadcrumb.propTypes = {
  intl: PropTypes.shape().isRequired,
  reqObject: PropTypes.shape(),
  filterKey: PropTypes.string.isRequired,
};

RewardBreadcrumb.defaultProps = {
  filterKey: '',
  reqObject: {},
};

export default injectIntl(RewardBreadcrumb);
