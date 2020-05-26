import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Badge, Icon } from 'antd';
import { get, compact, debounce, has, isEmpty, isEqual, kebabCase, throttle, uniqBy } from 'lodash';
import requiresLogin from '../../auth/requiresLogin';
import { getCampaignById, getObject } from '../../../waivioApi/ApiClient';
import {
  getAuthenticatedUser,
  getDraftPosts,
  getIsEditorLoading,
  getIsEditorSaving,
  getIsImageUploading,
  getUpvoteSetting,
  getSuitableLanguage,
} from '../../reducers';
import { createPost, saveDraft } from '../Write/editorActions';
import {
  createPostMetadata,
  splitPostContent,
  getInitialState,
  getObjectUrl,
} from '../../helpers/postHelpers';
import Editor from '../../components/EditorExtended/EditorExtended';
import PostPreviewModal from '../PostPreviewModal/PostPreviewModal';
import ObjectCardView from '../../objectCard/ObjectCardView';
import { Entity, toMarkdown } from '../../components/EditorExtended';
import LastDraftsContainer from '../Write/LastDraftsContainer';
import ObjectCreation from '../../components/Sidebar/ObjectCreation/ObjectCreation';
import { setObjPercents } from '../../helpers/wObjInfluenceHelper';
import CreatePostForecast from '../../../investarena/components/CreatePostForecast';
import { getForecastObject } from '../../../investarena/components/CreatePostForecast/helpers';
import { getClientWObj } from '../../adapters';
import SearchObjectsAutocomplete from '../../components/EditorObject/SearchObjectsAutocomplete';
import CreateObject from '../CreateObjectModal/CreateObject';
import './EditPost.less';

@injectIntl
@requiresLogin
@withRouter
@connect(
  (state, props) => ({
    user: getAuthenticatedUser(state),
    locale: getSuitableLanguage(state),
    draftPosts: getDraftPosts(state),
    publishing: getIsEditorLoading(state),
    saving: getIsEditorSaving(state),
    imageLoading: getIsImageUploading(state),
    campaignId: new URLSearchParams(props.location.search).get('campaign'),
    draftId: new URLSearchParams(props.location.search).get('draft'),
    initObjects: new URLSearchParams(props.location.search).getAll('object'),
    upvoteSetting: getUpvoteSetting(state),
  }),
  {
    createPost,
    saveDraft,
  },
)
class EditPost extends Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    user: PropTypes.shape().isRequired,
    userName: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    draftPosts: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    campaignId: PropTypes.string, // eslint-disable-line
    draftId: PropTypes.string,
    publishing: PropTypes.bool,
    saving: PropTypes.bool,
    imageLoading: PropTypes.bool,
    createPost: PropTypes.func,
    saveDraft: PropTypes.func,
  };
  static defaultProps = {
    upvoteSetting: false,
    campaignId: '',
    draftId: '',
    publishing: false,
    saving: false,
    imageLoading: false,
    createPost: () => {},
    saveDraft: () => {},
  };

  constructor(props) {
    super(props);

    this.state = getInitialState(props);

    this.handleTopicsChange = this.handleTopicsChange.bind(this);
    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.handleChangeContent = this.handleChangeContent.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.buildPost = this.buildPost.bind(this);
    this.handleObjectSelect = this.handleObjectSelect.bind(this);
    this.handleCreateObject = this.handleCreateObject.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.draftId && nextProps.draftId !== prevState.draftId) {
      return getInitialState(nextProps);
    } else if (nextProps.draftId === null && prevState.draftId) {
      const nextState = getInitialState(nextProps);
      nextProps.history.replace({
        pathname: nextProps.location.pathname,
        search: `draft=${nextState.draftId}`,
      });
      return nextState;
    }
    return null;
  }

  componentDidMount() {
    const { campaign } = this.state;
    if (campaign && campaign.id) {
      getCampaignById(campaign.id)
        .then(campaignData => this.setState({ campaign: { ...campaignData, fetched: true } }))
        .catch(error => console.log('Failed to get campaign data:', error));
    }
  }

  setIsPreview = isPreview => this.setState({ isPreview });

  getLinkedObjects = async contentStateRaw => {
    const { forecastValues, linkedObjects, isRemovedCryptoObj } = this.state;
    const { isValid, wobjData } = forecastValues;
    const cryptoObject = await getObject('jyp-cryptoinvestarena');
    const objEntities = Object.values(contentStateRaw.entityMap).filter(
      entity => entity.type === Entity.OBJECT && has(entity, 'data.object.type'),
    );
    const forecastObjectId = get(wobjData, ['author_permlink'], '');
    let forecastObject = linkedObjects.find(obj => obj.id === forecastObjectId);

    if (!forecastObject && isValid && forecastObjectId) {
      const serverObject = await getObject(forecastObjectId);
      forecastObject = getClientWObj(serverObject, this.props.locale);
    }

    let linkedList = [forecastObject, ...objEntities.map(entity => entity.data.object)];
    if (!isRemovedCryptoObj) linkedList = [cryptoObject, ...linkedList];

    return compact(uniqBy(linkedList, 'id'));
  };

  async handleChangeContent(rawContent) {
    const nextState = { content: toMarkdown(rawContent) };
    this.getLinkedObjects(rawContent).then(linkedObjects => {
      const isLinkedObjectsChanged = !isEqual(this.state.linkedObjects, linkedObjects);
      if (isLinkedObjectsChanged) {
        const objPercentage = setObjPercents(linkedObjects, this.state.objPercentage);
        nextState.linkedObjects = linkedObjects;
        nextState.objPercentage = objPercentage;
      }
      if (this.state.content !== nextState.content || isLinkedObjectsChanged) {
        this.setState(nextState, this.handleUpdateState);
      }
    });
  }

  handleTopicsChange = topics => this.setState({ topics }, this.handleUpdateState);

  handleSettingsChange = updatedValue =>
    this.setState(
      prevState => ({
        settings: { ...prevState.settings, ...updatedValue },
      }),
      this.handleUpdateState,
    );

  handlePercentChange = percentage => {
    this.setState({ objPercentage: percentage }, this.handleUpdateState);
  };

  handleSubmit() {
    const postData = this.buildPost();
    this.props.createPost(postData);
  }

  handleObjectSelect(object) {
    this.setState(prevState => {
      const { postTitle, postBody } = splitPostContent(prevState.content);
      const objName = object.name || object.default_name;
      const separator = postBody.slice(-1) === '\n' ? '' : '\n';
      return {
        draftContent: {
          title: postTitle,
          body: `${postBody}${separator}[${objName}](${getObjectUrl(
            object.id || object.author_permlink,
          )})&nbsp;\n`,
        },
      };
    });
  }

  handleCreateObject(object) {
    setTimeout(() => this.handleObjectSelect(object), 1200);
  }

  buildPost() {
    const {
      draftId,
      campaign,
      parentPermlink,
      content,
      topics,
      linkedObjects,
      objPercentage,
      settings,
      forecastValues: { selectForecast, ...forecast },
      expForecast,
      isUpdating,
      permlink,
      originalBody,
    } = this.state;
    const { postTitle, postBody } = splitPostContent(content);

    const postData = {
      body: postBody,
      title: postTitle,
      lastUpdated: Date.now(),
      isUpdating,
      draftId,
      ...settings,
    };

    if (campaign && campaign.alias) {
      postData.body += `\n***\n${this.props.intl.formatMessage({
        id: `check_review_post_add_text`,
        defaultMessage: 'This review was sponsored in part by',
      })} ${campaign.alias} ([@${campaign.guideName}](/@${campaign.guideName}))`;
    }

    postData.parentAuthor = '';
    postData.parentPermlink = parentPermlink;
    postData.author = this.props.user.name || '';
    postData.permlink = permlink || kebabCase(postTitle);

    const currDraft = this.props.draftPosts.find(d => d.draftId === this.props.draftId);
    const oldMetadata = currDraft && currDraft.jsonMetadata;
    const waivioData = {
      wobjects: linkedObjects.map(obj => ({
        objectName: obj.name,
        author_permlink: obj.id,
        percent: objPercentage[obj.id].percent,
      })),
    };

    const appData = {
      waivioData,
      forecast: getForecastObject(forecast, selectForecast, !isEmpty(expForecast)),
    };

    postData.jsonMetadata = createPostMetadata(postBody, topics, oldMetadata, appData);

    if (originalBody) {
      postData.originalBody = originalBody;
    }

    return postData;
  }

  handleUpdateState = () => throttle(this.saveDraft, 200, { leading: false, trailing: true })();

  handleForecastChange = (nextForecastValues, isReset) => {
    const { linkedObjects, forecastValues } = this.state;
    const { isValid, wobjData } = nextForecastValues;
    if (isReset) {
      this.setState(prevState => {
        const filteredObjects = prevState.linkedObjects.filter(
          obj => obj.id !== get(prevState.forecastValues, ['wobjData', 'author_permlink'], ''),
        );
        return {
          forecastValues: nextForecastValues,
          linkedObjects: filteredObjects,
          objPercentage: setObjPercents(filteredObjects, this.state.objPercentage),
        };
      });
    } else if (
      !isReset &&
      isValid &&
      wobjData &&
      !linkedObjects.some(obj => obj.id === wobjData.author_permlink)
    ) {
      getObject(wobjData.author_permlink).then(serverObject => {
        const filtered = linkedObjects.filter(
          obj => obj.id !== get(forecastValues, ['wobjData', 'author_permlink']),
          '',
        );
        const nextLinkedObjects = [getClientWObj(serverObject, this.props.locale), ...filtered];
        this.setState({
          forecastValues: nextForecastValues,
          linkedObjects: nextLinkedObjects,
          objPercentage: setObjPercents(nextLinkedObjects, this.state.objPercentage),
        });
      });
    } else {
      this.setState({ forecastValues: nextForecastValues });
    }
  };

  saveDraft = debounce(() => {
    if (this.props.saving) return;

    const draft = this.buildPost();
    const postBody = draft.body;
    // Remove zero width space
    const isBodyEmpty = postBody.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().length === 0;
    if (isBodyEmpty) return;

    const id = this.props.draftId;

    const redirect = id !== this.draftId;
    if (this.state.expForecast) {
      draft.exp_forecast = this.state.expForecast;
    }

    this.props.saveDraft(draft, redirect, this.props.intl);

    // if (!this.props.draftPosts.includes(d => d.draftId === this.props.draftId)) {
    //   this.setState({ draftContent: { title: draft.title, body: draft.body } });
    // }
  }, 1500);

  removeBodyItem = bodyItem => {
    const { draftContent } = this.state;
    const { postTitle } = splitPostContent(draftContent);
    const objName = bodyItem.name || bodyItem.default_name;
    let draftBody = draftContent.body;
    let currentItem = `\n[${objName}](${getObjectUrl(bodyItem.id || bodyItem.author_permlink)})`;
    if (
      draftContent.body.includes(
        `\n[${objName}](${getObjectUrl(bodyItem.id || bodyItem.author_permlink)})&nbsp;\n`,
      )
    ) {
      currentItem = `\n[${objName}](${getObjectUrl(
        bodyItem.id || bodyItem.author_permlink,
      )})&nbsp;\n`;
    }
    const itemIndex = draftContent.body.indexOf(currentItem) + currentItem.length;
    if (
      itemIndex !== -1 &&
      !!draftContent.body[itemIndex] &&
      draftContent.body[itemIndex].charCodeAt(0) === 160
    ) {
      draftBody = draftBody.replace(draftContent.body[itemIndex], '');
    }
    draftBody = draftBody.replace(currentItem, '');
    this.setState({ draftContent: { title: postTitle, body: draftBody } });
  };

  removeLinkedObject = object => {
    const { linkedObjects, draftContent, forecastValues } = this.state;
    const objName = object.name || object.default_name;
    const isBodyItem = draftContent.body.includes(
      `\n[${objName}](${getObjectUrl(object.id || object.author_permlink)})`,
    );
    if (object.author_permlink === 'jyp-cryptoinvestarena') {
      const objectList = linkedObjects.filter(
        item => item.author_permlink !== object.author_permlink,
      );
      this.setState({ linkedObjects: objectList, isRemovedCryptoObj: true });
    }
    if (isBodyItem) this.removeBodyItem(object);
    if (
      object.type === 'cryptopairs' &&
      forecastValues.wobjData &&
      forecastValues.wobjData.author_permlink === object.author_permlink
    ) {
      this.handleForecastChange({ isValid: true }, true);
      const objectList = linkedObjects.filter(
        item => item.author_permlink !== object.author_permlink,
      );
      this.setState({ linkedObjects: objectList });
    }
  };

  render() {
    const {
      draftContent,
      content,
      topics,
      linkedObjects,
      objPercentage,
      settings,
      campaign,
      forecastValues,
      expForecast,
      isUpdating,
      isPreview,
    } = this.state;
    const { saving, publishing, imageLoading, intl, locale, draftPosts } = this.props;
    return (
      <div className="shifted">
        <div className="post-layout container">
          <div className="center">
            <Editor
              enabled={!imageLoading}
              initialContent={draftContent}
              locale={locale}
              onChange={this.handleChangeContent}
            />
            {draftPosts.some(d => d.draftId === this.state.draftId) && (
              <div className="edit-post__saving-badge">
                {saving ? (
                  <Badge status="error" text="saving" />
                ) : (
                  <Badge status="success" text="saved" />
                )}
              </div>
            )}
            <CreatePostForecast
              forecastValues={forecastValues}
              onChange={this.handleForecastChange}
              isPosted={isPreview}
              isUpdating={isUpdating}
            />
            <PostPreviewModal
              content={content}
              topics={topics}
              linkedObjects={linkedObjects}
              objPercentage={objPercentage}
              settings={settings}
              reviewData={
                campaign && campaign.fetched
                  ? { campaign, reviewer: { name: this.props.userName } }
                  : null
              }
              forecastValues={forecastValues}
              expForecast={expForecast}
              isPublishing={publishing}
              isUpdating={isUpdating}
              onTopicsChange={this.handleTopicsChange}
              onSettingsChange={this.handleSettingsChange}
              onPercentChange={this.handlePercentChange}
              onReadyBtnClick={this.setIsPreview}
              isPreview={isPreview}
              onSubmit={this.handleSubmit}
              onUpdate={this.saveDraft}
            />

            <div>{intl.formatMessage({ id: 'add_object', defaultMessage: 'Add object' })}</div>
            <SearchObjectsAutocomplete handleSelect={this.handleObjectSelect} />
            <CreateObject onCreateObject={this.handleCreateObject} />

            {linkedObjects.map(wObj => (
              <div className="edit-post__object-card">
                <div className="edit-post__object-card-icon">
                  <Icon type="close-circle" onClick={() => this.removeLinkedObject(wObj)} />
                </div>
                <ObjectCardView wObject={wObj} key={wObj.id} />
              </div>
            ))}
          </div>
          <div className="rightContainer">
            <div className="right">
              <ObjectCreation />
              <LastDraftsContainer />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditPost;
