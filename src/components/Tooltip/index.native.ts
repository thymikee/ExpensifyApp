// We can't use the common component for the Tooltip as Web implementation uses DOM specific method to
// render the View which is not present on the Mobile.
type Props = {

  /** Children to wrap with Tooltip. */
  children: React.ReactNode
};

const Tooltip = (props: Props) => props.children;

Tooltip.displayName = 'Tooltip';

export default Tooltip;
