import { Show } from 'solid-js';

const defaultTooltipMessage = 'Hi There 👋!';
const defaultTooltipFontSize = 16;

type TooltipProps = {
  showTooltip: boolean;
  position: { bottom: number; right: number };
  buttonSize: number;
  tooltipMessage?: string;
  tooltipFontSize?: number;
};

const Tooltip = (props: TooltipProps) => {
  const tooltipMessage = props.tooltipMessage ?? defaultTooltipMessage;
  const fontSize = `${props.tooltipFontSize ?? defaultTooltipFontSize}px`;

  const formattedTooltipMessage =
    tooltipMessage.length > 20
      ? tooltipMessage
          .split(' ')
          .reduce<string[][]>(
            (acc, curr) => {
              const last = acc[acc.length - 1];
              if (last && last.join(' ').length + curr.length <= 20) {
                last.push(curr);
              } else {
                acc.push([curr]);
              }
              return acc;
            },
            [[]],
          )
          .map((arr) => arr.join(' '))
          .join('\n')
      : tooltipMessage;

  return (
    <Show when={props.showTooltip}>
      <div
        class="tooltip"
        style={{
          right: `calc(${props.position.right}px + 20px)`,
          bottom: `${props.position.bottom + props.buttonSize + 10}px`,
          '--tooltip-font-size': fontSize,
        }}
      >
        {formattedTooltipMessage}
      </div>
    </Show>
  );
};

export default Tooltip;
