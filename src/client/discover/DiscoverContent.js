import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import DiscoverUser from './DiscoverUser';
import ReduxInfiniteScroll from '../vendor/ReduxInfiniteScroll';
import { getTopExperts as getTopExpertsApi } from '../user/usersActions';
import {
  getTopExperts,
  getTopExpertsLoading,
  getTopExpertsHasMore,
  getObjectTypesList,
  getSearchUsersResults,
  getAuthenticatedUserName,
} from '../reducers';
import Loading from '../components/Icon/Loading';
import { getObjectTypes } from '../objectTypes/objectTypesActions';
import { searchUsersAutoCompete } from '../search/searchActions';

const displayLimit = 20;

@connect(
  state => ({
    topExperts: getTopExperts(state),
    topExpertsLoading: getTopExpertsLoading(state),
    hasMoreExperts: getTopExpertsHasMore(state),
    typesList: getObjectTypesList(state),
    searchUsersList: getSearchUsersResults(state),
    username: getAuthenticatedUserName(state),
  }),
  {
    getTopExperts: getTopExpertsApi,
    getObjectTypes,
    searchUsersAutoCompete,
  },
)
class DiscoverContent extends React.Component {
  static propTypes = {
    topExperts: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        weight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        json_metadata: PropTypes.string,
      }),
    ).isRequired,
    getTopExperts: PropTypes.func.isRequired,
    topExpertsLoading: PropTypes.bool.isRequired,
    hasMoreExperts: PropTypes.bool.isRequired,
    typesList: PropTypes.shape().isRequired,
    getObjectTypes: PropTypes.func.isRequired,
    searchUsersAutoCompete: PropTypes.func.isRequired,
    searchString: PropTypes.string,
    searchUsersList: PropTypes.arrayOf(PropTypes.shape()),
  };

  static defaultProps = {
    searchString: '',
    searchUsersList: [],
  };

  componentDidMount() {
    const { typesList, searchString } = this.props;
    if (searchString) {
      this.props.searchUsersAutoCompete(searchString, 100);
    }

    this.props.getTopExperts(20, 0);
    if (isEmpty(typesList)) this.props.getObjectTypes();
  }

  handleLoadMore = () => {
    if (!this.props.topExpertsLoading) {
      this.props.getTopExperts(displayLimit, this.props.topExperts.length);
    }
  };

  render() {
    const {
      topExperts,
      topExpertsLoading,
      hasMoreExperts,
      searchString,
      searchUsersList,
    } = this.props;
    const noUserError = (
      <div className="Discover__message">
        <FormattedMessage
          id="no_user_message"
          defaultMessage="We have not users with this name, please try again."
        />
      </div>
    );
    const mapSearchUsersList = searchUsersList.map(user => ({
      name: user.account,
      wobjects_weight: user.wobjects_weight,
      followers_count: user.followers_count,
    }));

    const searchUsres = mapSearchUsersList.length
      ? mapSearchUsersList.map(expert => (
          <DiscoverUser user={expert} key={expert.name} isReblogged />
        ))
      : noUserError;

    return (
      <div>
        {searchString ? (
          searchUsres
        ) : (
          <ReduxInfiniteScroll
            hasMore={hasMoreExperts}
            loadMore={this.handleLoadMore}
            elementIsScrollable={false}
            loadingMore={topExpertsLoading}
            loader={<Loading />}
          >
            {topExperts.map(expert => (
              <DiscoverUser user={expert} key={expert.name} isReblogged />
            ))}
          </ReduxInfiniteScroll>
        )}
      </div>
    );
  }
}

export default DiscoverContent;
