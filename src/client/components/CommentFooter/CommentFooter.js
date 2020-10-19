import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import find from 'lodash/find';
import { getVoteValue } from '../../helpers/user';
import Slider from '../Slider/Slider';
import Buttons from './Buttons';
import Confirmation from './Confirmation';
import { getRate } from '../../reducers';
import { calculateVotePowerForSlider } from '../../vendor/steemitHelpers';
import './CommentFooter.less';

@connect(state => ({
  rate: getRate(state),
}))
export default class CommentFooter extends React.Component {
  static propTypes = {
    user: PropTypes.shape().isRequired,
    comment: PropTypes.shape().isRequired,
    rewardFund: PropTypes.shape().isRequired,
    rate: PropTypes.number.isRequired,
    defaultVotePercent: PropTypes.number.isRequired,
    sliderMode: PropTypes.bool,
    editable: PropTypes.bool,
    editing: PropTypes.bool,
    replying: PropTypes.bool,
    pendingVotes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        percent: PropTypes.number,
      }),
    ),
    onLikeClick: PropTypes.func,
    onDislikeClick: PropTypes.func,
    onReplyClick: PropTypes.func,
    onEditClick: PropTypes.func,
  };

  static defaultProps = {
    pendingLike: false,
    ownPost: false,
    sliderMode: false,
    editable: false,
    editing: false,
    replying: false,
    pendingVotes: [],
    onLikeClick: () => {},
    onDislikeClick: () => {},
    onReplyClick: () => {},
    onEditClick: () => {},
  };

  state = {
    sliderVisible: false,
    sliderValue: 100,
    voteWorth: 0,
    replyFormVisible: false,
  };

  componentWillMount() {
    const { user, comment, defaultVotePercent } = this.props;
    if (user) {
      const userVote = find(comment.active_votes, { voter: user.name }) || {};

      if (userVote.percent && userVote.percent > 0) {
        this.setState({
          sliderValue: userVote.percent / 100,
        });
      } else {
        this.setState({
          sliderValue: defaultVotePercent / 100,
        });
      }
    }
  }

  handleLikeClick = () => {
    const { sliderMode, comment } = this.props;
    if (sliderMode) {
      if (!this.state.sliderVisible) {
        this.setState(prevState => ({ sliderVisible: !prevState.sliderVisible }));
      }
    } else {
      this.props.onLikeClick(comment.id);
    }
  };

  handleLikeConfirm = () => {
    this.setState({ sliderVisible: false }, () => {
      this.props.onLikeClick(this.props.comment.id, this.state.sliderValue * 100);
    });
  };

  handleDislikeClick = () => this.props.onDislikeClick(this.props.comment.id);

  handleSliderCancel = () => this.setState({ sliderVisible: false });

  handleSliderChange = async value => {
    const { isGuest, user, comment } = this.props;
    const voteWorth = isGuest ? 0 : await calculateVotePowerForSlider(user.name, value, comment.author, comment.permlink);

    this.setState({ sliderValue: value, voteWorth });
  };

  render() {
    const {
      user,
      comment,
      defaultVotePercent,
      editable,
      editing,
      replying,
      pendingVotes,
    } = this.props;
    const { sliderVisible } = this.state;

    let actionPanel = null;
    if (sliderVisible) {
      actionPanel = (
        <Confirmation onConfirm={this.handleLikeConfirm} onCancel={this.handleSliderCancel} />
      );
    } else {
      actionPanel = (
        <Buttons
          editable={editable}
          editing={editing}
          replying={replying}
          user={user}
          comment={comment}
          pendingVotes={pendingVotes}
          defaultVotePercent={defaultVotePercent}
          onLikeClick={this.handleLikeClick}
          onDislikeClick={this.handleDislikeClick}
          onReplyClick={this.props.onReplyClick}
          onEditClick={this.props.onEditClick}
        />
      );
    }

    return (
      <div className="CommentFooter">
        {!comment.isFakeComment && actionPanel}
        {sliderVisible && (
          <Slider
            value={this.state.sliderValue}
            voteWorth={this.state.voteWorth}
            onChange={this.handleSliderChange}
          />
        )}
      </div>
    );
  }
}
