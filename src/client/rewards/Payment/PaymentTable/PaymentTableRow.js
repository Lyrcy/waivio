import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { map, reduce, get } from 'lodash';
import moment from 'moment';
import { convertDigits, formatDate } from '../../rewardsHelper';
import Report from '../../Report/Report';
import { getReport } from '../../../../waivioApi/ApiClient';
import { getFieldWithMaxWeight } from '../../../object/wObjectHelper';
import { setDataForSingleReport } from '../../rewardsActions';
import './PaymentTable.less';

const PaymentTableRow = ({ intl, sponsor, isReports, isHive }) => {
  const [isModalReportOpen, setModalReportOpen] = useState(false);
  const getConvertDigits = obj =>
    obj.type === 'transfer'
      ? `-${convertDigits(obj.amount, isHive)}`
      : convertDigits(obj.amount, isHive);
  const dispatch = useDispatch();
  const toggleModalReport = () => {
    const requestParams = {
      guideName: sponsor.sponsor,
      userName: sponsor.userName,
      reservationPermlink: sponsor.details.reservation_permlink,
    };
    getReport(requestParams)
      .then(data => {
        dispatch(setDataForSingleReport(data));
      })
      .then(() => setModalReportOpen(!isModalReportOpen))
      .catch(e => console.log(e));
  };
  const closeModalReport = () => {
    if (isModalReportOpen) setModalReportOpen(!isModalReportOpen);
  };

  const prymaryObjectName = getFieldWithMaxWeight(get(sponsor, 'details.main_object', {}), 'name');
  const reviewObjectName = getFieldWithMaxWeight(get(sponsor, 'details.review_object', {}), 'name');
  const userWeight = `(${(10000 -
    reduce(sponsor.details.beneficiaries, (amount, benef) => amount + benef.weight, 0)) /
    100}%)`;
  const time = isReports ? moment(sponsor.createdAt).format('h:mm:ss') : '';
  return (
    <tr>
      <td>
        {formatDate(intl, sponsor.createdAt)} {time}
      </td>
      <td>
        <div className="PaymentTable__action-wrap">
          <div className="PaymentTable__action-items">
            {sponsor.type === 'transfer' || sponsor.type === 'demo_debt' ? (
              <React.Fragment>
                <span className="PaymentTable__action-item fw6">
                  {intl.formatMessage({
                    id: 'paymentTable_transfer',
                    defaultMessage: `Transfer`,
                  })}{' '}
                </span>
                {intl.formatMessage({
                  id: 'paymentTable_from',
                  defaultMessage: 'from',
                })}{' '}
                <Link to={`/@${sponsor.sponsor}`}>@{sponsor.sponsor}</Link>{' '}
                {intl.formatMessage({
                  id: 'paymentTable_review_to',
                  defaultMessage: 'to',
                })}{' '}
                <Link to={`/@${sponsor.userName}`}>@{sponsor.userName}</Link>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <span className="PaymentTable__action-item fw6">
                  {intl.formatMessage({
                    id: 'paymentTable_review',
                    defaultMessage: 'Review',
                  })}
                </span>{' '}
                {intl.formatMessage({
                  id: 'paymentTable_review_by',
                  defaultMessage: 'by',
                })}{' '}
                <Link to={`/@${sponsor.userName}`}>@{sponsor.userName}</Link> (
                {intl.formatMessage({
                  id: 'paymentTable_requested_by',
                  defaultMessage: `requested by`,
                })}{' '}
                <Link to={`/@${sponsor.sponsor}`}>@{sponsor.sponsor}</Link>)
              </React.Fragment>
            )}
          </div>
          {sponsor && sponsor.details && sponsor.details.main_object && (
            <div className="PaymentTable__action-items">
              <div>
                <Link to={`/@${sponsor.userName}/${sponsor.details.review_permlink}`}>
                  {intl.formatMessage({
                    id: 'paymentTable_review',
                    defaultMessage: `Review`,
                  })}
                </Link>
                :{' '}
                <Link to={`/object/${get(sponsor, ['details', 'main_object', 'author_permlink'])}`}>
                  {prymaryObjectName}
                </Link>
                ,{' '}
                <Link
                  to={`/object/${get(sponsor, ['details', 'review_object', 'author_permlink'])}`}
                >
                  {reviewObjectName}
                </Link>
              </div>
              <div>
                {intl.formatMessage({
                  id: 'beneficiaries-weights',
                  defaultMessage: `Beneficiaries`,
                })}
                :{' '}
                {sponsor.details.beneficiaries
                  ? map(sponsor.details.beneficiaries, benef => (
                      <React.Fragment key={benef.account}>
                        <Link to={`/@${benef.account}`}>{benef.account}</Link>
                        <span>{` (${benef.weight / 100}%), `}</span>
                      </React.Fragment>
                    ))
                  : null}{' '}
                <Link to={`/@${sponsor.userName}`}>{sponsor.userName}</Link> {userWeight}
              </div>
            </div>
          )}
        </div>
      </td>
      <td>
        {sponsor.type === 'transfer' || sponsor.type === 'demo_debt' ? (
          <p>
            {intl.formatMessage({
              id: 'paymentTable_payment',
              defaultMessage: 'Payment',
            })}
          </p>
        ) : (
          <React.Fragment>
            <p>
              <Link
                to={`/@${sponsor.userName}/${get(sponsor, ['details', 'reservation_permlink'])}`}
              >
                {intl.formatMessage({
                  id: 'paymentTable_reservation',
                  defaultMessage: `Reservation`,
                })}
              </Link>
            </p>
            <div className="PaymentTable__report" onClick={toggleModalReport} role="presentation">
              <span>
                {intl.formatMessage({
                  id: 'paymentTable_report',
                  defaultMessage: `Report`,
                })}
              </span>
            </div>
          </React.Fragment>
        )}
        <Report
          isModalReportOpen={isModalReportOpen}
          toggleModal={closeModalReport}
          sponsor={sponsor}
        />
      </td>
      <td>{sponsor.amount ? getConvertDigits(sponsor) : 0}</td>
      <td className="PaymentTable__balance-column">
        {convertDigits(sponsor.balance, isHive) ? convertDigits(sponsor.balance, isHive) : 0}
      </td>
    </tr>
  );
};

PaymentTableRow.propTypes = {
  intl: PropTypes.shape().isRequired,
  sponsor: PropTypes.shape().isRequired,
  isReports: PropTypes.bool,
  isHive: PropTypes.bool,
};

PaymentTableRow.defaultProps = {
  isReports: false,
  isHive: false,
};

export default injectIntl(PaymentTableRow);
