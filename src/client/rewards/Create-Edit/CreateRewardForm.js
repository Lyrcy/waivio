import { isEmpty, map, includes } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
import { Form, message } from 'antd';
import { createCampaign, getCampaignById, getObjectsByIds } from '../../../waivioApi/ApiClient';
import CreateFormRenderer from './CreateFormRenderer';
import { getClientWObj } from '../../adapters';
import { AppSharedContext } from '../../Wrapper';
// eslint-disable-next-line import/extensions
import * as apiConfig from '../../../waivioApi/config';
import './CreateReward.less';

@withRouter
@Form.create()
@injectIntl
class CreateRewardForm extends React.Component {
  static propTypes = {
    userName: PropTypes.string,
    user: PropTypes.shape(),
    form: PropTypes.shape(),
    intl: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    currentSteemDollarPrice: PropTypes.number,
    /* from context */
    usedLocale: PropTypes.string,
  };
  static defaultProps = {
    userName: '',
    user: {},
    usedLocale: 'en-US',
    form: {},
    currentSteemDollarPrice: 0,
  };
  state = {
    campaignName: '',
    campaignType: '',
    budget: null,
    reward: null,
    primaryObject: {},
    secondaryObjectsList: [],
    pageObjects: [],
    sponsorsList: [],
    reservationPeriod: 7,
    compensationAccount: {},
    loading: false,
    parentPermlink: '',
    targetDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    receiptPhoto: false,
    minPhotos: 2,
    minExpertise: 0,
    minFollowers: 0,
    minPosts: 0,
    eligibleDays: 15,
    description: '',
    expiredAt: null,
    usersLegalNotice: '',
    agreement: {},
    commissionAgreement: 5,
    iAgree: false,
    campaignId: '',
    isCampaignActive: false,
  };

  componentDidMount = async () => {
    if (this.props.match.params.campaignId) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ loading: true });

      const campaign = await getCampaignById(this.props.match.params.campaignId);

      const isExpired = campaign.status === 'expired';

      const expiredAt = isExpired
        ? moment(new Date().toISOString())
        : moment(new Date(campaign.expired_at));

      const isCampaignActive = campaign.status === 'active';

      const isDuplicate =
        campaign.status === 'active' ||
        campaign.status === 'inactive' ||
        campaign.status === 'pending' ||
        campaign.status === 'expired';

      let combinedObjects;
      let sponsors;

      if (!isEmpty(campaign.match_bots)) {
        combinedObjects = await getObjectsByIds({
          authorPermlinks: [...campaign.match_bots, campaign.requiredObject, ...campaign.objects],
        });

        sponsors = combinedObjects.wobjects.filter(wobj =>
          includes(campaign.sponsors, wobj.author_permlink),
        );
      } else {
        combinedObjects = await getObjectsByIds({
          authorPermlinks: [campaign.requiredObject, ...campaign.objects],
        });
      }

      const primaryObject = combinedObjects.wobjects.find(
        wobj => wobj.author_permlink === campaign.requiredObject,
      );

      const secondaryObjects = combinedObjects.wobjects.filter(wobj =>
        includes(campaign.objects, wobj.author_permlink),
      );

      Promise.all([primaryObject, secondaryObjects, sponsors]).then(values => {
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
          iAgree: true,
          loading: false,
          campaignName: `${
            this.props.match.path.includes('createDuplicate')
              ? `Copy ${campaign.name}`
              : campaign.name
          }`,
          campaignType: campaign.type,
          budget: campaign.budget,
          reward: campaign.reward,
          primaryObject: getClientWObj(values[0], this.props.usedLocale),
          secondaryObjectsList: values[1].map(obj => getClientWObj(obj, this.props.usedLocale)),
          sponsorsList: !isEmpty(sponsors)
            ? values[2].map(obj => getClientWObj(obj, this.props.usedLocale))
            : [],
          reservationPeriod: campaign.count_reservation_days,
          receiptPhoto: campaign.requirements.receiptPhoto,
          minFollowers: campaign.userRequirements.minFollowers,
          minPosts: campaign.userRequirements.minPosts,
          targetDays: campaign.reservation_timetable,
          minPhotos: campaign.requirements.minPhotos,
          description: campaign.description,
          commissionAgreement: parseInt(campaign.commissionAgreement * 100, 10),
          // eslint-disable-next-line no-underscore-dangle
          campaignId: campaign._id,
          compensationAccount: {
            account: campaign.compensationAccount,
          },
          eligibleDays: campaign.frequency_assign,
          usersLegalNotice: campaign.usersLegalNotice,
          expiredAt,
          isCampaignActive,
          isDuplicate,
        });
        if (campaign.match_bots.length) {
          this.setState({
            sponsorsList: campaign.match_bots.map(matchBotAccount => ({
              account: matchBotAccount,
            })),
          });
        }
      });
    }
  };

  checkOptionFields = () => {
    const { setFieldsValue, getFieldValue } = this.props.form;

    if (getFieldValue('minPhotos') === '') setFieldsValue({ minPhotos: 0 });

    if (getFieldValue('minFollowers') === '') setFieldsValue({ minFollowers: 0 });

    if (getFieldValue('minPosts') === '') setFieldsValue({ minPosts: 0 });

    if (getFieldValue('eligibleDays') === '') setFieldsValue({ eligibleDays: 0 });
  };

  prepareSubmitData = (data, userName) => {
    const { campaignId, pageObjects, isDuplicate } = this.state;
    const objects = map(data.secondaryObject, o => o.id);
    const agreementObjects = pageObjects.length !== 0 ? map(pageObjects, o => o.id) : [];
    const sponsorAccounts = map(data.sponsorsList, o => o.account);
    const appName = apiConfig[process.env.NODE_ENV].appName || 'waivio';
    const preparedObject = {
      requiredObject: data.primaryObject.author_permlink,
      guideName: userName,
      name: data.campaignName,
      app: appName,
      type: data.type,
      budget: data.budget,
      reward: data.reward,
      requirements: {
        minPhotos: data.minPhotos,
        receiptPhoto: data.receiptPhoto,
      },
      blacklist_users: [],
      whitelist_users: [],
      count_reservation_days: data.reservationPeriod,
      userRequirements: {
        minFollowers: data.minFollowers,
        minPosts: data.minPosts,
        minExpertise: data.minExpertise,
      },
      frequency_assign: data.eligibleDays,
      commissionAgreement: data.commissionAgreement / 100,
      objects,
      agreementObjects,
      compensationAccount:
        data.compensationAccount && data.compensationAccount.account
          ? data.compensationAccount.account
          : '',
      usersLegalNotice: data.usersLegalNotice ? data.usersLegalNotice : '',
      match_bots: sponsorAccounts,
      // eslint-disable-next-line no-underscore-dangle
      expired_at: data.expiredAt._d,
      reservation_timetable: data.targetDays,
    };
    if (data.description) preparedObject.description = data.description;
    if (campaignId && !isDuplicate) preparedObject.id = campaignId;
    return preparedObject;
  };

  manageRedirect = () => {
    this.props.history.push('/rewards/manage');
  };

  handleSetState = (stateData, callbackData) => {
    const { setFieldsValue } = this.props.form;
    this.setState({ ...stateData }, () => setFieldsValue(callbackData));
  };

  handlers = {
    handleAddSponsorToList: obj => {
      const sponsors = [...this.state.sponsorsList, obj];

      if (sponsors.length <= 5) {
        this.setState({ sponsorsList: [...sponsors] }, () =>
          this.props.form.setFieldsValue({ sponsorsList: this.state.sponsorsList }),
        );
      }
    },

    removeSponsorObject: obj => {
      this.setState(
        prevState => {
          const objectList = prevState.sponsorsList.filter(el => el.account !== obj.account);
          return {
            sponsorsList: objectList,
          };
        },
        () => this.props.form.setFieldsValue({ sponsorsList: this.state.sponsorsList }),
      );
    },

    setPrimaryObject: obj => {
      this.handleSetState(
        { primaryObject: obj, parentPermlink: obj.author_permlink },
        { primaryObject: obj },
      );
    },

    removePrimaryObject: () => {
      this.handleSetState({ primaryObject: {} }, { primaryObject: {} });
    },

    handleAddSecondaryObjectToList: obj => {
      this.setState({ secondaryObjectsList: [...this.state.secondaryObjectsList, obj] }, () =>
        this.props.form.setFieldsValue({ secondaryObject: this.state.secondaryObjectsList }),
      );
    },

    removeSecondaryObject: obj => {
      this.setState(
        prevState => {
          const objectList = prevState.secondaryObjectsList.filter(el => el.id !== obj.id);
          return {
            secondaryObjectsList: objectList,
          };
        },
        () => this.props.form.setFieldsValue({ secondaryObject: this.state.secondaryObjectsList }),
      );
    },

    handleSetCompensationAccount: obj => {
      this.handleSetState({ compensationAccount: obj }, { compensationAccount: obj });
    },

    removeCompensationAccount: () => {
      this.handleSetState({ compensationAccount: {} }, { compensationAccount: {} });
    },

    handleAddPageObject: obj => {
      this.setState({ pageObjects: [...this.state.pageObjects, obj] }, () =>
        this.props.form.setFieldsValue({ agreement: this.state.pageObjects }),
      );
    },

    removePageObject: obj => {
      this.setState(
        prevState => {
          const objectList = prevState.pageObjects.filter(el => el.id !== obj.id);
          return {
            pageObjects: objectList,
          };
        },
        () => this.props.form.setFieldsValue({ agreement: this.state.pageObjects }),
      );
    },

    setTargetDays: targetDay => () => {
      this.setState(
        {
          targetDays: { ...this.state.targetDays, [targetDay]: !this.state.targetDays[targetDay] },
        },
        () => this.props.form.setFieldsValue({ targetDays: this.state.targetDays }),
      );
    },

    getObjectsToOmit: () => {
      const objectsToOmit = [];
      if (!isEmpty(this.state.primaryObject)) {
        objectsToOmit.push(this.state.primaryObject.id);
      }
      if (!isEmpty(this.state.secondaryObjectsList)) {
        map(this.state.secondaryObjectsList, obj => objectsToOmit.push(obj.id));
      }
      return objectsToOmit;
    },

    handleSubmit: e => {
      e.preventDefault();
      this.checkOptionFields();
      this.setState({ loading: true });
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err && !isEmpty(values.primaryObject) && !isEmpty(values.secondaryObject)) {
          createCampaign(this.prepareSubmitData(values, this.props.userName))
            .then(() => {
              message.success(`Rewards campaign ${values.campaignName} has been created.`);
              this.setState({ loading: false });
              this.manageRedirect();
            })
            .catch(error => {
              console.log(error);
              message.error(`Campaign ${values.campaignName} has been rejected`);
              this.setState({ loading: false });
            });
        }
        if (err) {
          this.setState({ loading: false });
        }
        this.setState({ loading: false });
      });
    },

    messageFactory: (id, defaultMessage) => {
      const { intl } = this.props;
      return intl.formatMessage({
        id,
        defaultMessage,
      });
    },

    handleSelectChange: () => {},
  };

  render() {
    const { user, currentSteemDollarPrice, form, match } = this.props;
    const {
      campaignName,
      campaignType,
      budget,
      reward,
      primaryObject,
      secondaryObjectsList,
      pageObjects,
      sponsorsList,
      reservationPeriod,
      compensationAccount,
      commissionAgreement,
      isCampaignActive,
      loading,
      parentPermlink,
      targetDays,
      receiptPhoto,
      minPhotos,
      minExpertise,
      minFollowers,
      minPosts,
      description,
      expiredAt,
      usersLegalNotice,
      agreement,
      campaignId,
      iAgree,
      eligibleDays,
      isDuplicate,
    } = this.state;
    return (
      <CreateFormRenderer
        match={match}
        handlers={this.handlers}
        campaignName={campaignName}
        campaignType={campaignType}
        budget={budget}
        reward={reward}
        reservationPeriod={reservationPeriod}
        targetDays={targetDays}
        receiptPhoto={receiptPhoto}
        minPhotos={minPhotos}
        minExpertise={minExpertise}
        minFollowers={minFollowers}
        minPosts={minPosts}
        description={description}
        expiredAt={expiredAt}
        usersLegalNotice={usersLegalNotice}
        agreement={agreement}
        currentSteemDollarPrice={currentSteemDollarPrice}
        user={user}
        sponsorsList={sponsorsList}
        compensationAccount={compensationAccount}
        primaryObject={primaryObject}
        secondaryObjectsList={secondaryObjectsList}
        pageObjects={pageObjects}
        loading={loading}
        parentPermlink={parentPermlink}
        getFieldDecorator={form.getFieldDecorator}
        getFieldValue={form.getFieldValue}
        commissionAgreement={commissionAgreement}
        campaignId={campaignId}
        isCampaignActive={isCampaignActive}
        iAgree={iAgree}
        eligibleDays={eligibleDays}
        isDuplicate={isDuplicate}
      />
    );
  }
}

export default props => (
  <AppSharedContext.Consumer>
    {context => <CreateRewardForm {...props} {...context} />}
  </AppSharedContext.Consumer>
);
