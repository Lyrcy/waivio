import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { isEmpty } from 'lodash';
import WrappedNormalLoginForm from './ReportsForm';
import { getLenders } from '../../../waivioApi/ApiClient';
import PaymentTable from '../Payment/PaymentTable/PaymentTable';
import './Reports.less';

const Reports = ({ intl, userName }) => {
  const [sponsors, setSponsors] = useState({});

  const requestParams = {
    sponsor: userName,
    globalReport: true,
  };

  const getHistories = params => {
    getLenders(params)
      .then(data => {
        setSponsors(data.histories);
      })
      .catch(e => console.log(e));
  };

  useEffect(() => {
    getHistories(requestParams);
  }, []);

  return (
    <div className="Reports">
      <React.Fragment>
        <div className="Reports__wrap">
          <div className="Reports__wrap-title">
            {intl.formatMessage({
              id: 'reports',
              defaultMessage: `Reports`,
            })}{' '}
            :
          </div>
        </div>
        <WrappedNormalLoginForm intl={intl} userName={userName} getHistories={getHistories} />
        {!isEmpty(sponsors) ? (
          <PaymentTable sponsors={sponsors} isReports userName={userName} />
        ) : (
          <div>
            {intl.formatMessage({
              id: 'list_empty',
              defaultMessage: `There are no data`,
            })}
          </div>
        )}
      </React.Fragment>
    </div>
  );
};

Reports.propTypes = {
  intl: PropTypes.shape().isRequired,
  userName: PropTypes.string.isRequired,
};

export default injectIntl(Reports);