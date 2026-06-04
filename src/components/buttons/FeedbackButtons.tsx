import { JSX, Show, splitProps } from 'solid-js';
import { Spinner } from './SendButton';
import { ClipboardIcon, ThumbsDownIcon, ThumbsUpIcon } from '../icons';
import { effect } from 'solid-js/web';

type RatingButtonProps = {
  iconColor?: string;
  filled?: boolean;
  feedbackColor?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
  rating?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const buttonPropsKeys = ['iconColor', 'filled', 'feedbackColor', 'isDisabled', 'isLoading', 'disableIcon', 'rating'] as const;

const resolveIconColor = (props: Pick<RatingButtonProps, 'iconColor' | 'feedbackColor'>) => props.iconColor ?? props.feedbackColor ?? '#ffffff';

const feedbackIconClass = (disableIcon?: boolean) => 'flex ' + (disableIcon ? 'hidden' : '');

export const CopyToClipboardButton = (props: RatingButtonProps) => {
  const [local, buttonProps] = splitProps(props, buttonPropsKeys);

  return (
    <button
      disabled={local.isDisabled || local.isLoading}
      {...buttonProps}
      class={
        'p-2 justify-center font-semibold text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        buttonProps.class
      }
      style={{ background: 'transparent', border: 'none' }}
      title="Скопировать"
    >
      <Show when={!local.isLoading} fallback={<Spinner class="text-white" />}>
        <ClipboardIcon color={resolveIconColor(local)} filled={local.filled} class={feedbackIconClass(local.disableIcon)} />
      </Show>
    </button>
  );
};

export const ThumbsUpButton = (props: RatingButtonProps) => {
  const [local, buttonProps] = splitProps(props, buttonPropsKeys);

  return (
    <button
      type="submit"
      disabled={local.isDisabled || local.isLoading}
      {...buttonProps}
      class={
        'p-2 justify-center font-semibold text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        buttonProps.class
      }
      style={{ background: 'transparent', border: 'none' }}
      title="Понравилось"
    >
      <Show when={!local.isLoading} fallback={<Spinner class="text-white" />}>
        <ThumbsUpIcon color={resolveIconColor(local)} filled={local.filled} class={feedbackIconClass(local.disableIcon)} />
      </Show>
    </button>
  );
};

export const ThumbsDownButton = (props: RatingButtonProps) => {
  const [local, buttonProps] = splitProps(props, buttonPropsKeys);

  return (
    <button
      type="submit"
      disabled={local.isDisabled || local.isLoading}
      {...buttonProps}
      class={
        'p-2 justify-center font-semibold text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        buttonProps.class
      }
      style={{ background: 'transparent', border: 'none' }}
      title="Не понравилось"
    >
      <Show when={!local.isLoading} fallback={<Spinner class="text-white" />}>
        <ThumbsDownIcon color={resolveIconColor(local)} filled={local.filled} class={feedbackIconClass(local.disableIcon)} />
      </Show>
    </button>
  );
};
