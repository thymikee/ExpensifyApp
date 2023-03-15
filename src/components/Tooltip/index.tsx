import _ from 'underscore';
import React, { PureComponent, ReactNode } from 'react';
import { Animated, View } from 'react-native';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import { defaultProps } from './tooltipPropTypes';
import TooltipSense from './TooltipSense';
import makeCancellablePromise from '../../libs/MakeCancellablePromise';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

type Props = {

  /** Enable support for the absolute positioned native(View|Text) children. It will only work for single native child  */
  absolute?: boolean,

  /** The text to display in the tooltip. */
  text: string,

  /** Maximum number of lines to show in tooltip */
  numberOfLines: number,

  /** Styles to be assigned to the Tooltip wrapper views */
  containerStyles?: Object[],

  /** Children to wrap with Tooltip. */
  children: React.ReactNode,

  /** Props inherited from withWindowDimensions */
  // Width of the window
  windowWidth: number,

  // Height of the window
  windowHeight: number,

  // Is the window width narrow, like on a mobile device?
  isSmallScreenWidth: boolean,

  // Is the window width narrow, like on a tablet device?
  isMediumScreenWidth: boolean,

  // Is the window width wide, like on a browser or desktop?
  isLargeScreenWidth: boolean,

  /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
  shiftHorizontal?: number | Function,

  /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
  shiftVertical?: number | Function,

  /** Number of pixels to set max-width on tooltip  */
  maxWidth?: number,

  /** Accessibility prop. Sets the tabindex to 0 if true. Default is true. */
  focusable?: boolean,

  /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
  renderTooltipContent?: Function,
};

type State = {
  isRendered: boolean,

  // The distance between the left side of the wrapper view and the left side of the window
  xOffset: number,

  // The distance between the top of the wrapper view and the top of the window
  yOffset: number,

  // The width and height of the wrapper view
  wrapperWidth: number,
  wrapperHeight: number,
};

class Tooltip extends PureComponent<Props, State> {
  animation: any;

  getWrapperPositionPromise: any;

  hasHoverSupport: any;

  isTooltipSenseInitiator: any;

  shouldStartShowAnimation: any;

  wrapperView: any;

  static defaultProps = defaultProps;

  constructor(props: Props) {
    super(props);

    this.state = {
      // Is tooltip rendered?
      isRendered: false,

      // The distance between the left side of the wrapper view and the left side of the window
      xOffset: 0,

      // The distance between the top of the wrapper view and the top of the window
      yOffset: 0,

      // The width and height of the wrapper view
      wrapperWidth: 0,
      wrapperHeight: 0,
    };

    // Whether the tooltip is first tooltip to activate the TooltipSense
    this.isTooltipSenseInitiator = false;
    this.shouldStartShowAnimation = false;
    this.animation = new Animated.Value(0);
    this.hasHoverSupport = DeviceCapabilities.hasHoverSupport();

    this.getWrapperPosition = this.getWrapperPosition.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.windowWidth === prevProps.windowWidth && this.props.windowHeight === prevProps.windowHeight) {
      return;
    }

    this.getWrapperPositionPromise = makeCancellablePromise(this.getWrapperPosition());
    this.getWrapperPositionPromise.promise
      .then(({
        x,
        y,
      }: any) => this.setState({ xOffset: x, yOffset: y }));
  }

  componentWillUnmount() {
    if (!this.getWrapperPositionPromise) {
      return;
    }

    this.getWrapperPositionPromise.cancel();
  }

  /**
     * Measure the position of the wrapper view relative to the window.
     *
     * @returns {Promise}
     */
  getWrapperPosition() {
    return new Promise(((resolve) => {
      // Make sure the wrapper is mounted before attempting to measure it.
      if (this.wrapperView && _.isFunction(this.wrapperView.measureInWindow)) {
        this.wrapperView.measureInWindow((x: any, y: any, width: any, height: any) => resolve({
          x, y, width, height,
        }));
      } else {
        resolve({
          x: 0, y: 0, width: 0, height: 0,
        });
      }
    }));
  }

  /**
     * Display the tooltip in an animation.
     */
  showTooltip() {
    if (!this.state.isRendered) {
      this.setState({ isRendered: true });
    }
    this.animation.stopAnimation();
    this.shouldStartShowAnimation = true;

    // We have to dynamically calculate the position here as tooltip could have been rendered on some elments
    // that has changed its position
    this.getWrapperPositionPromise = makeCancellablePromise(this.getWrapperPosition());
    this.getWrapperPositionPromise.promise
      .then(({
        x,
        y,
        width,
        height,
      }: any) => {
        this.setState({
          wrapperWidth: width,
          wrapperHeight: height,
          xOffset: x,
          yOffset: y,
        });

        // We may need this check due to the reason that the animation start will fire async
        // and hideTooltip could fire before it thus keeping the Tooltip visible
        if (this.shouldStartShowAnimation) {
          // When TooltipSense is active, immediately show the tooltip
          if (TooltipSense.isActive()) {
            this.animation.setValue(1);
          } else {
            this.isTooltipSenseInitiator = true;
            Animated.timing(this.animation, {
              toValue: 1,
              duration: 140,
              delay: 500,
              useNativeDriver: false,
            }).start();
          }
          TooltipSense.activate();
        }
      });
  }

  /**
     * Hide the tooltip in an animation.
     */
  hideTooltip() {
    this.animation.stopAnimation();
    this.shouldStartShowAnimation = false;
    if (TooltipSense.isActive() && !this.isTooltipSenseInitiator) {
      this.animation.setValue(0);
    } else {
      // Hide the first tooltip which initiated the TooltipSense with animation
      this.isTooltipSenseInitiator = false;
      Animated.timing(this.animation, {
        toValue: 0,
        duration: 140,
        useNativeDriver: false,
      }).start();
    }
    TooltipSense.deactivate();
  }

  render() {
    // Skip the tooltip and return the children if the text is empty,
    // we don't have a render function or the device does not support hovering
    if ((_.isEmpty(this.props.text) && this.props.renderTooltipContent == null) || !this.hasHoverSupport) {
      return this.props.children;
    }
    let child = (
        <View
            ref={el => this.wrapperView = el}

                // @ts-expect-error TS(2769) FIXME: No overload matches this call.
            onBlur={this.hideTooltip}

            focusable={this.props.focusable}

            style={this.props.containerStyles}
        >
            {this.props.children}
        </View>
    );

    if (this.props.absolute && React.isValidElement(this.props.children)) {
      child = React.cloneElement(React.Children.only(this.props.children), {
        // @ts-expect-error todo fix
        ref: (el: any) => {
          this.wrapperView = el;

          // Call the original ref, if any
          // @ts-expect-error TS(2339) FIXME: Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
          const { ref } = this.props.children;
          if (_.isFunction(ref)) {
            ref(el);
          }
        },
        onBlur: (el: any) => {
          this.hideTooltip();

          // Call the original onBlur, if any
          // @ts-expect-error TS(2339) FIXME: Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
          const { onBlur } = this.props.children;
          if (_.isFunction(onBlur)) {
            onBlur(el);
          }
        },
        focusable: true,
      });
    }

    return (
        <>
            {/* // @ts-expect-error TS(2339): Property 'isRendered' does not exist on type 'Read... Remove this comment to see the full error message */}
            {/* // @ts-expect-error TS(2339) FIXME: Property 'isRendered' does not exist on type 'Read... Remove this comment to see the full error message */}
            {this.state.isRendered && (
            <TooltipRenderedOnPageBody
                animation={this.animation}
                windowWidth={this.props.windowWidth}
                xOffset={this.state.xOffset}
                yOffset={this.state.yOffset}
                wrapperWidth={this.state.wrapperWidth}
                wrapperHeight={this.state.wrapperHeight}
                shiftHorizontal={_.result(this.props, 'shiftHorizontal')}
                shiftVertical={_.result(this.props, 'shiftVertical')}
                text={this.props.text}
                maxWidth={this.props.maxWidth}
                numberOfLines={this.props.numberOfLines}
                renderTooltipContent={this.props.renderTooltipContent}
            />
            )}
            <Hoverable
                absolute={this.props.absolute}
                containerStyles={this.props.containerStyles}
                onHoverIn={this.showTooltip}
                onHoverOut={this.hideTooltip}
            >
                {child}
            </Hoverable>
        </>
    );
  }
}

// @ts-expect-error TS(2345) FIXME: Argument of type 'typeof Tooltip' is not assignabl... Remove this comment to see the full error message
export default withWindowDimensions(Tooltip);
