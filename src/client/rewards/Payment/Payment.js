import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PaymentTable from './PaymentTable/PaymentTable';
import { getLenders } from '../../../waivioApi/ApiClient';
import Action from '../../components/Button/Action';
import { openTransfer } from '../../wallet/walletActions';
import './Payment.less';
import { BXY_GUEST_PREFIX, GUEST_PREFIX } from '../../../common/constants/waivio';
import { getAppUrl } from '../../reducers';

// eslint-disable-next-line no-shadow
const Payment = ({ match, intl, userName }) => {
  const [sponsors, setSponsors] = useState({});
  const [payable, setPayable] = useState({});

  const dispatch = useDispatch();
  const appUrl = useSelector(getAppUrl);
  const url = 'waivio';

  const requestParams = {
    sponsor: match.path === '/rewards/payables/@:userName' ? userName : match.params.userName,
    user: match.path === '/rewards/payables/@:userName' ? match.params.userName : userName,
  };

  const isReceiverGuest =
    match.params.userName.startsWith(GUEST_PREFIX) ||
    match.params.userName.startsWith(BXY_GUEST_PREFIX);

  const memo = isReceiverGuest ? 'guest_reward' : 'user_reward';
  const app = url;

  useEffect(() => {
    getLenders(requestParams)
      .then(data => {
        setSponsors(data.histories);
        setPayable(data.payable);
      })
      .catch(e => console.log(e));
  }, []);

  let titleName;
  let isPayables;
  if (match.path === '/rewards/payables/@:userName') {
    titleName = intl.formatMessage({
      id: 'payment_page_payables',
      defaultMessage: 'Payables',
    });
    isPayables = true;
  } else {
    titleName = intl.formatMessage({
      id: 'payment_page_receivables',
      defaultMessage: 'Receivables',
    });
    isPayables = false;
  }

  const name = match.params.userName;

  return (
    <div className="Payment">
      <div className="Payment__title">
        <div className="Payment__title-payment">
          {titleName}:
          <Link className="Payment__title-link" to={`/@${userName}`}>{` ${userName} `}</Link>
          {isPayables ? <span>&rarr;</span> : <span>&larr;</span>}
          <Link className="Payment__title-link" to={`/@${name}`}>{` ${name} `}</Link>
        </div>
        <div className="Payment__title-pay">
          {isPayables && payable && (
            <Action
              className="WalletSidebar__transfer"
              primary
              onClick={() => dispatch(openTransfer(name, payable, 'HIVE', memo, app))}
            >
              {intl.formatMessage({
                id: 'pay',
                defaultMessage: 'Pay',
              })}
              {` ${payable} HIVE`}
            </Action>
          )}
        </div>
      </div>
      <div className="Payment__information-row">
        <div className="Payment__information-row-important">
          {intl.formatMessage({
            id: 'payment_page_important',
            defaultMessage: 'Important',
          })}
          :
        </div>
        {intl.formatMessage({
          id: 'payment_page_transfers_with_user_reward_included',
          defaultMessage:
            'Only transfer with {"id":"user_reward"} instructions are processed as rewards payments',
        })}
      </div>
      {!isEmpty(sponsors) && <PaymentTable sponsors={sponsors} isHive />}
    </div>
  );
};

Payment.propTypes = {
  intl: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,
  userName: PropTypes.string.isRequired,
};

export default injectIntl(Payment);
