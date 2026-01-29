import { JSX } from 'solid-js/jsx-runtime';
import { SendIcon } from '../icons';
import { IconButton } from './IconButton';

type SendButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const SendButton = (props: SendButtonProps) => {
  return (
    <IconButton
      type="submit"
      disabled={props.isDisabled || props.isLoading}
      ariaLabel="Отправить сообщение"
      {...props}
      class={props.class}
      icon={<SendIcon class={props.disableIcon ? 'hidden' : ''} />}
    />
  );
};

export { DeleteButton } from './DeleteButton';

export const Spinner = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg
    {...props}
    class={'animate-spin -ml-1 mr-3 h-5 w-5 ' + props.class}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    data-testid="loading-spinner"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
