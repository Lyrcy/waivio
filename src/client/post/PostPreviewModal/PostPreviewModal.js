import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Button, Modal } from 'antd';
import { throttle, isEqual, isEmpty } from 'lodash';
import BodyContainer from '../../containers/Story/BodyContainer';
import TagsSelector from '../../components/TagsSelector/TagsSelector';
import PolicyConfirmation from '../../components/PolicyConfirmation/PolicyConfirmation';
import AdvanceSettings from './AdvanceSettings';
import CheckReviewModal from '../CheckReviewModal/CheckReviewModal';
import { isContentValid, splitPostContent, validatePost } from '../../helpers/postHelpers';
import { rewardsValues } from '../../../common/constants/rewards';
import BBackTop from '../../components/BBackTop';
import './PostPreviewModal.less';
import PostChart from '../../../investarena/components/PostChart';
import { getForecastObject } from '../../../investarena/components/CreatePostForecast/helpers';
import { forecastDateTimeFormat } from '../../../investarena/constants/constantsForecast';
import { setObjPercents } from '../../helpers/wObjInfluenceHelper';

const isTopicValid = topic => /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/.test(topic);

@injectIntl
class PostPreviewModal extends Component {
  static findScrollElement() {
    return document.querySelector('.post-preview-modal');
  }

  static propTypes = {
    intl: PropTypes.shape(),
    isPublishing: PropTypes.bool,
    settings: PropTypes.shape({
      reward: PropTypes.oneOf([rewardsValues.none, rewardsValues.half, rewardsValues.all]),
      beneficiary: PropTypes.bool,
      upvote: PropTypes.bool,
    }).isRequired,
    content: PropTypes.string.isRequired,
    topics: PropTypes.arrayOf(PropTypes.string).isRequired,
    linkedObjects: PropTypes.arrayOf(PropTypes.shape()),
    forecastValues: PropTypes.shape(),
    expForecast: PropTypes.shape(),
    reviewData: PropTypes.shape({
      reviewer: PropTypes.shape(),
      campaign: PropTypes.shape(),
    }),
    isUpdating: PropTypes.bool,
    objPercentage: PropTypes.shape(),
    isPreview: PropTypes.bool,
    onTopicsChange: PropTypes.func.isRequired,
    onSettingsChange: PropTypes.func.isRequired,
    onPercentChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onReadyBtnClick: PropTypes.func,
  };
  static defaultProps = {
    intl: {},
    isPublishing: false,
    linkedObjects: [],
    forecastValues: {},
    expForecast: null,
    objPercentage: {},
    reviewData: null,
    isUpdating: false,
    isPreview: false,
    onReadyBtnClick: () => {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.isPreview) {
      const { errors } = validatePost(
        nextProps.content,
        nextProps.objPercentage,
        nextProps.forecastValues,
      );
      if (!isEqual(prevState.postValidationErrors, errors)) {
        return { postValidationErrors: errors };
      }
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
      title: '',
      body: '',
      postValidationErrors: [],
      weightBuffer: 0,
      isConfirmed: false,
      // Check review modal
      isCheckReviewModalOpen: false,
      isReviewValid: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { isModalOpen, postValidationErrors } = this.state;
    const { forecastValues } = this.props;
    return (
      isModalOpen ||
      nextState.isModalOpen ||
      isContentValid(this.props.content) !== isContentValid(nextProps.content) ||
      !isEqual(
        postValidationErrors,
        validatePost(nextProps.content, nextProps.objPercentage, nextProps.forecastValues).errors,
      ) ||
      !isEqual(forecastValues, nextProps.forecastValues)
    );
  }

  onUpdate = () => {
    throttle(this.throttledUpdate, 200, { leading: false, trailing: true })();
  };

  getPostErrors = () => {
    const { content, forecastValues, objPercentage } = this.props;
    this.props.onReadyBtnClick(true);
    const { hasError, errors } = validatePost(content, objPercentage, forecastValues);
    if (hasError) {
      this.setState({ postValidationErrors: errors });
    } else {
      this.setState({ postValidationErrors: [] }, this.showModal);
    }
  };

  throttledUpdate = () => {
    const { body, title, linkedObjects } = this.state;
    const { topics, settings } = this.props;
    const postData = {
      body,
      title,
      topics,
      linkedObjects,
      ...settings,
    };
    this.props.onUpdate(postData);
  };

  showModal = () => {
    const { postTitle, postBody } = splitPostContent(this.props.content);
    const objPercentage = setObjPercents(this.props.linkedObjects, this.props.objPercentage);
    this.setState({
      isModalOpen: true,
      title: postTitle,
      body: postBody,
      weightBuffer: 0,
      objPercentage,
    });
  };

  hideModal = () => {
    if (!this.props.isPublishing) {
      this.setState({ isModalOpen: false }, this.props.onReadyBtnClick(false));
    }
  };

  hideCheckReviewModal = () => this.setState({ isCheckReviewModalOpen: false });

  showEditor = () => this.setState({ isCheckReviewModalOpen: false, isModalOpen: false });

  handleConfirmedChange = isConfirmed => this.setState({ isConfirmed });

  handleSettingsChange = updatedValue => this.props.onSettingsChange(updatedValue);

  handleTopicsChange = topics => this.props.onTopicsChange(topics);

  handlePercentChange = (objId, percent) => {
    const { objPercentage, onPercentChange } = this.props;
    const nextObjPercentage = {
      ...objPercentage,
      [objId]: { percent },
    };
    onPercentChange(nextObjPercentage);
  };
  handleReviewSubmit = () => {
    this.setState({ isCheckReviewModalOpen: false }, this.props.onSubmit);
  };

  handleSubmit = () => {
    if (this.props.reviewData) {
      this.setState({ isCheckReviewModalOpen: true });
    } else {
      this.props.onSubmit();
    }
  };

  render() {
    const { body, isConfirmed, isModalOpen, postValidationErrors, title } = this.state;
    const {
      intl,
      isPublishing,
      topics,
      linkedObjects,
      reviewData,
      settings,
      forecastValues,
      objPercentage,
      expForecast,
      isUpdating,
      content,
    } = this.props;
    const { postTitle, postBody } = splitPostContent(content);
    const isEmptyRequiredFields = !(postTitle && postBody);
    const { selectForecast, ...forecastRaw } = forecastValues;
    const forecast = getForecastObject(forecastRaw, selectForecast, !isEmpty(expForecast));
    return (
      <React.Fragment>
        {isModalOpen && (
          <Modal
            title={intl.formatMessage({ id: 'preview', defaultMessage: 'Preview' })}
            style={{ top: 0 }}
            visible={isModalOpen}
            centered={false}
            closable
            confirmLoading={false}
            wrapClassName={`post-preview-modal${isPublishing ? ' publishing' : ''}`}
            width={800}
            footer={null}
            onCancel={this.hideModal}
            zIndex={1500}
            maskClosable={false}
          >
            <BBackTop isModal target={PostPreviewModal.findScrollElement} />
            <h1 className="StoryFull__title preview">{title}</h1>
            <BodyContainer full body={body} />
            {!isEmpty(forecast) && (
              <div className="StoryFull__chart preview">
                <PostChart
                  quoteSecurity={forecast.quoteSecurity}
                  createdAt={forecast.createdAt}
                  forecast={
                    typeof forecast.expiredAt === 'string'
                      ? forecast.expiredAt
                      : forecast.expiredAt.format(forecastDateTimeFormat)
                  }
                  recommend={forecast.recommend}
                  toggleModalPost={() => {}}
                  withModalChart={false}
                  tpPrice={forecast.tpPrice ? forecast.tpPrice.toString() : null}
                  slPrice={forecast.slPrice ? forecast.slPrice.toString() : null}
                  expForecast={expForecast}
                />
              </div>
            )}
            <TagsSelector
              className="post-preview-topics"
              disabled={isPublishing}
              label={intl.formatMessage({
                id: 'topics',
                defaultMessage: 'HashTags(topics)',
              })}
              placeholder={intl.formatMessage({
                id: 'topics_placeholder',
                defaultMessage: 'Add hashtags (without #) here',
              })}
              tags={topics}
              validator={isTopicValid}
              onChange={this.handleTopicsChange}
            />
            <PolicyConfirmation
              className="post-preview-legal-notice"
              isChecked={isConfirmed}
              disabled={isPublishing}
              checkboxLabel={intl.formatMessage({
                id: 'legal_notice',
                defaultMessage: 'Legal notice',
              })}
              policyText={intl.formatMessage({
                id: 'legal_notice_create_post',
                defaultMessage:
                  '"I understand that this post will be published on the Steem social blockchain and that it could be reproduced on many websites around the world. I also acknowledge that the content and images in this post do not infringe the rights of other parties."',
              })}
              onChange={this.handleConfirmedChange}
            />
            {!isUpdating && (
              <AdvanceSettings
                linkedObjects={linkedObjects}
                objPercentage={objPercentage}
                settings={settings}
                onSettingsChange={this.handleSettingsChange}
                onPercentChange={this.handlePercentChange}
              />
            )}
            <div className="edit-post-controls">
              <Button
                htmlType="submit"
                onClick={this.handleSubmit}
                loading={isPublishing}
                size="large"
                disabled={!isConfirmed}
                type="primary"
                className="edit-post__submit-btn"
              >
                {intl.formatMessage({ id: 'publish', defaultMessage: 'Publish' })}
              </Button>
            </div>
          </Modal>
        )}
        {reviewData && (
          <CheckReviewModal
            intl={intl}
            postBody={body}
            isCheckReviewModalOpen={this.state.isCheckReviewModalOpen}
            isReviewValid={this.state.isReviewValid}
            reviewData={reviewData}
            linkedObjects={linkedObjects}
            onCancel={this.hideCheckReviewModal}
            onEdit={this.showEditor}
            onSubmit={this.handleReviewSubmit}
          />
        )}
        <div className="edit-post-controls">
          {!isEmpty(postValidationErrors) &&
            postValidationErrors.map(err => (
              <div className="edit-post-controls__err-msg">
                {intl.formatMessage({ id: err.intlId, defaultMessage: err.message })}
              </div>
            ))}
          <Button
            htmlType="button"
            disabled={Boolean(this.state.postValidationErrors.length) || isEmptyRequiredFields}
            onClick={this.getPostErrors}
            size="large"
            type={!isEmptyRequiredFields ? 'primary' : 'default'}
            className="edit-post-controls__publish-ready-btn"
          >
            {intl.formatMessage({ id: 'ready_to_publish', defaultMessage: 'Ready to publish' })}
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default PostPreviewModal;
