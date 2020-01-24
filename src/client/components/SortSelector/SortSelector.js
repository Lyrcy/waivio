import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import Popover from '../Popover';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';
import './SortSelector.less';

export default class SortSelector extends React.Component {
  static Item = PopoverMenuItem;

  static propTypes = {
    sort: PropTypes.string,
    disabled: PropTypes.bool,
    caption: PropTypes.string,
    children: PropTypes.node,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    sort: null,
    caption: null,
    children: null,
    disabled: false,
    onChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };

    this.handleVisibleChange = this.handleVisibleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleVisibleChange() {
    if (!this.props.disabled) {
      this.setState(prevState => ({ visible: !prevState.visible }));
    }
  }

  handleSelect(current) {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.onChange(current);
      },
    );
  }

  render() {
    const { caption, sort } = this.props;
    const { visible } = this.state;

    const currentSort = React.Children.map(this.props.children, c => c).find(
      c => c.key === `.$${sort}`,
    );
    const filterCurrentValue = () => {
      if (currentSort && currentSort.props && currentSort.props.children !== 'Reset') {
        return currentSort.props.children;
      }

      return '';
    };
    const currentClassList = classNames('SortSelector__current', {
      'SortSelector__current--disabled': this.props.disabled,
    });

    return (
      <div className="SortSelector">
        <span className="SortSelector__title">
          {caption || <FormattedMessage id="sort_by" defaultMessage="Sort by" />}
        </span>
        <Popover
          trigger="click"
          placement="bottom"
          visible={visible}
          onVisibleChange={this.handleVisibleChange}
          content={
            <PopoverMenu bold onSelect={this.handleSelect}>
              {this.props.children}
            </PopoverMenu>
          }
        >
          <span className={currentClassList}>
            {filterCurrentValue()}
            <i className="iconfont icon-unfold" />
          </span>
        </Popover>
      </div>
    );
  }
}
