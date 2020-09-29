import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { isEmpty, map, size, get } from 'lodash';
import store from 'store';
import { getObjectName, getObjectTitle } from '../../../helpers/wObjectHelper';
import { setCatalogBreadCrumbs } from '../../wobjActions';
import { getBreadCrumbs, getWobjectBreadCrumbs } from '../../../reducers';
import './CatalogBreadcrumb.less';

const CatalogBreadcrumb = props => {
  const dispatch = useDispatch();
  const wobjectBreadCrumbs = useSelector(getWobjectBreadCrumbs);
  const breadcrumb = useSelector(getBreadCrumbs);

  const BreadCrumbSize = size(breadcrumb);
  const currentTitle = get(breadcrumb[BreadCrumbSize - 1], 'title', '');

  /**
   * @param wObject : [{}]
   * Will be set breadcrumbs and write in localStorage
   */
  const handleChangeBreadCrumbs = wObject => {
    if (isEmpty(wObject)) return;
    let currentBreadCrumbs = [...breadcrumb];
    const hashStorage = store.get('hash');
    const breadcrumbStorage = store.get('breadcrumb');
    const findWobj = crumb => crumb.id === wObject.author_permlink;

    if (hashStorage === props.location.hash && !isEmpty(breadcrumbStorage)) {
      dispatch(setCatalogBreadCrumbs(breadcrumbStorage));
    } else {
      const findBreadCrumbs = currentBreadCrumbs.some(findWobj);
      if (findBreadCrumbs) {
        const findIndex = currentBreadCrumbs.findIndex(findWobj);
        currentBreadCrumbs.splice(findIndex + 1);
      } else {
        currentBreadCrumbs = [
          ...currentBreadCrumbs,
          {
            id: wObject.author_permlink,
            name: getObjectName(wObject),
            title: getObjectTitle(wObject),
            path: wObject.author_permlink,
          },
        ];
      }
      dispatch(setCatalogBreadCrumbs(currentBreadCrumbs));
    }
    store.set('breadcrumb', currentBreadCrumbs);
    store.set('hash', props.location.hash);
  };

  useEffect(() => {
    const {
      wobject,
      location: { hash },
    } = props;

    const usedObj = hash ? wobjectBreadCrumbs : wobject;
    handleChangeBreadCrumbs(usedObj);
  }, []);

  return (
    <div className="CustomBreadCrumbs">
      <Breadcrumb separator={'>'}>
        {map(breadcrumb, (crumb, index) => (
          <Breadcrumb.Item key={`crumb-${crumb.id}`}>
            {index === BreadCrumbSize - 1 ? (
              <React.Fragment>
                <span className="CustomBreadCrumbs__link">{crumb.name}</span>
                <Link
                  className="CustomBreadCrumbs__obj-page-link"
                  to={`/object/${crumb.id}/list`}
                  target={'_blank'}
                >
                  <i className="iconfont icon-send PostModal__icon" />
                </Link>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Link
                  className="CustomBreadCrumbs__link"
                  to={{ pathname: props.location.pathname, hash: crumb.path }}
                  title={`${props.intl.formatMessage({ id: 'GoTo', defaultMessage: 'Go to' })} ${
                    crumb.name
                  }`}
                >
                  {crumb.name}
                </Link>

                {BreadCrumbSize === 1 && (
                  <Link
                    to={`/object/${crumb.id}/list`}
                    className="CustomBreadCrumbs__obj-page-link"
                    target={'_blank'}
                  >
                    <i className="iconfont icon-send PostModal__icon" />
                  </Link>
                )}
              </React.Fragment>
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <div className="CustomBreadCrumbs__title">{currentTitle}</div>
    </div>
  );
};

CatalogBreadcrumb.propTypes = {
  location: PropTypes.string,
  intl: PropTypes.shape().isRequired,
  wobject: PropTypes.shape(),
};

CatalogBreadcrumb.defaultProps = {
  location: '',
  wobject: {},
  breadcrumb: [],
};

export default compose(withRouter)(CatalogBreadcrumb);
