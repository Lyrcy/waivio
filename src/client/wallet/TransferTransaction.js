import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { FormattedMessage, FormattedRelative, FormattedDate, FormattedTime } from 'react-intl';
import BTooltip from '../components/BTooltip';
import Avatar from '../components/Avatar';

const TransferTransaction = ({ to, memo, amount, timestamp, type, isGuestUser }) => {
  const typeToGuest = type === 'user_to_guest_transfer';
  const typeDemo = type === 'demo_user_transfer';

  return (
    <div className="UserWalletTransactions__transaction">
      <div className="UserWalletTransactions__avatar">
        <Avatar username={to} size={40} />
      </div>
      <div className="UserWalletTransactions__content">
        <div className="UserWalletTransactions__content-recipient">
          <div>
            <FormattedMessage
              id="transferred_to"
              defaultMessage="Transferred to {username}"
              values={{
                username: (
                  <Link to={`/@${to}`}>
                    <span className="username">{to}</span>
                  </Link>
                ),
              }}
            />
          </div>
          {isGuestUser ? (
            <div
              className={classNames({
                UserWalletTransactions__transfer: typeToGuest,
                UserWalletTransactions__received: typeDemo,
              })}
            >
              {typeDemo ? '+ ' : '- '}
              {amount}
            </div>
          ) : (
            <div className="UserWalletTransactions__transfer">
              {'- '}
              {amount}
            </div>
          )}
        </div>
        <span className="UserWalletTransactions__timestamp">
          <BTooltip
            title={
              <span>
                <FormattedDate value={`${timestamp}Z`} /> <FormattedTime value={`${timestamp}Z`} />
              </span>
            }
          >
            <span>
              <FormattedRelative value={`${timestamp}Z`} />
            </span>
          </BTooltip>
        </span>
        <span className="UserWalletTransactions__memo">{memo}</span>
      </div>
    </div>
  );
};

TransferTransaction.propTypes = {
  to: PropTypes.string,
  memo: PropTypes.string,
  amount: PropTypes.element,
  timestamp: PropTypes.string,
  type: PropTypes.string,
  isGuestUser: PropTypes.bool,
};

TransferTransaction.defaultProps = {
  to: '',
  memo: '',
  amount: <span />,
  timestamp: '',
  type: '',
  isGuestUser: false,
};

export default TransferTransaction;
