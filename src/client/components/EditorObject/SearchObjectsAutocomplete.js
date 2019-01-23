import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { AutoComplete } from 'antd';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { clearSearchObjectsResults, searchObjectsAutoCompete } from '../../search/searchActions';
import { getSearchObjectsResults } from '../../reducers';
import './SearchObjectsAutocomplete.less';
import { linkRegex } from '../../helpers/regexHelpers';
import ObjectRank from '../../object/ObjectRank';

@injectIntl
@connect(
  state => ({
    searchObjectsResults: getSearchObjectsResults(state),
  }),
  {
    searchObjects: searchObjectsAutoCompete,
    clearSearchResults: clearSearchObjectsResults,
  },
)
class SearchObjectsAutocomplete extends Component {
  static defaultProps = {
    style: { width: '100%' },
    searchObjectsResults: [],
    linkedObjectsIds: [],
  };

  static propTypes = {
    linkedObjectsIds: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.shape().isRequired,
    style: PropTypes.shape(),
    searchObjectsResults: PropTypes.arrayOf(PropTypes.object),
    searchObjects: PropTypes.func.isRequired,
    clearSearchResults: PropTypes.func.isRequired,
    handleSelect: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
      isOptionSelected: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleChange(value = '') {
    if (!value) this.props.clearSearchResults();
    const searchString = value.toLowerCase();
    this.setState(prevState =>
      prevState.isOptionSelected ? { searchString: '', isOptionSelected: false } : { searchString },
    );
  }

  debouncedSearch = _.debounce(val => this.props.searchObjects(val), 300);
  handleSearch(value) {
    let val = value;
    const link = val.match(linkRegex);
    if (link && link.length > 0 && link[0] !== '') {
      const permlink = link[0].split('/');
      val = permlink[permlink.length - 1].replace('@', '');
    }
    if (val) {
      this.debouncedSearch(val);
    }
  }

  handleSelect(objId) {
    this.setState({ isOptionSelected: true });
    this.props.clearSearchResults();
    const selectedObject = this.props.searchObjectsResults.find(obj => obj.id === objId);
    this.props.handleSelect(
      selectedObject || {
        author_permlink: objId,
        fields: [
          {
            name: 'name',
            body: this.state.searchString,
          },
        ],
        isNew: true,
      },
    );
  }
  render() {
    const { searchString } = this.state;
    const { intl, style, searchObjectsResults, linkedObjectsIds } = this.props;
    const getObjMarkup = obj => (
      <div className="obj-search-option">
        <img className="obj-search-option__avatar" src={obj.avatar} alt={obj.title || ''} />
        <div className="obj-search-option__info">
          <span className="obj-search-option__text">
            {obj.name}
            <div className="ObjectHeader__rank">
              <ObjectRank rank={obj.rank} />
            </div>
          </span>
          <span className="obj-search-option__text">{obj.title}</span>
        </div>
      </div>
    );
    const searchObjectsOptions = searchString
      ? searchObjectsResults
          .filter(obj => !linkedObjectsIds.includes(obj.id))
          .map(obj => <AutoComplete.Option key={obj.id}>{getObjMarkup(obj)}</AutoComplete.Option>)
      : [];
    return (
      <AutoComplete
        style={style}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        onSearch={this.handleSearch}
        placeholder={intl.formatMessage({
          id: 'objects_auto_complete_placeholder',
          defaultMessage: 'Find',
        })}
        value={searchString}
        allowClear
      >
        {searchObjectsOptions}
      </AutoComplete>
    );
  }
}

export default SearchObjectsAutocomplete;
