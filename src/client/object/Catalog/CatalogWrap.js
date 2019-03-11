import { Breadcrumb } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import React from 'react';
import { connect } from 'react-redux';
import { isEmpty, map, forEach } from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import CatalogItem from './CatalogItem';
import { getFieldWithMaxWeight, sortListItemsBy } from '../wObjectHelper';
import { getClientWObj } from '../../adapters';
import { objectFields } from '../../../common/constants/listOfFields';
import AddItemModal from './AddItemModal/AddItemModal';
import CreateObjectModal from '../../post/CreateObjectModal/CreateObject';
import SortSelector from '../../components/SortSelector/SortSelector';
import { getObject } from '../../../../src/waivioApi/ApiClient';
import * as wobjectActions from '../../../client/object/wobjectsActions';
import * as notificationActions from '../../../client/app/Notification/notificationActions';
import './CatalogWrap.less';

@withRouter
@injectIntl
@connect(
  null,
  {
    createObject: wobjectActions.createWaivioObject,
    notify: notificationActions.notify,
  },
)
class CatalogWrap extends React.Component {
  static propTypes = {
    wobject: PropTypes.shape(),
    intl: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    isEditMode: PropTypes.bool.isRequired,
    createObject: PropTypes.func.isRequired,
    notify: PropTypes.func,
  };
  static defaultProps = {
    wobject: {},
    notify: () => {},
  };

  constructor(props) {
    super(props);

    const initialSort =
      props.wobject &&
      props.wobject[objectFields.sorting] &&
      props.wobject[objectFields.sorting].length
        ? 'custom'
        : 'rank';
    const customSortOrder = initialSort === 'custom' ? props.wobject[objectFields.sorting] : null;
    this.state = {
      sort: initialSort,
      breadcrumb: [
        { name: getFieldWithMaxWeight(props.wobject, objectFields.name), link: props.match.url },
      ],
      listItems:
        (props.wobject &&
          props.wobject.listItems &&
          sortListItemsBy(
            props.wobject.listItems.map(item => getClientWObj(item)),
            initialSort,
            customSortOrder,
          )) ||
        [],
    };
  }

  componentDidMount() {
    const { match, history } = this.props;
    if (this.props.match.params.itemId) {
      history.push(`/object/${match.params.name}/list`);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match !== this.props.match) {
      const nextTarget = nextProps.match.url.split('/').pop();
      if (nextTarget === 'list') {
        if (nextProps.wobject && nextProps.wobject.listItems) {
          const sort =
            nextProps.wobject[objectFields.sorting] &&
            nextProps.wobject[objectFields.sorting].length
              ? 'custom'
              : 'rank';
          this.setState({
            sort,
            listItems: sortListItemsBy(
              nextProps.wobject.listItems.map(item => getClientWObj(item)),
              sort,
              sort === 'custom' ? nextProps.wobject[objectFields.sorting] : null,
            ),
            breadcrumb: [
              {
                name: getFieldWithMaxWeight(nextProps.wobject, objectFields.name),
                link: nextProps.match.url,
              },
            ],
          });
        }
      } else if (nextTarget !== this.props.match.params.itemId) {
        getObject(nextTarget).then(res => {
          const listItems =
            (res && res.listItems && res.listItems.map(item => getClientWObj(item))) || [];
          this.setState(prevState => {
            let breadcrumb = [];
            if (prevState.breadcrumb.some(crumb => crumb.link.includes(nextTarget))) {
              forEach(prevState.breadcrumb, crumb => {
                breadcrumb.push(crumb);
                return !crumb.link.includes(nextTarget);
              });
            } else {
              breadcrumb = [
                ...prevState.breadcrumb,
                { name: getFieldWithMaxWeight(res, objectFields.name), link: nextProps.match.url },
              ];
            }
            return {
              listItems: sortListItemsBy(listItems, this.state.sort),
              breadcrumb,
            };
          });
        });
      }
    }
  }

  handleSortChange = sort => {
    const sortOrder = this.props.wobject && this.props.wobject[objectFields.sorting];
    const listItems = sortListItemsBy(this.state.listItems, sort, sortOrder);
    this.setState({ sort, listItems });
  };

  handleCreateObject = (wobj, follow) => {
    const { intl, notify, createObject } = this.props;
    createObject(wobj, follow)
      .then(() =>
        notify(
          intl.formatMessage({
            id: 'create_object_success',
            defaultMessage: 'Object has been created',
          }),
          'success',
        ),
      )
      .catch(() =>
        notify(
          intl.formatMessage({
            id: 'create_object_error',
            defaultMessage: 'Something went wrong. Object is not created',
          }),
          'error',
        ),
      );
  };

  render() {
    const { sort, listItems, breadcrumb } = this.state;
    const { isEditMode, wobject, intl, match } = this.props;
    const listBaseUrl = `/object/${match.params.name}/list`;

    const sortSelector =
      wobject && wobject[objectFields.sorting] && wobject[objectFields.sorting].length ? (
        <SortSelector sort={sort} onChange={this.handleSortChange}>
          <SortSelector.Item key="custom">
            <FormattedMessage id="custom" defaultMessage="Custom" />
          </SortSelector.Item>
          <SortSelector.Item key="rank">
            <FormattedMessage id="rank" defaultMessage="Rank" />
          </SortSelector.Item>
          <SortSelector.Item key="by-name-asc">
            <FormattedMessage id="by-name-asc" defaultMessage="a . . z">
              {msg => msg.toUpperCase()}
            </FormattedMessage>
          </SortSelector.Item>
          <SortSelector.Item key="by-name-desc">
            <FormattedMessage id="by-name-desc" defaultMessage="z . . a">
              {msg => msg.toUpperCase()}
            </FormattedMessage>
          </SortSelector.Item>
        </SortSelector>
      ) : (
        <SortSelector sort={sort} onChange={this.handleSortChange}>
          <SortSelector.Item key="rank">
            <FormattedMessage id="rank" defaultMessage="Rank" />
          </SortSelector.Item>
          <SortSelector.Item key="by-name-asc">
            <FormattedMessage id="by-name-asc" defaultMessage="a . . z">
              {msg => msg.toUpperCase()}
            </FormattedMessage>
          </SortSelector.Item>
          <SortSelector.Item key="by-name-desc">
            <FormattedMessage id="by-name-desc" defaultMessage="z . . a">
              {msg => msg.toUpperCase()}
            </FormattedMessage>
          </SortSelector.Item>
        </SortSelector>
      );

    return (
      <div>
        {isEditMode && (
          <div className="CatalogWrap__add-item">
            <AddItemModal wobject={wobject} itemsIdsToOmit={listItems.map(item => item.id)} />
            <CreateObjectModal handleCreateObject={this.handleCreateObject} />
          </div>
        )}

        <div className="CatalogWrap__sort">{sortSelector}</div>

        <div className="CatalogWrap">
          <div className="CatalogWrap__breadcrumb">
            <Breadcrumb separator={'>'}>
              {map(breadcrumb, crumb => (
                <Breadcrumb.Item key={`crumb-${crumb.name}`}>
                  <Link
                    className="CatalogWrap__breadcrumb__link"
                    to={{ pathname: crumb.link }}
                    title={`${intl.formatMessage({ id: 'GoTo', defaultMessage: 'Go to' })} ${
                      crumb.name
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>
          {listItems.length ? (
            <div>
              {!isEmpty(listItems) ? (
                map(listItems, listItem => {
                  const linkTo =
                    listItem.type && listItem.type.toLowerCase() === 'list'
                      ? { pathname: `${listBaseUrl}/${listItem.id}` }
                      : { pathname: `/object/${listItem.id}` };
                  return (
                    <div key={`category-${listItem.id}`}>
                      <Link
                        to={linkTo}
                        title={`${intl.formatMessage({
                          id: 'GoTo',
                          defaultMessage: 'Go to',
                        })} ${listItem.name}`}
                      >
                        <CatalogItem wobject={listItem} />
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div>
                  {intl.formatMessage({
                    id: 'emptyList',
                    defaultMessage: 'This list is empty',
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              {intl.formatMessage({ id: 'emptyList', defaultMessage: 'This list is empty' })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CatalogWrap;
