import {message} from 'antd';
import {withRouter} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux'
import {get, has, isEmpty, isEqual, map, uniq, filter, max, min, some, size} from 'lodash';
import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import {
  getFieldWithMaxWeight,
  getListItems,
  sortListItemsBy,
  getListSorting,
} from '../wObjectHelper';

import {objectFields, statusNoVisibleItem} from '../../../common/constants/listOfFields';
import OBJ_TYPE from '../const/objectTypes';
import AddItemModal from './AddItemModal/AddItemModal';
import {getObject, getObjectsByIds} from '../../../waivioApi/ApiClient';
import * as wobjectActions from '../../../client/object/wobjectsActions';
import {
  getSuitableLanguage,
  getAuthenticatedUserName,
  getPendingUpdate,
  getIsLoaded,
  getFilteredObjectsMap,
} from '../../reducers';
import ObjectCardView from '../../objectCard/ObjectCardView';
import CategoryItemView from './CategoryItemView/CategoryItemView';
import {getObjectName, hasType, parseWobjectField} from '../../helpers/wObjectHelper';
import BodyContainer from '../../containers/Story/BodyContainer';
import Loading from '../../components/Icon/Loading';
import * as apiConfig from '../../../waivioApi/config.json';

import {
  assignProposition,
  declineProposition,
  pendingUpdateSuccess,
} from '../../user/userActions';

import * as ApiClient from '../../../waivioApi/ApiClient';
import Proposition from '../../rewards/Proposition/Proposition';
import Campaign from '../../rewards/Campaign/Campaign';

import './CatalogWrap.less';
import CatalogSorting from "./CatalogSorting/CatalogSorting";

@withRouter
@injectIntl
@connect(
  state => ({
    locale: getSuitableLanguage(state),
    loaded: getIsLoaded(state),
    username: getAuthenticatedUserName(state),
    wobjects: getFilteredObjectsMap(state),
    pendingUpdate: getPendingUpdate(state),
  }),
  {
    addItemToWobjStore: wobjectActions.addListItem,
    assignProposition,
    declineProposition,
    pendingUpdateSuccess,
  },
)

const CatalogWrap = ({props}) => {
  const dispatch = useDispatch();

  const locale = useSelector((state) => getSuitableLanguage(state));
  const loaded = useSelector((state) => getIsLoaded(state));
  const username = useSelector((state) => getAuthenticatedUserName(state));
  const wobjects = useSelector((state) => getFilteredObjectsMap(state));
  const pendingUpdate = useSelector((state) => getPendingUpdate(state));

  const [loadingAssignDiscard, serLoadingAssignDiscard] = useState(false);
  const [loadingPropositions, setLoadingPropositions] = useState(false);
  const [propositions, setPropositions] = useState([]);
  const [sort, sorting] = useState('recency');
  const [isAssign, setIsAssign] = useState(false);
  const [needUpdate, setNeedUpdate] = useState(true);


  useEffect(() => {
    const {userName, match, wobject, locale} = props;
    const {sort} = this.state;

    if (!isEmpty(wobject)) {
      getPropositions({userName, match, requiredObject: wobject.author_permlink, sort});
    } else {
      getObject(match.params.name, userName, locale).then(wObject => {
        const requiredObject = wObject.author_permlink;
        if (requiredObject) {
          getPropositions({userName, match, requiredObject, sort});
        }
      });
    }
  }, [])

  componentWillReceiveProps(nextProps)
  {
    // const newPath = nextProps.location.hash.slice(1);
    // const currPath = this.props.location.hash.slice(1);
    // const isReloadingPage = nextProps.match.params.name !== this.props.match.params.name;
    // if (!isReloadingPage && newPath !== currPath) {
    //   const nextListPermlink = newPath.split('/').pop() || 'list';
    //   const currListPermlink = currPath.split('/').pop();
    //   const isTopLevelList = newPath.split('/').length === 1;
    //   if (nextListPermlink === 'list' || isTopLevelList) {
    //     this.setState(this.getNextStateFromProps(nextProps));
    //   } else if (nextListPermlink !== currListPermlink) {
    //     this.getObjectFromApi(nextListPermlink, nextProps.location.hash);
    //   }
    // }
    if (!isEqual(props.wobject.author_permlink, nextProps.wobject.author_permlink)) {
      this.setState(getNextStateFromProps(nextProps));
    }
  }

  const getRequiredObject = (obj, match) => {
    let requiredObject;
    if (!isEmpty(obj.listItems)) {
      requiredObject = get(obj, ['listItems', '0', 'parent', 'author_permlink']);
    } else {
      requiredObject = match.params.campaignParent || match.params.name;
    }
    return requiredObject;
  };

  const getObjectFromApi = (permlink, path) => {
    const {userName, locale} = props;

    this.setState({loading: true});

    getObject(permlink, userName, locale)
      .then(res => {
        this.setState(() => {
          // let breadcrumb = [];
          // if (prevState.breadcrumb.some(crumb => crumb.path.includes(permlink))) {
          //   forEach(prevState.breadcrumb, crumb => {
          //     breadcrumb.push(crumb);
          //     return !crumb.path.includes(permlink);
          //   });
          // } else {
          //   breadcrumb = [
          //     ...prevState.breadcrumb,
          //     {
          //       id: res.author_permlink,
          //       name: getObjectName(res),
          //       path,
          //     },
          //   ];
          // }

          const sorting = getListSorting(res);

          // Обновить стейт локальный через хуки
          return {
            sort: sorting.type,
            wobjNested: res,
            listItems: sortListItemsBy(res.listItems, sorting.type, sorting.order),
            loading: false,
          };

        });
      })
      .catch(() => this.setState({loading: false}));
  };

  const getNextStateFromProps = ({wobject, location}, isInitialState = false) => {
    let sorting = {};
    let sortedItems = [];
    const breadcrumb = [];
    const items = getListItems(wobject);

    if (size(items)) {
      sorting = getListSorting(wobject);
      if (wobject.object_type === OBJ_TYPE.LIST) {
        breadcrumb.push({
          id: wobject.author_permlink,
          name: getObjectName(wobject),
          path: '',
        });
      }

      if (location.hash) {
        if (!isInitialState) this.setState({loading: true});
        const permlinks = location.hash.slice(1).split('/');
        const {locale} = props;
        getObjectsByIds({authorPermlinks: permlinks, locale}).then(res => {
          const crumbs = res.wobjects.map(obj => ({
            id: obj.author_permlink,
            name: obj.name,
            path: `${obj.author_permlink}`,
          }));
          // if (!isInitialState) this.setState({breadcrumb: [...breadcrumb, ...crumbs]});
          getObjectFromApi(permlinks[permlinks.length - 1], location.hash);
        });
      } else {
        sortedItems = sortListItemsBy(items, sorting.type, sorting.order);
      }
    }
    return {
      sort: sorting.type,
      listItems: sortedItems,
      breadcrumb,
      wobjNested: null,
      needUpdate: true,
    };
  };

  const handleAddItem = listItem => {
    const {breadcrumb, listItems} = this.state;
    const {wobject} = props;

    this.setState({
      listItems: sortListItemsBy([...listItems, listItem], 'recency'),
    });
    if (wobject.object_type === OBJ_TYPE.LIST && !isEmpty(breadcrumb)) {
      this.props.addItemToWobjStore(listItem);
    }
  };

  const handleSortChange = sort => {
    const sortOrder = props.wobject && props.wobject[objectFields.sorting];
    const listItems = sortListItemsBy(this.state.listItems, sort, sortOrder);
    this.setState({sort, listItems});
  };

  const getPropositions = ({userName, match, requiredObject, sort}) => {
    this.setState({
      loadingPropositions: true, needUpdate: false
    });
    ApiClient.getPropositions({
      userName,
      match,
      requiredObject,
      sort: 'reward',
      locale: props.locale,
    }).then(data => {
      this.setState({
        // Обновить стейт локальный через хуки

        propositions: data.campaigns,
        hasMore: data.hasMore,
        sponsors: data.sponsors,
        sort,
        loadingCampaigns: false,
        loadingPropositions: false,
      });
    });
  };

  const renderProposition = (propositions, listItem) =>
    map(propositions, proposition =>
      map(
        filter(
          proposition.objects,
          object => get(object, ['object', 'author_permlink']) === listItem.author_permlink,
        ),
        wobj =>
          wobj.object &&
          wobj.object.author_permlink && (
            <Proposition
              proposition={proposition}
              wobj={wobj.object}
              wobjPrice={wobj.reward}
              assignCommentPermlink={wobj.permlink}
              assignProposition={assignPropositionHandler}
              discardProposition={discardProposition}
              authorizedUserName={props.userName}
              loading={loadingAssignDiscard}
              key={`${wobj.object.author_permlink}`}
              assigned={wobj.assigned}
              history={props.history}
              isAssign={isAssign}
              match={props.match}
            />
          ),
      ),
    );

  const renderCampaign = propositions => {
    const {userName} = this.state;
    const minReward = propositions
      ? min(map(propositions, proposition => proposition.reward))
      : null;
    const rewardPriceCatalogWrap = minReward ? `${minReward.toFixed(2)} USD` : '';
    const maxReward = propositions
      ? max(map(propositions, proposition => proposition.reward))
      : null;
    const rewardMaxCatalogWrap = maxReward !== minReward ? `${maxReward.toFixed(2)} USD` : '';

    return (
      <Campaign
        proposition={propositions[0]}
        filterKey="all"
        rewardPricePassed={!rewardMaxCatalogWrap ? rewardPriceCatalogWrap : null}
        rewardMaxPassed={rewardMaxCatalogWrap || null}
        key={`${propositions[0].required_object.author_permlink}${propositions[0].required_object.createdAt}`}
        userName={userName}
      />
    );
  };

  const getListRow = (listItem, objects) => {
    const {propositions} = this.state;
    const isList = listItem.object_type === OBJ_TYPE.LIST || listItem.type === OBJ_TYPE.LIST;
    const isMatchedPermlinks = some(objects, object => object.includes(listItem.author_permlink));
    const status = get(parseWobjectField(listItem, 'status'), 'title');

    if (statusNoVisibleItem.includes(status)) return null;

    let item;

    if (isList) {
      item = <CategoryItemView wObject={listItem} location={location}/>;
    } else if (objects.length && isMatchedPermlinks) {
      item = renderProposition(propositions, listItem);
    } else {
      item = <ObjectCardView wObject={listItem} passedParent={props.wobject}/>;
    }

    return <div key={`category-${listItem.author_permlink}`}>{item}</div>;
  };

  const getMenuList = () => {
    const {listItems, breadcrumb, propositions} = this.state;
    let listRow;
    if (propositions) {
      if (isEmpty(listItems) && !isEmpty(breadcrumb)) {
        return (
          <div>
            {this.props.intl.formatMessage({
              id: 'emptyList',
              defaultMessage: 'This list is empty',
            })}
          </div>
        );
      }

      const campaignObjects = map(propositions, item =>
        map(item.objects, obj => get(obj, ['object', 'author_permlink'])),
      );
      listRow = map(listItems, listItem => getListRow(listItem, campaignObjects));
    }
    return listRow;
  };

  const assignPropositionHandler = ({
                                      companyAuthor,
                                      companyPermlink,
                                      resPermlink,
                                      objPermlink,
                                      companyId,
                                      primaryObjectName,
                                      secondaryObjectName,
                                      amount,
                                      proposition,
                                      proposedWobj,
                                      userName,
                                      currencyId,
                                    }) => {
    const appName = apiConfig[process.env.NODE_ENV].appName || 'waivio';

    this.setState({loadingAssignDiscard: true});

    return this.props
      .assignProposition({
        companyAuthor,
        companyPermlink,
        objPermlink,
        resPermlink,
        appName,
        primaryObjectName,
        secondaryObjectName,
        amount,
        proposition,
        proposedWobj,
        userName,
        currencyId,
      })
      .then(() => {
        message.success(
          this.props.intl.formatMessage({
            id: 'assigned_successfully_update',
            defaultMessage: 'Assigned successfully. Your new reservation will be available soon.',
          }),
        );

        const updatedPropositions = this.updateProposition(
          companyId,
          true,
          objPermlink,
          companyAuthor,
        );

        this.setState({
          propositions: updatedPropositions,
          loadingAssignDiscard: false,
          isAssign: true,
        });
        return {isAssign: true};
      })
      .catch(e => {
        this.setState({loadingAssignDiscard: false, isAssign: false});
        throw e;
      });
  };

  const updateProposition = (propsId, isAssign, objPermlink, companyAuthor) =>
    this.state.propositions.map(proposition => {
      const updatedProposition = proposition;
      const propositionId = get(updatedProposition, '_id');

      if (propositionId === propsId) {
        updatedProposition.objects.forEach((object, index) => {
          if (object.object.author_permlink === objPermlink) {
            updatedProposition.objects[index].assigned = isAssign;
          } else {
            updatedProposition.objects[index].assigned = null;
          }
        });
      }

      if (updatedProposition.guide.name === companyAuthor && propositionId !== propsId) {
        updatedProposition.isReservedSiblingObj = true;
      }
      return updatedProposition;
    });

  const discardProposition = ({
                                companyAuthor,
                                companyPermlink,
                                companyId,
                                objPermlink,
                                unreservationPermlink,
                                reservationPermlink,
                              }) => {
    this.setState({loadingAssignDiscard: true});
    return this.props
      .declineProposition({
        companyAuthor,
        companyPermlink,
        companyId,
        objPermlink,
        unreservationPermlink,
        reservationPermlink,
      })
      .then(() => {
        const updatedPropositions = updateProposition(companyId, false, objPermlink);
        this.setState({
          propositions: updatedPropositions,
          loadingAssignDiscard: false,
          isAssign: false,
        });
        return {isAssign: false};
      })
      .catch(e => {
        message.error(e.error_description);
        this.setState({loadingAssignDiscard: false, isAssign: true});
      });
  };

  const {isEditMode, wobject} = props;
  const currWobject = wobject;
  const itemsIdsToOmit = uniq([
    ...listItems.map(item => item.id),
    ...breadcrumb.map(crumb => crumb.id),
  ]);
  const isListObject =
    hasType(currWobject, OBJ_TYPE.LIST) || (!wobjNested && has(wobject, 'menuItems'));

  return (
    <div>
      {!hasType(currWobject, OBJ_TYPE.PAGE) && (
        <React.Fragment>
          {!isEmpty(propositions) && renderCampaign(propositions)}
          <div className="CatalogWrap__breadcrumb">
            {get(wobjNested, [objectFields.title], undefined) && (
              <div className="fw5 pt3">{wobjNested.title}</div>
            )}
          </div>

          {isEditMode && (
            <div className="CatalogWrap__add-item">
              <AddItemModal
                wobject={currWobject}
                itemsIdsToOmit={itemsIdsToOmit}
                onAddItem={handleAddItem}
              />
            </div>
          )}
          {(isListObject && loading) || loadingPropositions ? (
            <Loading/>
          ) : (
            <React.Fragment>
              <div className="CatalogWrap__sort">
                <CatalogSorting sort={sort} currWobject={currWobject} handleSortChange={handleSortChange}/>
              </div>
              <div className="CatalogWrap">
                <div>{getMenuList()}</div>
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
      {!isEmpty(wobjNested) && hasType(wobjNested, OBJ_TYPE.PAGE) && (
        <BodyContainer full body={getFieldWithMaxWeight(currWobject, objectFields.pageContent)}/>
      )}
    </div>
  );
};

CatalogWrap.propTypes = {
  intl: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  match: PropTypes.shape().isRequired,
  locale: PropTypes.string,
  addItemToWobjStore: PropTypes.func.isRequired,
  wobject: PropTypes.shape(),
  history: PropTypes.shape().isRequired,
  isEditMode: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  assignProposition: PropTypes.func.isRequired,
  declineProposition: PropTypes.func.isRequired,
};

CatalogWrap.defaultProps = {
  wobject: {},
  locale: 'en-US',
  userName: '',
};


export default CatalogWrap;
