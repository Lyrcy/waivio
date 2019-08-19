import { getIsAuthenticated, getAuthenticatedUserName } from '../reducers';
import { getAllFollowing } from '../helpers/apiHelpers';
import { createAsyncActionType } from '../helpers/stateHelpers';
import * as ApiClient from '../../waivioApi/ApiClient';
import { getUserCoordinatesByIpAdress } from '../components/Maps/mapHelper';
import { rewardPostContainerData } from '../rewards/rewardsHelper';
import { generatePermlink } from '../helpers/wObjectHelper';

require('isomorphic-fetch');

export const FOLLOW_USER = '@user/FOLLOW_USER';
export const FOLLOW_USER_START = '@user/FOLLOW_USER_START';
export const FOLLOW_USER_SUCCESS = '@user/FOLLOW_USER_SUCCESS';
export const FOLLOW_USER_ERROR = '@user/FOLLOW_USER_ERROR';

export const followUser = username => (dispatch, getState, { steemConnectAPI }) => {
  const state = getState();

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return dispatch({
    type: FOLLOW_USER,
    payload: {
      promise: steemConnectAPI.follow(getAuthenticatedUserName(state), username),
    },
    meta: {
      username,
    },
  });
};

export const GET_RECOMMENDED_OBJECTS = '@user/GET_RECOMMENDED_OBJECTS';
export const GET_RECOMMENDED_OBJECTS_START = '@user/GET_RECOMMENDED_OBJECTS_START';
export const GET_RECOMMENDED_OBJECTS_SUCCESS = '@user/GET_RECOMMENDED_OBJECTS_SUCCESS';
export const GET_RECOMMENDED_OBJECTS_ERROR = '@user/GET_RECOMMENDED_OBJECTS_ERROR';

export const getRecommendedObj = () => dispatch =>
  dispatch({
    type: GET_RECOMMENDED_OBJECTS,
    payload: {
      promise: ApiClient.getRecommendedObjects(),
    },
  });

export const UNFOLLOW_USER = '@user/UNFOLLOW_USER';
export const UNFOLLOW_USER_START = '@user/UNFOLLOW_USER_START';
export const UNFOLLOW_USER_SUCCESS = '@user/UNFOLLOW_USER_SUCCESS';
export const UNFOLLOW_USER_ERROR = '@user/UNFOLLOW_USER_ERROR';

export const unfollowUser = username => (dispatch, getState, { steemConnectAPI }) => {
  const state = getState();

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return dispatch({
    type: UNFOLLOW_USER,
    payload: {
      promise: steemConnectAPI.unfollow(getAuthenticatedUserName(state), username),
    },
    meta: {
      username,
    },
  });
};

export const GET_FOLLOWING = '@user/GET_FOLLOWING';
export const GET_FOLLOWING_START = '@user/GET_FOLLOWING_START';
export const GET_FOLLOWING_SUCCESS = '@user/GET_FOLLOWING_SUCCESS';
export const GET_FOLLOWING_ERROR = '@user/GET_FOLLOWING_ERROR';

export const getFollowing = username => (dispatch, getState) => {
  const state = getState();

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_FOLLOWING_ERROR });
  }

  const targetUsername = username || getAuthenticatedUserName(state);

  return dispatch({
    type: GET_FOLLOWING,
    meta: targetUsername,
    payload: {
      promise: getAllFollowing(targetUsername),
    },
  });
};

export const GET_FOLLOWING_OBJECTS = '@user/GET_FOLLOWING_OBJECTS';
export const GET_FOLLOWING_OBJECTS_START = '@user/GET_FOLLOWING_OBJECTS_START';
export const GET_FOLLOWING_OBJECTS_SUCCESS = '@user/GET_FOLLOWING_OBJECTS_SUCCESS';
export const GET_FOLLOWING_OBJECTS_ERROR = '@user/GET_FOLLOWING_OBJECTS_ERROR';

export const getFollowingObjects = username => (dispatch, getState) => {
  const state = getState();

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_FOLLOWING_ERROR });
  }

  const targetUsername = username || getAuthenticatedUserName(state);
  return dispatch({
    type: GET_FOLLOWING_OBJECTS,
    payload: {
      promise: ApiClient.getAllFollowingObjects(targetUsername),
    },
  });
};

export const GET_NOTIFICATIONS = createAsyncActionType('@user/GET_NOTIFICATIONS');

export const getNotifications = username => (dispatch, getState, { busyAPI }) => {
  const state = getState();

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_NOTIFICATIONS.ERROR });
  }

  const targetUsername = username || getAuthenticatedUserName(state);

  return dispatch({
    type: GET_NOTIFICATIONS.ACTION,
    meta: targetUsername,
    payload: {
      promise: busyAPI.sendAsync('get_notifications', [targetUsername]),
    },
  });
};

export const GET_USER_LOCATION = createAsyncActionType('@user/GET_USER_LOCATION');

export const getCoordinates = () => dispatch =>
  dispatch({
    type: GET_USER_LOCATION.ACTION,
    payload: getUserCoordinatesByIpAdress(),
  });

export const assignProposition = ({ companyAuthor, companyPermlink, companyId, objPermlink }) => (
  dispatch,
  getState,
  { steemConnectAPI },
) => {
  const username = getAuthenticatedUserName(getState());
  const commentOp = [
    'comment',
    {
      parent_author: companyAuthor,
      parent_permlink: companyPermlink,
      author: username,
      permlink: `reserve-${companyId}-${generatePermlink()}`,
      title: 'reserve object for rewards',
      body: `User ${username} reserve object: ${objPermlink}, from campaign ${companyId}`,
      json_metadata: JSON.stringify({
        waivioRewards: { type: 'waivio_assign_campaign', object: objPermlink },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .catch(error => reject(error));
  });
};

export const declineProposition = (companyAuthor, companyPermlink, companyId, objPermlink) => (
  dispatch,
  getState,
  { steemConnectAPI },
) => {
  const username = getAuthenticatedUserName(getState());
  const commentOp = [
    'comment',
    {
      parent_author: rewardPostContainerData.author,
      parent_permlink: rewardPostContainerData.permlink,
      author: username,
      permlink: `reserve-${companyId}-${generatePermlink()}`,
      title: 'reject object for rewards',
      body: `User ${username} reject object: ${objPermlink}, from campaign ${companyId}`,
      json_metadata: JSON.stringify({
        waivioRewards: { type: 'waivio_decline_campaign', approved_object: objPermlink },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .catch(error => reject(error));
  });
};
export const activateCampaign = company => (dispatch, getState, { steemConnectAPI }) => {
  const username = getAuthenticatedUserName(getState());
  const commentOp = [
    'comment',
    {
      parent_author: rewardPostContainerData.author,
      parent_permlink: rewardPostContainerData.permlink,
      author: username,
      permlink: `reserve-${'bla'}-${generatePermlink()}`,
      title: 'reserve object for rewards',
      body: `Campaign ${company.name} was activated by ${username} `,
      json_metadata: JSON.stringify({
        // eslint-disable-next-line no-underscore-dangle
        waivioRewards: { type: 'waivio_activate_campaign', campaign_id: company._id },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .catch(error => reject(error));
  });
};
