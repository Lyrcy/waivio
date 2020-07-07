import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
  BXY_GUEST_PREFIX,
  GUEST_PREFIX,
  WAIVIO_PARENT_PERMLINK,
} from '../../../common/constants/waivio';
import { HIVE } from '../../../common/constants/cryptos';
import { getMemo } from '../rewardsHelper';
import Action from '../../components/Button/Action';
import { openTransfer } from '../../wallet/walletActions';
import { getHiveBeneficiaryAccount, isGuestUser } from '../../reducers';
import { openLinkHiveAccountModal } from '../../settings/settingsActions';

const TransferButton = ({ match, intl, payable, name }) => {
  const dispatch = useDispatch();
  const isReceiverGuest = name.startsWith(GUEST_PREFIX) || name.startsWith(BXY_GUEST_PREFIX);
  const memo = getMemo(isReceiverGuest);
  const app = WAIVIO_PARENT_PERMLINK;
  const currency = HIVE.symbol;
  const hiveBeneficiaryAccount = useSelector(getHiveBeneficiaryAccount);
  const isGuest = useSelector(isGuestUser);
  const payableForRender = payable >= 0 ? payable : payable * -1;
  return (
    <React.Fragment>
      {match.path === '/rewards/receivables' && payable < 0 && (
        <Action
          className="WalletSidebar__transfer"
          primary={payable < 0}
          onClick={() => {
            if (!hiveBeneficiaryAccount && isGuest) {
              dispatch(openLinkHiveAccountModal(true));
            }
            dispatch(openTransfer(name, payableForRender, currency, memo, app));
          }}
          disabled={payable >= 0}
        >
          {intl.formatMessage({
            id: 'pay',
            defaultMessage: 'Pay',
          })}
          {` ${payableForRender && payableForRender.toFixed(3)} HIVE`}
        </Action>
      )}
      {match.path === '/rewards/receivables' && payable >= 0 && (
        <span>{` ${payable && payable.toFixed(3)} HIVE`}</span>
      )}
      {match.path === '/rewards/payables' && (
        <Action
          className="WalletSidebar__transfer"
          primary={payable > 0}
          onClick={() => dispatch(openTransfer(name, payable, currency, memo, app))}
          disabled={payable <= 0}
        >
          {intl.formatMessage({
            id: 'pay',
            defaultMessage: 'Pay',
          })}
          {` ${payable && payable.toFixed(3)} HIVE`}
        </Action>
      )}
    </React.Fragment>
  );
};

TransferButton.propTypes = {
  intl: PropTypes.shape().isRequired,
  payable: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  match: PropTypes.shape().isRequired,
};

export default injectIntl(TransferButton);
