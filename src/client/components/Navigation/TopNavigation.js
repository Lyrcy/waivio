import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { getAuthenticatedUser } from '../../reducers';
import { PATH_NAME_DISCOVER } from '../../../common/constants/rewards';
import './TopNavigation.less';

const LINKS = {
  FEED_TRENDING: '/trending',
  FEED_HOT: '/hot',
  FEED_NEW: '/created',
  FEED_PROMOTED: '/promoted',
  REWARDS: '/rewards',
  DISCOVER: '/discover-objects',
  TOOLS_DRAFTS: '/drafts',
  TOOLS_BOOKMARKS: '/bookmarks',
  TOOLS_EDIT_PROFILE: '/edit-profile',
  TOOLS_INVITE: '/invite',
  TOOLS_SETTINGS: '/settings',
  TOOLS_SETTINGS_GUESTS: '/guests-settings',
  TOOLS_SETTINGS_NOTIFICATIONS: '/notification-settings',
  ABOUT: '/object/ylr-waivio',
  NOTIFICATIONS: '/notifications-list',
  USERS: PATH_NAME_DISCOVER,
  BLOG: '/blog',
  FEED: '/feed',
};

const FEED_URLS = [LINKS.FEED_HOT, LINKS.FEED_NEW, LINKS.FEED_TRENDING];
const TOOLS_URLS = [
  LINKS.TOOLS_BOOKMARKS,
  LINKS.TOOLS_DRAFTS,
  LINKS.TOOLS_EDIT_PROFILE,
  LINKS.TOOLS_INVITE,
  LINKS.TOOLS_SETTINGS,
  LINKS.TOOLS_SETTINGS_GUESTS,
  LINKS.TOOLS_SETTINGS_NOTIFICATIONS,
];

const TopNavigation = ({ location: { pathname } }) => {
  const authenticatedUser = useSelector(getAuthenticatedUser);
  const isRouteMathed =
    pathname === '/' || Object.values(LINKS).some(url => pathname.includes(url));
  return isRouteMathed ? (
    <div className="TopNavigation">
      <div className="container menu-layout">
        <ul className="TopNavigation__menu center">
          <li className="TopNavigation__item">
            <Link
              to="/"
              className={classNames('TopNavigation__link', {
                'TopNavigation__link--active':
                  pathname === '/' || FEED_URLS.some(feedUrl => pathname.includes(feedUrl)),
              })}
            >
              <FormattedMessage id="feed" defaultMessage="Feed" />
            </Link>
          </li>
          <li className="TopNavigation__item">
            <Link
              to={`${LINKS.REWARDS}/all`}
              className={classNames('TopNavigation__link', {
                'TopNavigation__link--active':
                  pathname.includes(LINKS.REWARDS) && !pathname.includes('list'),
              })}
            >
              <FormattedMessage id="rewards" defaultMessage="Rewards" />
            </Link>
          </li>
          <li className="TopNavigation__item">
            <Link
              to={`${LINKS.DISCOVER}/hashtag`}
              className={classNames('TopNavigation__link', {
                'TopNavigation__link--active':
                  pathname.includes(LINKS.DISCOVER) || pathname.includes(LINKS.USERS),
              })}
            >
              <FormattedMessage id="discover" defaultMessage="Discover" />
            </Link>
          </li>
          {!isEmpty(authenticatedUser) && (
            <li className="TopNavigation__item">
              <Link
                to={`${LINKS.TOOLS_DRAFTS}`}
                className={classNames('TopNavigation__link', {
                  'TopNavigation__link--active': TOOLS_URLS.some(feedUrl =>
                    pathname.includes(feedUrl),
                  ),
                })}
              >
                <FormattedMessage id="tools" defaultMessage="Tools" />
              </Link>
            </li>
          )}
          <li className="TopNavigation__item">
            <Link
              to={LINKS.ABOUT}
              className={classNames('TopNavigation__link', {
                'TopNavigation__link--active': pathname.includes(LINKS.ABOUT),
              })}
            >
              <FormattedMessage id="about" defaultMessage="About" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  ) : null;
};

TopNavigation.propTypes = {
  location: PropTypes.shape(),
};

TopNavigation.defaultProps = {
  location: {
    pathname: '',
  },
};

export default TopNavigation;
