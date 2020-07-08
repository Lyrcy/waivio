import { get } from 'lodash';
import { createSelector } from 'reselect';
import * as actions from './usersActions';
import { GET_USER_ACCOUNT_HISTORY } from '../wallet/walletActions';

const initialState = {
  users: {},
  topExperts: {
    list: [],
    isFetching: false,
    hasMore: true,
  },
  randomExperts: {
    list: [],
    isFetching: false,
    fetched: false,
  },
};

export default function usersReducer(state = initialState, action) {
  switch (action.type) {
    case actions.GET_ACCOUNT.START:
      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state[action.meta.username],
            fetching: true,
            loaded: false,
            failed: false,
          },
        },
      };
    case actions.GET_ACCOUNT.SUCCESS:
      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state[action.meta.username],
            ...action.payload,
            fetching: false,
            loaded: true,
            failed: false,
          },
        },
      };
    case actions.GET_ACCOUNT.ERROR:
      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state[action.meta.username],
            fetching: false,
            loaded: false,
            failed: true,
          },
        },
      };
    case actions.GET_RANDOM_EXPERTS_START:
      return {
        ...state,
        randomExperts: {
          ...state.randomExperts,
          isFetching: true,
          fetched: false,
        },
      };
    case actions.GET_RANDOM_EXPERTS_SUCCESS:
      return {
        ...state,
        randomExperts: {
          list: action.payload.sort((a, b) => b.weight - a.weight),
          isFetching: false,
          fetched: true,
        },
      };
    case actions.GET_RANDOM_EXPERTS_ERROR:
      return {
        ...state,
        randomExperts: {
          ...state.randomExperts,
          isFetching: false,
          fetched: false,
        },
      };
    case actions.GET_TOP_EXPERTS_START:
      return {
        ...state,
        topExperts: {
          ...state.topExperts,
          isFetching: true,
        },
      };
    case actions.GET_TOP_EXPERTS_SUCCESS:
      return {
        ...state,
        topExperts: {
          list: [...state.topExperts.list, ...action.payload],
          isFetching: false,
          hasMore: action.meta.limit === action.payload.length,
        },
      };
    case actions.GET_TOP_EXPERTS_ERROR:
      return {
        ...state,
        topExperts: {
          ...state.topExperts,
          isFetching: false,
          hasMore: false,
        },
      };
    case actions.UNFOLLOW_USER.SUCCESS: {
      if (action.meta.top) {
        const findExperts = state.topExperts.list.findIndex(
          user => user.name === action.meta.username,
        );

        state.topExperts.list.splice(findExperts, 1, {
          ...state.topExperts.list[findExperts],
          youFollows: false,
          pending: false,
        });

        return {
          ...state,
          topExperts: {
            ...state.topExperts,
            list: [...state.topExperts.list],
          },
        };
      }

      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state.users[action.meta.username],
            youFollows: false,
            pending: false,
          },
        },
      };
    }

    case actions.UNFOLLOW_USER.START:
      if (action.meta.top) {
        const findExperts = state.topExperts.list.findIndex(
          user => user.name === action.meta.username,
        );

        state.topExperts.list.splice(findExperts, 1, {
          ...state.topExperts.list[findExperts],
          pending: true,
        });

        return {
          ...state,
          topExperts: {
            ...state.topExperts,
            list: [...state.topExperts.list],
          },
        };
      }

      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state.users[action.meta.username],
            pending: true,
          },
        },
      };

    case actions.UNFOLLOW_USER.ERROR:
      if (action.meta.top) {
        const findExperts = state.topExperts.list.findIndex(
          user => user.name === action.meta.username,
        );

        state.topExperts.list.splice(findExperts, 1, {
          ...state.topExperts.list[findExperts],
          pending: false,
        });

        return {
          ...state,
          topExperts: {
            ...state.topExperts,
            list: [...state.topExperts.list],
          },
        };
      }

      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state.users[action.meta.username],
            pending: false,
          },
        },
      };

    case actions.FOLLOW_USER.START: {
      if (action.meta.top) {
        const findExperts = state.topExperts.list.findIndex(
          user => user.name === action.meta.username,
        );

        state.topExperts.list.splice(findExperts, 1, {
          ...state.topExperts.list[findExperts],
          pending: true,
        });

        return {
          ...state,
          topExperts: {
            ...state.topExperts,
            list: [...state.topExperts.list],
          },
        };
      }

      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state.users[action.meta.username],
            pending: true,
          },
        },
      };
    }
    case actions.FOLLOW_USER.SUCCESS: {
      if (action.meta.top) {
        const findExperts = state.topExperts.list.findIndex(
          user => user.name === action.meta.username,
        );
        state.topExperts.list.splice(findExperts, 1, {
          ...state.topExperts.list[findExperts],
          youFollows: true,
          pending: false,
        });

        return {
          ...state,
          topExperts: {
            ...state.topExperts,
            list: [...state.topExperts.list],
          },
        };
      }

      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state.users[action.meta.username],
            youFollows: true,
            pending: false,
          },
        },
      };
    }

    case actions.FOLLOW_USER.ERROR: {
      if (action.meta.top) {
        const findExperts = state.topExperts.list.findIndex(
          user => user.name === action.meta.username,
        );

        state.topExperts.list.splice(findExperts, 1, {
          ...state.topExperts.list[findExperts],
          pending: false,
        });

        return {
          ...state,
          topExperts: {
            ...state.topExperts,
            list: [...state.topExperts.list],
          },
        };
      }

      return {
        ...state,
        users: {
          ...state.users,
          [action.meta.username]: {
            ...state.users[action.meta.username],
            pending: false,
          },
        },
      };
    }

    case GET_USER_ACCOUNT_HISTORY.SUCCESS: {
      // we get balance in payload only for guest users
      const { username, balance } = action.payload;
      return {
        ...state,
        users: {
          ...state.users,
          [username]: {
            ...state.users[username],
            balance: get(state, ['users', username, 'balance'], balance),
          },
        },
      };
    }

    default: {
      return state;
    }
  }
}

export const getAllUsers = state => get(state, 'users', {});
export const getUser = createSelector(
  getAllUsers,
  (state, props) => props,
  (users, username) => {
    const user = get(users, username, {});
    console.log('getUser', user);
    return user;
  },
);
// export const getUser = (state, username) => {
//   const all = getAllUsers(state);
//   const user = get(all, [username], {});
//   // console.log(all);
//   return user;
// }
export const getIsUserFetching = createSelector([getUser], user => get(user, 'fetching', false));
// export const getIsUserFetching = (state, username) => getUser(state, username).fetching || false;
export const getIsUserLoaded = createSelector([getUser], user => get(user, 'loaded', false));
// export const getIsUserLoaded = (state, username) => getUser(state, username).loaded || false;
export const getIsUserFailed = createSelector([getUser], user => get(user, 'failed', false));
// export const getIsUserFailed = (state, username) => getUser(state, username).failed || false;

export const getTopExpertsFields = state => state.topExperts;
export const getTopExperts = createSelector([getTopExpertsFields], topExperts =>
  get(topExperts, 'list'),
);
// export const getTopExperts = state => state.topExperts.list;
export const getTopExpertsLoading = createSelector([getTopExpertsFields], topExperts =>
  get(topExperts, 'isFetching', false),
);
// export const getTopExpertsLoading = state => state.topExperts.isFetching;
export const getTopExpertsHasMore = createSelector([getTopExpertsFields], topExperts =>
  get(topExperts, 'hasMore', false),
);
// export const getTopExpertsHasMore = state => state.topExperts.hasMore;

const getRandomExpertsFields = state => state.randomExperts;
export const getRandomExperts = createSelector([getRandomExpertsFields], randomExperts =>
  get(randomExperts, 'list'),
);
// export const getRandomExperts = state => state.randomExperts.list;
export const getRandomExpertsLoaded = createSelector([getRandomExpertsFields], randomExperts =>
  get(randomExperts, 'fetched', false),
);
// export const getRandomExpertsLoaded = state => state.randomExperts.fetched;
export const getRandomExpertsLoading = createSelector([getRandomExpertsFields], randomExperts =>
  get(randomExperts, 'isFetching', false),
);
// export const getRandomExpertsLoading = state => state.randomExperts.isFetching;
