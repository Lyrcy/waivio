import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { getAuthenticatedUser } from '../../reducers';
import Avatar from '../Avatar';
import './QuickPostEditor.less';

const QuickPostEditor = ({ history }) => {
  const user = useSelector(getAuthenticatedUser, shallowEqual);

  const handleOnClick = () => {
    history.push('/editor');
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="QuickPostEditor" onClick={handleOnClick}>
      <div className="QuickPostEditor__contents">
        <div className="QuickPostEditor__avatar">
          <Avatar username={user.name} size={40} />
        </div>
        <FormattedMessage id={'write_quick_post'} defaultMessage={'Write quick post'} />
      </div>
    </div>
  );
};

QuickPostEditor.propTypes = {
  history: PropTypes.shape().isRequired,
};

export default QuickPostEditor;
