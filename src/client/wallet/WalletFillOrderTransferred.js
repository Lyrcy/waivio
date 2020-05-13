import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedRelative, FormattedDate, FormattedTime } from 'react-intl';
import BTooltip from '../components/BTooltip';
import Avatar from '../components/Avatar';
import WalletFillOrderGet from './WalletFillOrderGet';

const WalletFillOrderTransferred = ({ transactionDetails, timestamp }) => (
  <React.Fragment>
    <WalletFillOrderGet transactionDetails={transactionDetails} timestamp={timestamp} />
    <div className="UserWalletTransactions__transaction">
      <div className="UserWalletTransactions__avatar">
        <Avatar username={transactionDetails.account} size={40} />
      </div>
      <div className="UserWalletTransactions__content">
        <div className="UserWalletTransactions__content-recipient">
          <div>
            <FormattedMessage
              id="fillOrder_wallet_transferred"
              defaultMessage="You transferred {current_pays}"
              values={{
                current_pays: <span>{transactionDetails.current_pays}</span>,
              }}
            />
          </div>
          <div className="UserWalletTransactions__transfer">
            {'- '}
            {transactionDetails.current_pays}
          </div>
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
      </div>
    </div>
  </React.Fragment>
);

WalletFillOrderTransferred.propTypes = {
  transactionDetails: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  timestamp: PropTypes.number,
  current_pays: PropTypes.string,
};

WalletFillOrderTransferred.defaultProps = {
  timestamp: 0,
  current_pays: '',
};

export default WalletFillOrderTransferred;