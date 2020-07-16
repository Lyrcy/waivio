import { each, get, last, findIndex, isEmpty, filter } from 'lodash';
import { createAction } from 'redux-actions';
import formatter from '../helpers/steemitFormatter';
import { createAsyncActionType } from '../helpers/stateHelpers';
import {
  getAccountHistory,
  getDynamicGlobalProperties,
  isWalletTransaction,
  defaultAccountLimit,
} from '../helpers/apiHelpers';
import { ACTIONS_DISPLAY_LIMIT, actionsFilter } from '../helpers/accountHistoryHelper';
import { BXY_GUEST_PREFIX, GUEST_PREFIX } from '../../common/constants/waivio';
import { getTransferHistory } from '../../waivioApi/ApiClient';
import { guestUserRegex } from '../helpers/regexHelpers';

export const OPEN_TRANSFER = '@wallet/OPEN_TRANSFER';
export const CLOSE_TRANSFER = '@wallet/CLOSE_TRANSFER';
export const OPEN_POWER_UP_OR_DOWN = '@wallet/OPEN_POWER_UP_OR_DOWN';
export const CLOSE_POWER_UP_OR_DOWN = '@wallet/CLOSE_POWER_UP_OR_DOWN';
export const GET_GLOBAL_PROPERTIES = createAsyncActionType('@wallet/GET_GLOBAL_PROPERTIES');
export const GET_USER_ACCOUNT_HISTORY = createAsyncActionType('@users/GET_USER_ACCOUNT_HISTORY');
export const GET_MORE_USER_ACCOUNT_HISTORY = createAsyncActionType(
  '@users/GET_MORE_USER_ACCOUNT_HISTORY',
);
export const GET_TRANSACTIONS_HISTORY = createAsyncActionType('@wallet/GET_TRANSACTIONS_HISTORY');
export const GET_MORE_TRANSACTIONS_HISTORY = createAsyncActionType(
  '@wallet/GET_MORE_TRANSACTIONS_HISTORY',
);

export const GET_USER_EST_ACCOUNT_VALUE = createAsyncActionType(
  '@users/GET_USER_EST_ACCOUNT_VALUE',
);
export const UPDATE_ACCOUNT_HISTORY_FILTER = '@users/UPDATE_ACCOUNT_HISTORY_FILTER';
export const SET_INITIAL_CURRENT_DISPLAYED_ACTIONS = '@users/SET_INITIAL_CURRENT_DISPLAYED_ACTIONS';
export const ADD_MORE_ACTIONS_TO_CURRENT_DISPLAYED_ACTIONS =
  '@users/ADD_MORE_ACTIONS_TO_CURRENT_DISPLAYED_ACTIONS';
export const UPDATE_FILTERED_ACTIONS = '@users/UPDATE_FILTERED_ACTIONS';
export const LOADING_MORE_USERS_ACCOUNT_HISTORY = '@users/LOADING_MORE_USERS_ACCOUNT_HISTORY';

export const closeTransfer = createAction(CLOSE_TRANSFER);

export const openPowerUpOrDown = createAction(OPEN_POWER_UP_OR_DOWN);
export const closePowerUpOrDown = createAction(CLOSE_POWER_UP_OR_DOWN);

export const openTransfer = (userName, amount = 0, currency = 'HIVE', memo = '', app) => dispatch =>
  dispatch({
    type: OPEN_TRANSFER,
    payload: {
      userName,
      amount,
      currency,
      memo,
      app,
    },
  });

const parseSteemUserActions = userActions => {
  const userWalletTransactions = [];
  const userAccountHistory = [];

  each(userActions.reverse(), action => {
    const actionCount = action[0];
    const actionDetails = {
      ...action[1],
      actionCount,
    };
    const actionType = actionDetails.op[0];

    if (isWalletTransaction(actionType)) {
      userWalletTransactions.push(actionDetails);
    }

    userAccountHistory.push(actionDetails);
  });
  return {
    userWalletTransactions,
    userAccountHistory,
  };
};
const parseGuestActions = actions => {
  const guestActionType = {
    DEMO_POST: 'demo_post',
    GUEST_TRANSFER: 'user_to_guest_transfer',
    DEMO_DEBT: 'demo_debt',
  };

  return actions.map((action, index) => {
    const transferDirection = Object.values(guestActionType).includes(action.type)
      ? { from: action.sponsor, to: action.userName }
      : { from: action.userName, to: action.sponsor || 'mock' };

    return {
      trx_id: action._id, // eslint-disable-line
      block: 39603148,
      trx_in_block: 1,
      op_in_trx: 0,
      virtual_op: 0,
      timestamp: action.updatedAt.split('.')[0],
      withdraw: action.withdraw,
      op: [
        'transfer',
        {
          ...transferDirection,
          amount: `${action.amount} HIVE`,
          memo: action.memo || '',
          typeTransfer: action.type,
        },
      ],
      actionCount: index + 1,
    };
  });
};
const getParsedUserActions = (userActions, isGuest) => {
  if (isGuest) {
    const userWalletTransactions = parseGuestActions(get(userActions, ['histories'], []));
    return {
      userWalletTransactions,
      userAccountHistory: userWalletTransactions.length
        ? userWalletTransactions
        : [{ actionCount: 0 }],
    };
  }
  return parseSteemUserActions(userActions);
};

export const getGlobalProperties = () => dispatch =>
  dispatch({
    type: GET_GLOBAL_PROPERTIES.ACTION,
    payload: {
      promise: getDynamicGlobalProperties(),
    },
  });

export const getMoreUserAccountHistory = (username, start, limit) => dispatch => {
  const isGuest = username.startsWith(GUEST_PREFIX) || username.startsWith(BXY_GUEST_PREFIX);
  return dispatch({
    type: GET_MORE_USER_ACCOUNT_HISTORY.ACTION,
    payload: {
      promise: getAccountHistory(username, { from: start, limit, isGuest }).then(userActions => {
        const parsedUserActions = getParsedUserActions(userActions, isGuest);
        return {
          username,
          userWalletTransactions: parsedUserActions.userWalletTransactions,
          userAccountHistory: parsedUserActions.userAccountHistory,
          hasMoreGuestActions: get(userActions, ['hasMore'], false),
        };
      }),
    },
  });
};

export const getUserEstAccountValue = user => dispatch =>
  dispatch({
    type: GET_USER_EST_ACCOUNT_VALUE.ACTION,
    payload: {
      promise: formatter.estimateAccountValue(user).then(value => ({
        username: user.name,
        value,
      })),
    },
  });

export const updateAccountHistoryFilter = createAction(UPDATE_ACCOUNT_HISTORY_FILTER);

export const setInitialCurrentDisplayedActions = createAction(
  SET_INITIAL_CURRENT_DISPLAYED_ACTIONS,
);

export const addMoreActionsToCurrentDisplayedActions = createAction(
  ADD_MORE_ACTIONS_TO_CURRENT_DISPLAYED_ACTIONS,
);

export const loadingMoreUsersAccountHistory = createAction(LOADING_MORE_USERS_ACCOUNT_HISTORY);

export const loadMoreCurrentUsersActions = username => (dispatch, getState) => {
  dispatch(loadingMoreUsersAccountHistory());
  const { wallet } = getState();
  const { usersAccountHistory, currentDisplayedActions, accountHistoryFilter } = wallet;
  const currentUsersActions = get(usersAccountHistory, username, []);
  const lastDisplayedAction = last(currentDisplayedActions);

  if (isEmpty(lastDisplayedAction)) {
    dispatch(setInitialCurrentDisplayedActions(username));
    return;
  }

  const lastDisplayedActionCount = lastDisplayedAction.actionCount;
  const lastDisplayedActionIndex = findIndex(
    currentUsersActions,
    userAction => userAction.actionCount === lastDisplayedActionCount,
  );
  const moreActions = currentUsersActions.slice(
    lastDisplayedActionIndex + 1,
    lastDisplayedActionIndex + 1 + ACTIONS_DISPLAY_LIMIT,
  );
  const lastMoreAction = last(moreActions);
  const lastMoreActionCount = isEmpty(lastMoreAction) ? 0 : lastMoreAction.actionCount;

  if (moreActions.length === ACTIONS_DISPLAY_LIMIT || lastMoreActionCount === 0) {
    const filteredMoreActions = filter(moreActions, userAction =>
      actionsFilter(userAction, accountHistoryFilter, username),
    );
    dispatch(
      addMoreActionsToCurrentDisplayedActions({
        moreActions,
        filteredMoreActions,
      }),
    );
  } else {
    const lastActionCount = last(currentUsersActions).actionCount;
    const limit = lastActionCount < defaultAccountLimit ? lastActionCount : defaultAccountLimit;
    dispatch(getMoreUserAccountHistory(username, lastActionCount, limit));
  }
};

export const getUserAccountHistory = username => dispatch => {
  const isGuest = guestUserRegex.test(username);
  return dispatch({
    type: GET_USER_ACCOUNT_HISTORY.ACTION,
    payload: {
      promise: getAccountHistory(username, { isGuest }).then(userActions => {
        const parsedUserActions = getParsedUserActions(userActions, isGuest);

        return {
          username,
          userWalletTransactions: parsedUserActions.userWalletTransactions,
          userAccountHistory: parsedUserActions.userAccountHistory,
          balance: get(userActions, ['payable'], null),
          hasMoreGuestActions: get(userActions, ['hasMore'], false),
        };
      }),
    },
  });
};

export const getUserTransactionHistory = (username, skip, limit) => dispatch =>
  dispatch({
    type: GET_TRANSACTIONS_HISTORY.ACTION,
    payload: {
      promise: getTransferHistory(username, skip, limit)
        .then(data => ({
          username,
          transactionsHistory: data.wallet,
          hasMore: data.hasMore,
        }))
        .catch(error => console.log(error)),
    },
  });

export const getMoreUserTransactionHistory = (username, skip, limit) => dispatch =>
  dispatch({
    type: GET_MORE_TRANSACTIONS_HISTORY.ACTION,
    payload: {
      promise: getTransferHistory(username, skip, limit)
        .then(data => ({
          username,
          transactionsHistory: data.wallet,
          hasMore: data.hasMore,
        }))
        .catch(error => console.log(error)),
    },
  });

export const OPEN_WITHDRAW = '@wallet/OPEN_WITHDRAW';
export const CLOSE_WITHDRAW = '@wallet/CLOSE_WITHDRAW';

export const openWithdraw = () => dispatch =>
  dispatch({
    type: OPEN_WITHDRAW,
  });

export const closeWithdraw = () => dispatch =>
  dispatch({
    type: CLOSE_WITHDRAW,
  });
