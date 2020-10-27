import { withRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { get, isEmpty, map, filter, max, min, some } from 'lodash';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { sortListItemsBy } from '../wObjectHelper';
import { objectFields, statusNoVisibleItem } from '../../../common/constants/listOfFields';
import OBJ_TYPE from '../const/objectTypes';
import AddItemModal from './AddItemModal/AddItemModal';
import { getObject } from '../../../waivioApi/ApiClient';
import { getSuitableLanguage, getWobjectBreadCrumbs } from '../../reducers';
import ObjectCardView from '../../objectCard/ObjectCardView';
import CategoryItemView from './CategoryItemView/CategoryItemView';
import { getPermLink, hasType, parseWobjectField } from '../../helpers/wObjectHelper';
import BodyContainer from '../../containers/Story/BodyContainer';
import Loading from '../../components/Icon/Loading';
import Campaign from '../../rewards/Campaign/Campaign';
import CatalogSorting from './CatalogSorting/CatalogSorting';
import CatalogBreadcrumb from './CatalogBreadcrumb/CatalogBreadcrumb';
import { setWobjectForBreadCrumbs } from '../wobjActions';
import PropositionListContainer from '../../rewards/Proposition/PropositionList/PropositionListContainer';
import './CatalogWrap.less';

const CatalogWrap = props => {
  const { userName, wobject, isEditMode, intl, location } = props;

  const dispatch = useDispatch();
  const locale = useSelector(getSuitableLanguage);
  const currentWobject = useSelector(getWobjectBreadCrumbs);
  const [propositions, setPropositions] = useState([]);
  const [sort, setSorting] = useState('recency');
  const [listItems, setListItems] = useState([]);

  useEffect(() => {
    const {
      location: { hash },
    } = props;
    if (!isEmpty(wobject)) {
      if (hash) {
        const pathUrl = getPermLink(hash);
        getObject(pathUrl, userName, locale).then(wObject => {
          setListItems(wObject.listItems);
          dispatch(setWobjectForBreadCrumbs(wObject));
        });
      } else {
        setListItems(wobject.listItems);
      }
    }
  }, [props.location.hash, props.wobject.author_permlink, userName]);

  const handleAddItem = listItem => {
    const currentList = isEmpty(listItems) ? [listItem] : [...listItems, listItem];
    setListItems(sortListItemsBy(currentList, 'recency'));
  };

  /**
   *
   * @param companyAuthor
   * @param companyPermlink
   * @param resPermlink
   * @param objPermlink
   * @param companyId
   * @param primaryObjectName
   * @param secondaryObjectName
   * @param amount
   * @param proposition
   * @param proposedWobj
   * @param username
   * @param currencyId
   */

  const renderProposition = (propositionsObject, listItem) =>
    map(propositionsObject, proposition =>
      map(
        filter(
          proposition.objects,
          object => get(object, ['object', 'author_permlink']) === listItem.author_permlink,
        ),
        wobj => <PropositionListContainer wobject={wobj.object} userName={userName} />,
      ),
    );

  const renderCampaign = propositionsObject => {
    const minReward = propositionsObject
      ? min(map(propositionsObject, proposition => proposition.reward))
      : null;
    const rewardPriceCatalogWrap = minReward ? `${minReward.toFixed(2)} USD` : '';
    const maxReward = propositionsObject
      ? max(map(propositionsObject, proposition => proposition.reward))
      : null;
    const rewardMaxCatalogWrap = maxReward !== minReward ? `${maxReward.toFixed(2)} USD` : '';

    return (
      <Campaign
        proposition={propositionsObject[0]}
        filterKey="all"
        rewardPricePassed={!rewardMaxCatalogWrap ? rewardPriceCatalogWrap : null}
        rewardMaxPassed={rewardMaxCatalogWrap || null}
        key={`${propositionsObject[0].required_object.author_permlink}${propositionsObject[0].required_object.createdAt}`}
        userName={userName}
      />
    );
  };

  const getListRow = (listItem, objects) => {
    const isList = listItem.object_type === OBJ_TYPE.LIST || listItem.type === OBJ_TYPE.LIST;
    const isMatchedPermlinks = some(objects, object => object.includes(listItem.author_permlink));
    const status = get(parseWobjectField(listItem, 'status'), 'title');

    if (statusNoVisibleItem.includes(status)) return null;

    let item;
    if (isList) {
      item = <CategoryItemView wObject={listItem} location={location} />;
    } else if (objects.length && isMatchedPermlinks) {
      item = renderProposition(propositions, listItem);
    } else {
      item = <ObjectCardView wObject={listItem} />;
    }
    return <div key={`category-${listItem.author_permlink}`}>{item}</div>;
  };

  const getMenuList = () => {
    let listRow;
    if (propositions) {
      if (isEmpty(listItems)) {
        return (
          <div>
            {props.intl.formatMessage({
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

  const handleSortChange = sortType => {
    const sortOrder = wobject && wobject[objectFields.sorting];
    setSorting(sortType);
    setListItems(sortListItemsBy(listItems, sortType, sortOrder));
  };

  const obj = isEmpty(currentWobject) ? wobject : currentWobject;

  return (
    <div>
      {!hasType(wobject, OBJ_TYPE.PAGE) && (
        <React.Fragment>
          {!isEmpty(propositions) && renderCampaign(propositions)}
          <PropositionListContainer
            wobject={wobject}
            userName={userName}
            setCatalogPropositions={setPropositions}
            isCatalogWrap
          />
          {isEditMode && (
            <div className="CatalogWrap__add-item">
              <AddItemModal wobject={obj} onAddItem={handleAddItem} />
            </div>
          )}
          {isEmpty(wobject) ? (
            <Loading />
          ) : (
            <React.Fragment>
              <div className="CatalogWrap__breadcrumb">
                <CatalogBreadcrumb intl={intl} wobject={wobject} />
              </div>
              <div className="CatalogWrap__sort">
                <CatalogSorting
                  sort={sort}
                  currWobject={wobject}
                  handleSortChange={handleSortChange}
                />
              </div>
              <div className="CatalogWrap">
                <div>{getMenuList()}</div>
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
      <BodyContainer full body={wobject.pageContent} />
    </div>
  );
};

CatalogWrap.propTypes = {
  intl: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  wobject: PropTypes.shape(),
  isEditMode: PropTypes.bool.isRequired,
  userName: PropTypes.string,
};

CatalogWrap.defaultProps = {
  wobject: {},
  locale: 'en-US',
  userName: '',
};

export default compose(injectIntl, withRouter)(CatalogWrap);
