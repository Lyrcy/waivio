import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Collapse, DatePicker, Select, Input } from 'antd';
import { optionsAction, optionsForecast } from '../../constants/selectData';
import {
  getQuotePrice,
  getForecastState,
  getEditorForecast,
} from './helpers';
import { maxForecastDay, minForecastMinutes } from '../../constants/constantsForecast';
import { getQuotesSettingsState } from '../../../investarena/redux/selectors/quotesSettingsSelectors';
import {
  makeGetQuoteState,
  makeGetInstrumentsDropdownOptions,
} from '../../../investarena/redux/selectors/quotesSelectors';
import './CreatePostForecast.less';

@injectIntl
@connect((state, ownProps) => ({
  quotesSettings: getQuotesSettingsState(state),
  optionsQuote: makeGetInstrumentsDropdownOptions()(state),
  quoteSelected: makeGetQuoteState()(state, ownProps.forecastValues),
}))
class CreatePostForecast extends Component {
  static propTypes = {
    /* injectIntl */
    intl: PropTypes.shape().isRequired,
    /* connect */
    quotesSettings: PropTypes.shape(),
    optionsQuote: PropTypes.arrayOf(PropTypes.shape()),
    quoteSelected: PropTypes.shape(),
    /* passed props */
    isPosted: PropTypes.bool,
    isUpdating: PropTypes.bool,
    forecastValues: PropTypes.shape(),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    quotesSettings: {},
    quoteSelected: {},
    isPosted: false,
    isUpdating: false,
    forecastValues: {},
    onChange: () => {},
    optionsQuote: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      ...getForecastState(props.forecastValues),
      isValid: true,
      updatesFrozen: false,
    };
  }

  static getDerivedStateFromProps(
    nextProps,
    { updatesFrozen, takeProfitValueIncorrect, stopLossValueIncorrect, ...prevState },
  ) {
    const nextState = getForecastState(nextProps.forecastValues);
    if (!isEqual(nextState, prevState)) {
      return nextState;
    }
    if (!updatesFrozen) {
      const nextQuotePrice = getQuotePrice(prevState.selectRecommend, nextProps.quoteSelected);
      if (nextQuotePrice && nextQuotePrice !== prevState.quotePrice) {
        nextProps.onChange(
          getEditorForecast(
            {
              ...prevState,
              quotePrice: nextQuotePrice,
            },
            nextProps.quotesSettings,
          ),
        );
      }
    }
    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(nextProps.forecastValues, this.props.forecastValues) ||
      (!nextState.updatesFrozen && !isEqual(nextProps.quoteSelected, this.props.quoteSelected)) ||
      (!this.props.optionsQuote.length && nextProps.optionsQuote.length) ||
      this.props.isPosted !== nextProps.isPosted
    );
  }

  validateForm = (quote, recommend, forecast) =>
    !!(quote && recommend && forecast) || !(quote || recommend || forecast);

  updateValueQuote = selectQuote => {
    const quotePrice = this.state.selectRecommend
      ? getQuotePrice(this.state.selectRecommend, this.props.quoteSelected)
      : null;
    this.setState({ updatesFrozen: false });
    this.props.onChange(
      getEditorForecast(
        {
          ...this.state,
          quotePrice,
          selectQuote,
          takeProfitValue: '',
          stopLossValue: '',
          takeProfitValueIncorrect: false,
          stopLossValueIncorrect: false,
        },
        this.props.quotesSettings,
      ),
    );
  };

  updateValueRecommend = selectRecommend => {
    const quotePrice = this.state.selectQuote
      ? getQuotePrice(selectRecommend, this.props.quoteSelected)
      : null;
    this.props.onChange(
      getEditorForecast(
        {
          ...this.state,
          quotePrice,
          selectRecommend,
        },
        this.props.quotesSettings,
      ),
    );
  };

  handleChangeDatetime = dateTimeValue => {
    this.setState({ dateTimeValue });
    this.props.onChange(
      getEditorForecast(
        {
          ...this.state,
          dateTimeValue: moment.utc(dateTimeValue),
        },
        this.props.quotesSettings,
      ),
    );
  };

  updateValueForecast = selectForecast => {
    if (selectForecast === 'Custom') {
      this.props.onChange(
        getEditorForecast(
          {
            ...this.state,
            selectForecast,
            dateTimeValue: moment.utc().add(minForecastMinutes, 'minute'),
          },
          this.props.quotesSettings,
        ),
      );
    } else {
      this.props.onChange(
        getEditorForecast(
          {
            ...this.state,
            selectForecast,
          },
          this.props.quotesSettings,
        ),
      );
    }
  };

  resetForm = () =>
    this.setState(
      {
        takeProfitValueIncorrect: false,
        stopLossValueIncorrect: false,
      },
      this.props.onChange({ isValid: true }, true),
    );

  freezeUpdates = quote => this.setState({ updatesFrozen: !quote });

  render() {
    const {
      selectQuote,
      selectRecommend,
      selectForecast,
      dateTimeValue,
      isValid,
      quotePrice,
    } = this.state;
    const { intl, isPosted, isUpdating, optionsQuote } = this.props;
    return (
      <div className="st-create-post-optional">
        <Collapse defaultActiveKey={['1']} bordered>
          <Collapse.Panel
            key="1"
            header={
              <div className="st-create-post-optional-title">
                <FormattedMessage
                  id="createPost.titleForecast"
                  defaultMessage="Your forecast (optional)"
                />
              </div>
            }
          >
            <div className="st-create-post-show-options">
              <div className="st-create-post-dropdowns">
                <div className="st-create-post-dropdowns-row">
                  <div className="st-create-post-select-wrap" data-test="select-instrument">
                    <p className="m-0">
                      <FormattedMessage
                        id="createPost.selectTitle.instrument"
                        defaultMessage="Instrument"
                      />
                    </p>
                    <Select
                      name="selected-quote"
                      placeholder={intl.formatMessage({
                        id: 'createPost.selectLabel.default',
                        defaultMessage: 'Select',
                      })}
                      className={classNames('st-create-post-select__quote', {
                        'st-create-post-danger': isPosted && !isValid && !selectQuote,
                      })}
                      disabled={isUpdating}
                      filterOption
                      optionFilterProp="title"
                      onChange={this.updateValueQuote}
                      onFocus={this.freezeUpdates}
                      onBlur={this.freezeUpdates}
                      value={selectQuote}
                      dropdownClassName="st-create-post-select__dropDown"
                      showSearch
                    >
                      {optionsQuote.map(option => (
                        <Select.Option key={option.value} value={option.value} title={option.label}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="st-create-post-select-wrap" data-test="select-recommend">
                    <p className="m-0">
                      <FormattedMessage
                        id="createPost.selectTitle.recommend"
                        defaultMessage="Action"
                      />
                    </p>
                    <Select
                      name="selected-action"
                      placeholder={intl.formatMessage({
                        id: 'createPost.selectLabel.default',
                        defaultMessage: 'Select',
                      })}
                      className={classNames('st-create-post-select__action', {
                        'st-create-post-danger': isPosted && !isValid && !selectRecommend,
                      })}
                      disabled={isUpdating}
                      value={selectRecommend}
                      onChange={this.updateValueRecommend}
                    >
                      {optionsAction.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="st-create-post-dropdowns-row">
                  <div className="st-create-post-select-wrap">
                    <p className="m-0">
                      <FormattedMessage id="createPost.selectTitle.price" defaultMessage="Price" />
                    </p>
                    <Input
                      className="st-create-post-quotation"
                      type="text"
                      value={
                        quotePrice &&
                        intl.formatNumber(quotePrice, { maximumSignificantDigits: 10 })
                      }
                      disabled
                    />
                  </div>
                  <div className="st-create-post-select-wrap" data-test="select-forecast">
                    <p className="m-0">
                      <FormattedMessage
                        id="createPost.selectTitle.forecast"
                        defaultMessage="Period"
                      />
                    </p>
                    {isUpdating || this.state.selectForecast === 'Custom' ? (
                      <DatePicker
                        disabled={isUpdating}
                        allowClear={false}
                        showTime={{ format: 'HH:mm', minuteStep: 5 }}
                        style={{ width: '100%' }}
                        locale={intl.formatMessage({ id: 'locale', defaultMessage: 'en' })}
                        value={dateTimeValue}
                        onChange={this.handleChangeDatetime}
                        format="YYYY-MM-DD HH:mm"
                        disabledDate={date =>
                          date < moment().local() ||
                          date >
                            moment()
                              .local()
                              .add(maxForecastDay, 'days')
                        }
                      />
                    ) : (
                      <Select
                        name="selected-forecast"
                        placeholder={intl.formatMessage({
                          id: 'createPost.selectLabel.default',
                          defaultMessage: 'Select',
                        })}
                        className={classNames('st-create-post-select__forecast', {
                          'st-create-post-danger': isPosted && !isValid && !selectForecast,
                        })}
                        value={selectForecast}
                        onChange={this.updateValueForecast}
                      >
                        {optionsForecast.map(option => (
                          <Select.Option key={option.value} value={option.value}>
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </div>
                </div>
                {!isUpdating && (selectQuote || selectRecommend || selectForecast) && (
                  <span className="clear-btn" role="presentation" onClick={this.resetForm}>
                    {intl.formatMessage({ id: 'deals.clear', defaultMessage: 'Clear' })}
                  </span>
                )}
              </div>
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}

export default CreatePostForecast;
