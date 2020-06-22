import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { clearSearchObjectsResults, searchUsersAutoCompete } from '../../search/searchActions';
import { getSearchUsersResults } from '../../reducers';
import Avatar from '../Avatar';

import './SearchUsersAutocomplete.less';

@injectIntl
@connect(
  state => ({
    searchUsersResults: getSearchUsersResults(state),
  }),
  {
    searchUsers: searchUsersAutoCompete,
    clearSearchResults: clearSearchObjectsResults,
  },
)
class SearchUsersAutocomplete extends React.Component {
  static defaultProps = {
    intl: {},
    searchUsersResults: [],
    searchUsers: () => {},
    handleSelect: () => {},
    itemsIdsToOmit: [],
    placeholder: '',
    disabled: false,
    autoFocus: true,
    style: {},
  };
  static propTypes = {
    intl: PropTypes.shape(),
    searchUsersResults: PropTypes.arrayOf(PropTypes.shape),
    searchUsers: PropTypes.func,
    handleSelect: PropTypes.func,
    itemsIdsToOmit: PropTypes.arrayOf(PropTypes.string),
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    autoFocus: PropTypes.bool,
    style: PropTypes.shape({}),
  };

  state = {
    searchString: '',
    isOptionSelected: false,
  };

  debouncedSearchByUser = _.debounce(searchString => this.props.searchUsers(searchString));

  handleSearch = value => {
    this.setState({ searchString: value });
    setTimeout(() => this.completeHandleSearch(value), 800);
  };

  completeHandleSearch = value => {
    const { searchString } = this.state;
    if (searchString === value) {
      this.debouncedSearchByUser(searchString);
    }
  };

  handleChange = value => {
    this.setState({ searchString: value });
  };

  handleSelect = value => {
    const selectedUsers = this.props.searchUsersResults.find(obj => obj.account === value);
    this.props.handleSelect(selectedUsers);
    this.setState({ searchString: '' });
  };

  render() {
    const { searchString } = this.state;
    const { intl, searchUsersResults, itemsIdsToOmit, disabled, autoFocus, style } = this.props;
    const searchUsersOptions = searchString
      ? searchUsersResults
          .filter(obj => !itemsIdsToOmit.includes(obj.account))
          .map(obj => (
            <AutoComplete.Option key={obj.account} label={obj.account} className="SearchUser item">
              <div className="SearchUser">
                <Avatar username={obj.account} size={40} />
                <div className="SearchUser__content">{obj.account}</div>
              </div>
            </AutoComplete.Option>
          ))
      : [];
    return (
      <AutoComplete
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        onSearch={this.handleSearch}
        optionLabelProp={'label'}
        placeholder={
          !this.props.placeholder
            ? intl.formatMessage({
                id: 'objects_auto_complete_placeholder',
                defaultMessage: 'Find objects',
              })
            : this.props.placeholder
        }
        value={searchString}
        autoFocus={autoFocus}
        disabled={disabled}
        style={style}
      >
        {searchUsersOptions}
      </AutoComplete>
    );
  }
}

export default SearchUsersAutocomplete;
