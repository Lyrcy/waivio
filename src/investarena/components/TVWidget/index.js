import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import { getNightmode } from '../../../client/reducers';

const propTypes = {
  isNightMode: PropTypes.bool,
  quoteSecurity: PropTypes.string.isRequired,
  intl: PropTypes.shape({
    locale: PropTypes.string,
  }).isRequired,
};

const defaultProps = {
  isNightMode: false,
};

const TVWidget = ({ isNightMode, quoteSecurity, intl }) => (
  <TradingViewWidget
    symbol={
      quoteSecurity === 'NRGBTC' || quoteSecurity === 'VIDBTC'
        ? `KUCOIN:${quoteSecurity}`
        : `BINANCE:${quoteSecurity}`
    }
    hide_side_toolbar={false}
    autosize
    theme={isNightMode ? Themes.DARK : Themes.LIGHT}
    locale={intl.locale}
  />
);

TVWidget.propTypes = propTypes;

TVWidget.defaultProps = defaultProps;

const mapStateToProps = state => ({
  isNightMode: getNightmode(state),
});

export default connect(mapStateToProps)(injectIntl(TVWidget));
