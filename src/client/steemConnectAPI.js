import hivesigner from 'hivesigner';
import { waivioAPI } from '../waivioApi/ApiClient';
import { getValidTokenData } from './helpers/getToken';

function broadcast(operations, actionAuthor) {
  let operation;
  if (operations[0][0] === 'custom_json') {
    if (operations[0][1].json.includes('reblog')) {
      operation = `waivio_guest_reblog`;
    } else {
      operation = `waivio_guest_${operations[0][1].id}`;
    }
  } else if (operations[0][0] === 'comment') {
    const jsonMetadata = JSON.parse(operations[0][1].json_metadata);
    // eslint-disable-next-line no-param-reassign
    if (actionAuthor) operations[0][1].post_root_author = actionAuthor;
    if (jsonMetadata.comment) {
      // eslint-disable-next-line no-param-reassign
      operations[0][1].guest_root_author = operations[0][1].author;
      // eslint-disable-next-line no-param-reassign
      operations[0][1].author = jsonMetadata.comment.userId;
    }
    operation = `waivio_guest_${operations[0][0]}`;
  } else {
    operation = `waivio_guest_${operations[0][0]}`;
  }
  return waivioAPI.broadcastGuestOperation(operation, operations);
}

async function getUserAccount() {
  const userData = await getValidTokenData();
  if (!userData) return null;
  const account = await waivioAPI.getUserAccount(userData.userData.name, true);
  return { account, name: account.name };
}

function sc2Extended() {
  const isGuest = () => waivioAPI.isGuest;

  const sc2api = new hivesigner.Client({
    app: process.env.STEEMCONNECT_CLIENT_ID,
    baseURL: process.env.STEEMCONNECT_HOST,
    callbackURL: process.env.STEEMCONNECT_REDIRECT_URL,
  });

  const sc2Proto = Object.create(Object.getPrototypeOf(sc2api));

  sc2Proto.broadcastOp = sc2Proto.broadcast;
  sc2Proto.meOp = sc2Proto.me;

  sc2Proto.broadcast = (operations, cb) => {
    if (isGuest()) {
      return broadcast(operations, cb);
    }
    return sc2Proto.broadcastOp(operations);
  };

  sc2Proto.me = () => {
    if (isGuest()) {
      return getUserAccount();
    }
    return sc2Proto.meOp();
  };

  const copied = Object.assign(
    sc2Proto,
    sc2api,
    {
      followObject(follower, followingObject, name, type, cb) {
        const params = {
          required_auths: [],
          required_posting_auths: [follower],
          id: 'follow_wobject',
          json: JSON.stringify([
            'follow',
            {
              user: follower,
              author_permlink: followingObject,
              what: ['feed'],
              object_type: type,
              object_name: name,
              type_operation: 'follow_wobject',
            },
          ]),
        };
        return this.broadcast([['custom_json', params]], cb);
      },
    },
    {
      unfollowObject(unfollower, unfollowingObject, name, type, cb) {
        const params = {
          required_auths: [],
          required_posting_auths: [unfollower],
          id: 'follow_wobject',
          json: JSON.stringify([
            'follow',
            {
              user: unfollower,
              author_permlink: unfollowingObject,
              what: [],
              object_type: type,
              object_name: name,
              type_operation: 'unfollow_wobject',
            },
          ]),
        };
        return this.broadcast([['custom_json', params]], cb);
      },
    },
    {
      rankingObject(username, author, permlink, authorPermlink, rate, cb) {
        const params = {
          required_auths: [],
          required_posting_auths: [username],
          id: 'wobj_rating',
          json: JSON.stringify({ author, permlink, author_permlink: authorPermlink, rate }),
        };

        return this.broadcast([['custom_json', params]], cb);
      },
    },
    {
      settingSessionId(username, sessionId, cb) {
        const params = {
          required_auths: [],
          required_posting_auths: [username],
          id: 'session_id',
          json: JSON.stringify({ session_id: sessionId }),
        };

        return this.broadcast([['custom_json', params]], cb);
      },
    },
  );

  return copied;
}

const api = sc2Extended();

export default api;
