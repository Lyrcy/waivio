import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import * as accountHistoryConstants from '../../common/constants/accountHistory';

const CustomJSONMessage = ({ actionDetails }) => {
  const actionJSON = JSON.parse(actionDetails.json);
  const customActionType = actionJSON[0];
  const customActionDetails = actionJSON[1];

  console.log('actionJSON: ', actionJSON);

  if (customActionType === accountHistoryConstants.FOLLOW) {
    let messageId = '';
    let messageDefault = '';

    switch (customActionDetails.what[0]) {
      case 'ignore':
        messageId = 'ignore_user';
        messageDefault = 'Ignored {following}';
        break;
      case 'blog':
        messageId = 'followed_user';
        messageDefault = 'Followed {following}';
        break;
      default:
        messageId = 'Followed_wobject';
        messageDefault = 'Followed {object_type} {name}';
        break;
    }

    return (
      <span className="capitalize-text">
        <FormattedMessage
          id={messageId}
          defaultMessage={messageDefault}
          values={{
            following: (
              <Link to={`/@${customActionDetails.following}`}>{customActionDetails.following}</Link>
            ),
            object_type: 'type',
            name: (
              <Link to={`/object/${customActionDetails.author_permlink}`}>
                {customActionDetails.author_permlink}
              </Link>
            ),
          }}
        />
      </span>
    );
  } else if (customActionType === accountHistoryConstants.REBLOG) {
    return (
      <span className="capitalize-text">
        <FormattedMessage
          id="reblogged_post"
          defaultMessage="reblogged {postLink}"
          values={{
            postLink: (
              <Link
                to={`/@${customActionDetails.author}/${customActionDetails.permlink}`}
              >{`@${customActionDetails.author}/${customActionDetails.permlink}`}</Link>
            ),
          }}
        />
      </span>
    );
  }

  return null;
};

CustomJSONMessage.propTypes = {
  actionDetails: PropTypes.shape().isRequired,
};

export default CustomJSONMessage;
