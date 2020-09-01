import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from 'antd';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import ObjectFeed from './ObjectFeed';
import ModalSignUp from '../../components/Navigation/ModalSignUp/ModalSignUp';
import { getIsAuthenticated } from '../../reducers';
import IconButton from '../../components/IconButton';
import { getObjectName } from '../../helpers/wObjectHelper';

const propTypes = {
  history: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,
  wobject: PropTypes.shape().isRequired,
  userName: PropTypes.string.isRequired,
};

const ObjectFeedContainer = ({ history, match, wobject, userName }) => {
  /* redux store */
  const isAuthenticated = useSelector(getIsAuthenticated);

  const handleCreatePost = () => {
    if (wobject && wobject.author_permlink) {
      let redirectUrl = `/editor?object=`;
      redirectUrl += encodeURIComponent(
        `[${wobject.name || wobject.default_name}](${wobject.author_permlink})`,
      );
      if (!isEmpty(wobject.parent)) {
        const parentObject = wobject.parent;
        redirectUrl += `&object=${encodeURIComponent(
          `[${getObjectName(parentObject)}](${parentObject.author_permlink})`,
        )}`;
      }
      history.push(redirectUrl);
    }
  };

  return (
    <React.Fragment>
      {isAuthenticated ? (
        <div>
          <div className="object-feed__row justify-end">
            <IconButton
              icon={<Icon type="plus-circle" />}
              onClick={handleCreatePost}
              caption={
                <FormattedMessage id="write_new_review" defaultMessage="Write a new review" />
              }
            />
          </div>
          <ObjectFeed
            match={match}
            userName={userName}
            history={history}
            handleCreatePost={handleCreatePost}
            wobject={wobject}
          />
        </div>
      ) : (
        <div className="object-feed__row justify-center">
          <ModalSignUp isButton={false} caption="empty_object_profile" />
        </div>
      )}
    </React.Fragment>
  );
};

ObjectFeedContainer.propTypes = propTypes;

export default ObjectFeedContainer;
