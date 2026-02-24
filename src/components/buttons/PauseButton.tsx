import { JSX } from 'solid-js/jsx-runtime';
import { PauseIcon } from '../icons/PauseIcon';

type PauseButtonProps = {
  buttonColor?: string;
  isDisabled?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const PauseButton = (props: PauseButtonProps) => {
  return (
    <button
      type="submit"
      disabled={props.isDisabled}
      {...props}
      class={
        'py-2 px-4 justify-center font-semibold focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        props.class
      }
      style={{ background: 'transparent', border: 'none' }}
    >
      <PauseIcon class="w-6 h-6" color={props.buttonColor} />
    </button>
  );
};
