import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { formatPerformance } from '../../../../app/Sidebar/TopPerformers/TopPerformers';
import { DEFAULT_OBJECT_AVATAR_URL } from '../../../../../common/constants/waivio';
import './PerformerItem.less';

const PerformerItem = ({ performer, period, toggleMobileNavigation }) => (
  <div className="PerformerItem" key={performer.name}>
    <div className="PerformerItem__links" onClick={toggleMobileNavigation} role="presentation">
      <Link to={`/object/${performer.id}`}>
        <div
          className="ObjectAvatar"
          style={{ backgroundImage: `url(${performer.avatar || DEFAULT_OBJECT_AVATAR_URL})` }}
          title={performer.name}
        />
      </Link>
      <Link
        to={`/object/${performer.id}`}
        title={performer.name}
        className="PerformerItem__links-name"
      >
        {performer.name}
      </Link>
    </div>
    <div
      className={classNames('PerformerItem__info', {
        success: performer[period] > 0,
        danger: performer[period] < 0,
        nil: performer[period] === 0,
      })}
    >
      {formatPerformance(performer[period])}
    </div>
  </div>
);

PerformerItem.propTypes = {
  toggleMobileNavigation: PropTypes.func.isRequired,
  performer: PropTypes.shape().isRequired,
  period: PropTypes.string.isRequired,
};

export default PerformerItem;
