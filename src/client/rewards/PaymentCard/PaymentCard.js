import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Tooltip } from 'antd';
import Action from '../../components/Button/Action';
import Avatar from '../../components/Avatar';
import { openTransfer } from '../../wallet/walletActions';
import {
  BXY_GUEST_PREFIX,
  GUEST_PREFIX,
  WAIVIO_PARENT_PERMLINK,
} from '../../../common/constants/waivio';
import { HIVE } from '../../../common/constants/cryptos';
import { getMemo } from '../rewardsHelper';
import './PaymentCard.less';

// eslint-disable-next-line no-shadow
const PaymentCard = ({ intl, payable, name, alias, history, path, match }) => {
  const dispatch = useDispatch();
  const isReceiverGuest = name.startsWith(GUEST_PREFIX) || name.startsWith(BXY_GUEST_PREFIX);
  const handleSetUser = () => {
    history.push(path);
  };

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/@${name}`);
  };

  const memo = getMemo(isReceiverGuest);
  const app = WAIVIO_PARENT_PERMLINK;
  const currency = HIVE.symbol;

  let renderTransferButton = (
    <Action
      className="WalletSidebar__transfer"
      primary={payable >= 0}
      onClick={() => dispatch(openTransfer(name, payable, currency, memo, app))}
      disabled={payable <= 0}
    >
      {intl.formatMessage({
        id: 'pay',
        defaultMessage: 'Pay',
      })}
      {` ${payable && payable.toFixed(2)} HIVE`}
    </Action>
  );

  if (match.path === '/rewards/receivables') {
    renderTransferButton = <span>{` ${payable && payable.toFixed(2)} HIVE`}</span>;
  }

  return (
    <div className="PaymentCard" onClick={handleSetUser} role="presentation">
      <div className="PaymentCard__content" onClick={handleClick} role="presentation">
        <Avatar username={name} size={40} />
        <div className="PaymentCard__content-name-wrap">
          <div className="PaymentCard__content-name-wrap-alias"> {alias}</div>
          <div className="PaymentCard__content-name-wrap-row">
            <div className="PaymentCard__content-name-wrap-row-name">{`@${name}`}</div>
          </div>
        </div>
      </div>
      <div className="PaymentCard__end-wrap">
        <div className="PaymentCard__content-name-wrap-row-pay">
          {renderTransferButton}
          <div className="PaymentCard__end-wrap-icon">
            <Tooltip
              title={intl.formatMessage(
                {
                  id: 'payment_card_your_payment_history_with_user',
                  defaultMessage: 'Your payment history with {username}',
                },
                { username: name },
              )}
            >
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
              <img
                src="/images/icons/arrowSmall.svg"
                alt="Payments history"
                onClick={handleSetUser}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

PaymentCard.propTypes = {
  intl: PropTypes.shape().isRequired,
  payable: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  alias: PropTypes.string,
  history: PropTypes.shape().isRequired,
  path: PropTypes.string.isRequired,
  match: PropTypes.shape().isRequired,
};

PaymentCard.defaultProps = {
  alias: '',
};

export default withRouter(injectIntl(PaymentCard));
