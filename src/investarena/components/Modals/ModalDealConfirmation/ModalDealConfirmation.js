import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import _ from 'lodash';
import React from 'react';
// import TchChart from '../../TchChart';
// import TVChart from '../../TVChart';
// import TVEmbedChart from '../../TrendingViewChart/TVEmbedChart';
import TVWContainer from '../../TVWidget';
import TradingForm from '../../TradingForm';
import './ModalDealConfirmation.less';

const propTypes = {
  modalInfo: PropTypes.shape(),
  toggleModal: PropTypes.func.isRequired,
  intl: PropTypes.shape().isRequired,
  isModalOpenDealsOpen: PropTypes.bool.isRequired,
  platformName: PropTypes.string.isRequired,
};

const ModalDealConfirmation = props => {
  const isModalOpen =
    props.isModalOpenDealsOpen &&
    props.modalInfo &&
    !_.isEmpty(props.modalInfo) &&
    props.modalInfo.quote;
  return (
    <React.Fragment>
      {isModalOpen && (
        <Modal
          title={props.intl.formatMessage({
            id: 'modalOpen.header.title',
            defaultMessage: 'Open deal',
          })}
          visible={!!isModalOpen}
          footer={null}
          onCancel={props.toggleModal}
          width={'90vw'}
        >
          <div className="modal-open-deals">
            <div style={{ width: '100%', height: '70vh' }}>
              <TVWContainer
                quoteSecurity={props.modalInfo.quote.security}
                market={props.modalInfo.quote.market}
                period={'60'}
              />
            </div>
            {props.platformName !== 'widgets' && (
              <TradingForm caller="od-pm" quoteSecurity={props.modalInfo.quote.security} />
            )}
          </div>
        </Modal>
      )}
    </React.Fragment>
  );
};

ModalDealConfirmation.propTypes = propTypes;

export default injectIntl(ModalDealConfirmation);
