import variables from '../../styles/variables';
import CONST from '../../CONST';

const defaultProps = {
  absolute: false,
  shiftHorizontal: 0,
  shiftVertical: 0,
  containerStyles: [],
  text: '',
  maxWidth: variables.sideBarWidth,
  numberOfLines: CONST.TOOLTIP_MAX_LINES,
  renderTooltipContent: undefined,
  focusable: true,
};

export {
  defaultProps,
};

export type Props = {

  /** Enable support for the absolute positioned native(View|Text) children. It will only work for single native child  */
  absolute?: boolean,

  /** The text to display in the tooltip. */
  text?: string,

  /** Maximum number of lines to show in tooltip */
  numberOfLines?: number,

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
