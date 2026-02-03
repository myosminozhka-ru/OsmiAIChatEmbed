import { JSX } from 'solid-js/jsx-runtime';
import { XIcon } from '../icons';

type CancelButtonProps = {
  buttonColor?: string; // не используется, для совместимости с вызовами из Bot
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
  text?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const CancelButton = (props: CancelButtonProps) => {
  const { buttonColor: _omit, ...rest } = props;
  return (
    <button
      type="submit"
      disabled={props.isDisabled || props.isLoading}
      {...rest}
      class={
        'justify-center flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        (props.class || '')
      }
      style={{ background: 'transparent', border: 'none' }}
    >
      <XIcon />
      {props.text && <span class="ml-2">{props.text}</span>}
    </button>
  );
};
