import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, DatePicker, Form } from 'antd';
import { injectIntl } from 'react-intl';
import { get, map, size } from 'lodash';
import moment from 'moment';
import {
  getAuthenticatedUser,
  getAuthenticatedUserName,
  getTableOperationNum,
  getTableTransactions,
  getTotalVestingFundSteem,
  getTotalVestingShares,
  getTransactions,
  getUser,
  getUserHasMoreTable,
  getUsersTransactions,
  getIsloadingMoreTableTransactions,
  getLoadingMoreUsersAccountHistory,
  getUsersAccountHistory,
  hasMoreGuestActions,
  getIsErrorLoadingTable,
  getIsloadingTableTransactions,
  getLocale,
} from '../reducers';
import {
  openWalletTable,
  closeWalletTable,
  getUserTableTransactionHistory,
  clearTransactionsTableHistory,
  getMoreTableUserTransactionHistory,
  getMoreUserAccountHistory,
  clearTransactionsHistory,
  getUserAccountHistory,
} from './walletActions';
import ReduxInfiniteScroll from '../vendor/ReduxInfiniteScroll';
import WalletTableBodyRow from './WalletTableBodyRow';
import {
  getDataDemoTransactions,
  handleLoadMoreTransactions,
  selectFormatDate,
  TRANSACTION_TYPES,
  validateDate,
} from './WalletHelper';
import { guestUserRegex } from '../helpers/regexHelpers';

import './WalletTable.less';
import Loading from '../components/Icon/Loading';

@Form.create()
@injectIntl
@connect(
  (state, ownProps) => ({
    user:
      ownProps.isCurrentUser || ownProps.match.params.name === getAuthenticatedUserName(state)
        ? getAuthenticatedUser(state)
        : getUser(state, ownProps.match.params.name),
    transactionsHistory: getTransactions(state),
    demoTransactionsHistory: getUsersTransactions(state),
    totalVestingShares: getTotalVestingShares(state),
    totalVestingFundSteem: getTotalVestingFundSteem(state),
    tableTransactionsHistory: getTableTransactions(state),
    hasMore: getUserHasMoreTable(state),
    operationNum: getTableOperationNum(state),
    isloadingMoreTableTransactions: getIsloadingMoreTableTransactions(state),
    isloadingMoreDemoTransactions: getLoadingMoreUsersAccountHistory(state),
    usersAccountHistory: getUsersAccountHistory(state),
    demoHasMoreActions: hasMoreGuestActions(state),
    isErrorLoading: getIsErrorLoadingTable(state),
    isloadingTableTransactions: getIsloadingTableTransactions(state),
    locale: getLocale(state),
  }),
  {
    openTable: openWalletTable,
    closeTable: closeWalletTable,
    getTransactionsByInterval: getUserTableTransactionHistory,
    getDemoTransactionsByInterval: getUserAccountHistory,
    clearTable: clearTransactionsTableHistory,
    clearWalletHistory: clearTransactionsHistory,
    getMoreTableTransactions: getMoreTableUserTransactionHistory,
    getMoreDemoTransactions: getMoreUserAccountHistory,
  },
)
class WalletTable extends React.Component {
  static propTypes = {
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    totalVestingShares: PropTypes.string.isRequired,
    totalVestingFundSteem: PropTypes.string.isRequired,
    operationNum: PropTypes.number.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string,
    }).isRequired,
    openTable: PropTypes.func,
    closeTable: PropTypes.func,
    getTransactionsByInterval: PropTypes.func,
    getDemoTransactionsByInterval: PropTypes.func,
    hasMore: PropTypes.bool,
    demoHasMoreActions: PropTypes.bool,
    clearTable: PropTypes.func,
    getMoreTableTransactions: PropTypes.func,
    getMoreDemoTransactions: PropTypes.func,
    isloadingMoreTableTransactions: PropTypes.bool,
    isloadingMoreDemoTransactions: PropTypes.bool,
    usersAccountHistory: PropTypes.shape(),
    tableTransactionsHistory: PropTypes.shape(),
    clearWalletHistory: PropTypes.func,
    transactionsHistory: PropTypes.shape(),
    demoTransactionsHistory: PropTypes.shape(),
    form: PropTypes.shape().isRequired,
    isErrorLoading: PropTypes.bool,
    isloadingTableTransactions: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    history: PropTypes.shape(),
  };

  static defaultProps = {
    openTable: () => {},
    closeTable: () => {},
    getTransactionsByInterval: () => {},
    getDemoTransactionsByInterval: () => {},
    clearTable: () => {},
    getMoreTableTransactions: () => {},
    getMoreDemoTransactions: () => {},
    clearWalletHistory: () => {},
    transactionsHistory: {},
    demoTransactionsHistory: {},
    hasMore: false,
    demoHasMoreActions: false,
    isloadingMoreTableTransactions: false,
    isloadingMoreDemoTransactions: false,
    usersAccountHistory: {},
    tableTransactionsHistory: {},
    isSubmitLoading: false,
    operationNum: -1,
    isErrorLoading: false,
    isloadingTableTransactions: false,
    history: {},
  };

  state = {
    startDate: 0,
    endDate: 0,
  };

  componentDidMount() {
    this.props.openTable();
  }

  componentWillUnmount() {
    this.props.closeTable();
  }

  getCurrentTransactions = (isGuestPage, tableTransactionsHistory) => {
    const { user, transactionsHistory, demoTransactionsHistory } = this.props;
    const username = user.name;

    if (!isGuestPage && !size(transactionsHistory)) {
      return get(tableTransactionsHistory, username, []);
    }
    if (isGuestPage) {
      return getDataDemoTransactions(username, demoTransactionsHistory);
    }
    return get(transactionsHistory, username, []);
  };

  handleSubmit = () => {
    const {
      getTransactionsByInterval,
      getDemoTransactionsByInterval,
      clearTable,
      clearWalletHistory,
      user,
    } = this.props;
    const { startDate, endDate } = this.state;
    const currentUsername = user.name;
    const isGuestPage = guestUserRegex.test(user && user.name);
    const tableView = true;
    const limit = 10;

    clearWalletHistory();

    if (isGuestPage) {
      getDemoTransactionsByInterval(currentUsername, tableView, startDate, endDate);
    } else {
      clearTable();
      getTransactionsByInterval(
        currentUsername,
        limit,
        tableView,
        startDate,
        endDate,
        TRANSACTION_TYPES,
      );
    }
  };

  handleOnClick = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(
      err => !err && setTimeout(() => this.handleSubmit(), 500),
    );
  };

  filterPanel = () => {
    const { intl, isloadingTableTransactions, locale, history, user } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formatDate = selectFormatDate(locale);
    return (
      <React.Fragment>
        <span
          className="WalletTable__back-btn"
          role="presentation"
          onClick={() => history.push(`/@${user.name}/transfers`)}
        >
          {intl.formatMessage({
            id: 'table_back',
            defaultMessage: 'Back',
          })}
        </span>
        <Form layout="inline">
          <Form.Item>
            <div className="WalletTable__title-wrap">
              <div className="WalletTable__star-flag">*</div>
              <div className="WalletTable__from">
                {intl.formatMessage({
                  id: 'table_date_from',
                  defaultMessage: 'From:',
                })}
              </div>
            </div>
            <div>
              {getFieldDecorator('from', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'table_from_validation',
                      defaultMessage: 'Field "from" is required',
                    }),
                  },
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'table_after_till_validation',
                      defaultMessage: 'The selected date must be before or equal the current date',
                    }),
                    validator: validateDate,
                  },
                ],
              })(
                <DatePicker
                  format={formatDate}
                  placeholder={intl.formatMessage({
                    id: 'table_start_date_picker',
                    defaultMessage: 'Select start date',
                  })}
                  onChange={value => this.setState({ startDate: moment(value).unix() })}
                />,
              )}
            </div>
          </Form.Item>
          <Form.Item>
            <div className="WalletTable__title-wrap">
              <div className="WalletTable__star-flag">*</div>
              <div className="WalletTable__till">
                {intl.formatMessage({
                  id: 'table_date_till',
                  defaultMessage: 'Till:',
                })}
              </div>
            </div>
            {getFieldDecorator('end', {
              rules: [
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'table_till_validation',
                    defaultMessage: 'Field "till" is required',
                  }),
                },
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'table_after_till_validation',
                    defaultMessage: 'The selected date must be before or equal the current date',
                  }),
                  validator: validateDate,
                },
              ],
            })(
              <DatePicker
                format={formatDate}
                placeholder={intl.formatMessage({
                  id: 'table_end_date_picker',
                  defaultMessage: 'Select end date',
                })}
                onChange={value => this.setState({ endDate: moment(value).unix() })}
              />,
            )}
          </Form.Item>
          <Button
            className="WalletTable__submit"
            onClick={this.handleOnClick}
            type="primary"
            htmlType="submit"
            loading={isloadingTableTransactions}
          >
            {intl.formatMessage({
              id: 'append_send',
              defaultMessage: 'Submit',
            })}
          </Button>
        </Form>
      </React.Fragment>
    );
  };

  handleLoadMore = () => {
    const {
      user,
      operationNum,
      isloadingMoreTableTransactions,
      isloadingMoreDemoTransactions,
      getMoreTableTransactions,
      getMoreDemoTransactions,
      usersAccountHistory,
    } = this.props;

    const currentUsername = user.name;
    const isGuestPage = guestUserRegex.test(user && user.name);
    const actions = get(usersAccountHistory, currentUsername, []);

    const loadMoreValues = {
      username: currentUsername,
      operationNumber: operationNum,
      isLoadingMore: isloadingMoreTableTransactions,
      demoIsLoadingMore: isloadingMoreDemoTransactions,
      getMoreFunction: getMoreTableTransactions,
      getMoreDemoFunction: getMoreDemoTransactions,
      transferActions: actions,
      isGuest: isGuestPage,
      table: true,
      fromDate: this.state.startDate,
      tillDate: this.state.endDate,
      types: TRANSACTION_TYPES,
    };
    return handleLoadMoreTransactions(loadMoreValues);
  };

  render() {
    const {
      user,
      intl,
      totalVestingShares,
      totalVestingFundSteem,
      hasMore,
      demoHasMoreActions,
      tableTransactionsHistory,
      isErrorLoading,
    } = this.props;

    const isGuestPage = guestUserRegex.test(user && user.name);
    const transactions = this.getCurrentTransactions(isGuestPage, tableTransactionsHistory);
    const currentUsername = user.name;

    return (
      <React.Fragment>
        {this.filterPanel()}
        {size(transactions) ? (
          <div className="WalletTable">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th className="WalletTable__date">
                    {intl.formatMessage({
                      id: 'table_date',
                      defaultMessage: `Date`,
                    })}
                  </th>
                  <th className="WalletTable__HIVE">
                    {intl.formatMessage({
                      id: 'table_HIVE',
                      defaultMessage: `HIVE`,
                    })}
                  </th>
                  <th className="WalletTable__HP">
                    {intl.formatMessage({
                      id: 'table_HP',
                      defaultMessage: `HP`,
                    })}
                  </th>
                  <th className="WalletTable__HBD">
                    {intl.formatMessage({
                      id: 'table_HBD',
                      defaultMessage: `HBD`,
                    })}
                  </th>
                  <th className="WalletTable__description">
                    {intl.formatMessage({
                      id: 'table_description',
                      defaultMessage: `Description`,
                    })}
                  </th>
                  <th className="WalletTable__memo">
                    {intl.formatMessage({
                      id: 'memo',
                      defaultMessage: `Memo`,
                    })}
                  </th>
                </tr>
              </thead>
              <tbody>
                <ReduxInfiniteScroll
                  className="WalletTable__main-content"
                  loadMore={this.handleLoadMore}
                  hasMore={isGuestPage ? demoHasMoreActions : hasMore}
                  elementIsScrollable={false}
                  threshold={500}
                  loader={
                    !isErrorLoading && (
                      <div className="WalletTable__loader">
                        <Loading />
                      </div>
                    )
                  }
                >
                  {transactions &&
                    map(transactions, transaction => (
                      <WalletTableBodyRow
                        key={transaction.timestamp}
                        transaction={transaction}
                        isGuestPage={isGuestPage}
                        currentUsername={currentUsername}
                        totalVestingShares={totalVestingShares}
                        totalVestingFundSteem={totalVestingFundSteem}
                      />
                    ))}
                </ReduxInfiniteScroll>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="WalletTable__empty-table">
            {intl.formatMessage({
              id: 'empty_table',
              defaultMessage: `Please, select start and end date`,
            })}
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default WalletTable;