import React from 'react';
import { Animated, View } from 'react-native';

// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import ReactDOM from 'react-dom';
import getTooltipStyles from '../../styles/getTooltipStyles';
import Text from '../Text';
import Log from '../../libs/Log';

const defaultProps = {
  shiftHorizontal: 0,
  shiftVertical: 0,
  renderTooltipContent: undefined,
  maxWidth: 0,
};

type Props = {

  /** Window width */
  windowWidth: number,

  /** Tooltip Animation value */
  animation: number,

  /** The distance between the left side of the wrapper view and the left side of the window */
  xOffset: number,

  /** The distance between the top of the wrapper view and the top of the window */
  yOffset: number,

  /** The width of the tooltip wrapper */
  wrapperWidth: number,

  /** The Height of the tooltip wrapper */
  wrapperHeight: number,

  /** Any additional amount to manually adjust the horizontal position of the tooltip.
            A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
  shiftHorizontal?: number,

  /** Any additional amount to manually adjust the vertical position of the tooltip.
            A positive value shifts the tooltip down, and a negative value shifts it up. */
  shiftVertical?: number,

  /** Text to be shown in the tooltip */
  text: string,

  /** Maximum number of lines to show in tooltip */
  numberOfLines: number,

  /** Number of pixels to set max-width on tooltip  */
  maxWidth: number,

  /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
  renderTooltipContent?: Function,

};

type State = {
  tooltipContentWidth?: number,

  // The width and height of the tooltip itself
  tooltipWidth: number,
  tooltipHeight: number,
};

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// It's good to memorize this one.
class TooltipRenderedOnPageBody extends React.PureComponent<Props, State> {
  contentRef: any;

  static defaultProps = defaultProps;

  constructor(props: Props) {
    super(props);
    this.state = {
      // The width of tooltip's inner content. Has to be undefined in the beginning
      // as a width of 0 will cause the content to be rendered of a width of 0,
      // which prevents us from measuring it correctly.
      tooltipContentWidth: undefined,

      // The width and height of the tooltip itself
      tooltipWidth: 0,
      tooltipHeight: 0,
    };

    if (props.renderTooltipContent && props.text) {
      Log.warn('Developer error: Cannot use both text and renderTooltipContent props at the same time in <TooltipRenderedOnPageBody />!');
    }

    this.measureTooltip = this.measureTooltip.bind(this);
    this.updateTooltipContentWidth = this.updateTooltipContentWidth.bind(this);
  }

  componentDidMount() {
    this.updateTooltipContentWidth();
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.text === this.props.text && prevProps.renderTooltipContent === this.props.renderTooltipContent) {
      return;
    }

    // Reset the tooltip text width to 0 so that we can measure it again.
    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({ tooltipContentWidth: undefined }, this.updateTooltipContentWidth);
  }

  updateTooltipContentWidth() {
    if (!this.contentRef) {
      return;
    }

    this.setState({
      tooltipContentWidth: this.contentRef.offsetWidth,
    });
  }

  /**
     * Measure the size of the tooltip itself.
     *
     * @param {Object} nativeEvent
     */
  measureTooltip({
    nativeEvent,
  }: any) {
    this.setState({
      tooltipWidth: nativeEvent.layout.width,
      tooltipHeight: nativeEvent.layout.height,
    });
  }

  render() {
    const {
      // @ts-expect-error todo
      animationStyle,

      // @ts-expect-error todo
      tooltipWrapperStyle,

      // @ts-expect-error todo
      tooltipTextStyle,

      // @ts-expect-error todo
      pointerWrapperStyle,

      // @ts-expect-error todo
      pointerStyle,
    } = getTooltipStyles(
      this.props.animation,
      this.props.windowWidth,
      this.props.xOffset,
      this.props.yOffset,
      this.props.wrapperWidth,
      this.props.wrapperHeight,
      this.props.maxWidth,
      this.state.tooltipWidth,
      this.state.tooltipHeight,

      // @ts-expect-error todo
      this.state.tooltipContentWidth,
      this.props.shiftHorizontal,
      this.props.shiftVertical,
    );

    const contentRef = (ref: any) => {
      // Once the content for the tooltip first renders, update the width of the tooltip dynamically to fit the width of the content.
      // Note that we can't have this code in componentDidMount because the ref for the content won't be set until after the first render
      if (this.contentRef) {
        return;
      }

      this.contentRef = ref;
      this.updateTooltipContentWidth();
    };

    let content;

    if (this.props.renderTooltipContent) {
      content = (
          <View ref={contentRef}>
              {this.props.renderTooltipContent()}
          </View>
      );
    } else {
      content = (
          <Text numberOfLines={this.props.numberOfLines} style={tooltipTextStyle}>
              <Text style={tooltipTextStyle} ref={contentRef}>
                  {this.props.text}
              </Text>
          </Text>
      );
    }

    return ReactDOM.createPortal(
        <Animated.View
            onLayout={this.measureTooltip}
            style={[tooltipWrapperStyle, animationStyle]}
        >
            {content}
            <View style={pointerWrapperStyle}>
                <View style={pointerStyle} />
            </View>
        </Animated.View>,
        document.querySelector('body'),
    );
  }
}

export default TooltipRenderedOnPageBody;
