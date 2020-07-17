import React from 'react';
import { injectIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getAuthenticatedUserName,
  getAutoCompleteSearchResults,
  getIsAuthenticated,
} from '../../reducers';
import './Sidenav.less';
import { getRewardsGeneralCounts } from '../../../waivioApi/ApiClient';
import ModalSignIn from './ModlaSignIn/ModalSignIn';

@injectIntl
@connect(state => ({
  autoCompleteSearchResults: getAutoCompleteSearchResults(state),
  authenticated: getIsAuthenticated(state),
  userName: getAuthenticatedUserName(state),
}))
export default class SidenavRewards extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    authenticated: PropTypes.bool.isRequired,
    userName: PropTypes.string,
  };

  static defaultProps = {
    autoCompleteSearchResults: {},
    userName: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      searchBarActive: false,
      popoverVisible: false,
      searchBarValue: '',
      isModalRewardUserOpen: false,
      currentTab: 'active',
      menuCondition: {
        rewards: true,
        campaigns: true,
      },
      rewardsCount: {
        hasReceivables: false,
        historyCount: 0,
        createdCampaignsCount: 0,
      },
    };
  }

  componentDidUpdate(nextProps) {
    if (this.props.userName !== nextProps.userName) {
      getRewardsGeneralCounts(this.props.userName).then(data =>
        this.setState({
          rewardsCount: {
            hasReceivables: data.has_receivable,
            historyCount: data.count_history_campaigns,
            createdCampaignsCount: data.count_campaigns,
          },
        }),
      );
    }
  }

  toggleMenuCondition = menuItem => {
    const { menuCondition } = this.state;
    this.setState({
      menuCondition: {
        ...menuCondition,
        [menuItem]: !menuCondition[menuItem],
      },
    });
  };

  render() {
    const { intl, authenticated } = this.props;
    const { menuCondition, rewardsCount } = this.state;
    const { hasReceivables, historyCount, createdCampaignsCount } = rewardsCount;
    return (
      <React.Fragment>
        <ul className="Sidenav">
          <div
            className="Sidenav__title-wrap"
            onClick={() => this.toggleMenuCondition('rewards')}
            role="presentation"
          >
            <div className="Sidenav__title-item">
              {intl.formatMessage({
                id: 'rewards',
                defaultMessage: `rewards`,
              })}
              :
            </div>
            <div className="Sidenav__title-icon">
              {!menuCondition.rewards ? (
                <i className="iconfont icon-addition" />
              ) : (
                <i className="iconfont icon-offline" />
              )}
            </div>
          </div>
          {menuCondition.rewards && (
            <React.Fragment>
              <li>
                <NavLink
                  to={'/rewards/all'}
                  className="sidenav-discover-objects__item"
                  activeClassName="Sidenav__item--active"
                >
                  {intl.formatMessage({
                    id: 'all',
                    defaultMessage: `All`,
                  })}
                </NavLink>
              </li>
            </React.Fragment>
          )}
          {authenticated ? (
            <React.Fragment>
              {menuCondition.rewards && (
                <React.Fragment>
                  <li>
                    <NavLink
                      to={`/rewards/active`}
                      className="sidenav-discover-objects__item"
                      activeClassName="Sidenav__item--active"
                    >
                      {intl.formatMessage({
                        id: 'eligible',
                        defaultMessage: `Eligible`,
                      })}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={`/rewards/reserved`}
                      className="sidenav-discover-objects__item"
                      activeClassName="Sidenav__item--active"
                    >
                      {intl.formatMessage({
                        id: 'reserved',
                        defaultMessage: `Reserves`,
                      })}
                    </NavLink>
                  </li>
                  {hasReceivables ? (
                    <li>
                      <NavLink
                        to={`/rewards/receivables`}
                        className="sidenav-discover-objects__item"
                        activeClassName="Sidenav__item--active"
                      >
                        {intl.formatMessage({
                          id: 'sidenav_rewards_receivables',
                          defaultMessage: `Receivables`,
                        })}
                      </NavLink>
                    </li>
                  ) : null}
                  {!!historyCount && (
                    <li>
                      <NavLink
                        to={`/rewards/history`}
                        className="sidenav-discover-objects__item"
                        activeClassName="Sidenav__item--active"
                      >
                        {intl.formatMessage({
                          id: 'history',
                          defaultMessage: `History`,
                        })}
                      </NavLink>
                    </li>
                  )}
                </React.Fragment>
              )}
              <div
                className="Sidenav__title-wrap"
                onClick={() => this.toggleMenuCondition('campaigns')}
                role="presentation"
              >
                <div className="Sidenav__title-item">
                  {intl.formatMessage({
                    id: 'campaigns',
                    defaultMessage: `Campaigns`,
                  })}
                  :
                </div>
                <div className="Sidenav__title-icon">
                  {!menuCondition.campaigns ? (
                    <i className="iconfont icon-addition" />
                  ) : (
                    <i className="iconfont icon-offline" />
                  )}
                </div>
              </div>
              {menuCondition.campaigns && (
                <React.Fragment>
                  <li>
                    <NavLink
                      to={`/rewards/create`}
                      className="sidenav-discover-objects__item"
                      activeClassName="Sidenav__item--active"
                    >
                      {intl.formatMessage({
                        id: 'create',
                        defaultMessage: `Create`,
                      })}
                    </NavLink>
                  </li>
                  {!!createdCampaignsCount && (
                    <React.Fragment>
                      <li>
                        <NavLink
                          to={`/rewards/manage`}
                          className="sidenav-discover-objects__item"
                          activeClassName="Sidenav__item--active"
                        >
                          {intl.formatMessage({
                            id: 'manage',
                            defaultMessage: `Manage`,
                          })}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to={`/rewards/payables`}
                          className="sidenav-discover-objects__item"
                          activeClassName="Sidenav__item--active"
                        >
                          {intl.formatMessage({
                            id: 'sidenav_rewards_payables',
                            defaultMessage: `Payables`,
                          })}
                        </NavLink>
                      </li>
                    </React.Fragment>
                  )}
                  <li>
                    <NavLink
                      to={`/rewards/reports`}
                      className="sidenav-discover-objects__item"
                      activeClassName="Sidenav__item--active"
                    >
                      {intl.formatMessage({
                        id: 'sidenav_rewards_reports',
                        defaultMessage: `Reports`,
                      })}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={`/rewards/match-bot`}
                      className="sidenav-discover-objects__item"
                      activeClassName="Sidenav__item--active"
                    >
                      {intl.formatMessage({
                        id: 'matchBot',
                        defaultMessage: `Match bot`,
                      })}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={`/rewards/blacklist`}
                      className="sidenav-discover-objects__item"
                      activeClassName="Sidenav__item--active"
                    >
                      {intl.formatMessage({
                        id: 'blacklist',
                        defaultMessage: `Blacklist`,
                      })}
                    </NavLink>
                  </li>
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <span className="tc">
              {intl.formatMessage({
                id: 'pleaseLogin',
                defaultMessage: `For more options please`,
              })}{' '}
              <ModalSignIn isButton={false} />
            </span>
          )}
        </ul>
      </React.Fragment>
    );
  }
}
