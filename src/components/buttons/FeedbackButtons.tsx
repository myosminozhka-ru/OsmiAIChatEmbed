import { JSX, Show, splitProps } from 'solid-js';
import { Spinner } from './SendButton';
import { ClipboardIcon, ThumbsDownIcon, ThumbsUpIcon } from '../icons';

type RatingButtonProps = {
  filled?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
  rating?: string;
  activeVariant?: 'positive' | 'negative' | 'default' | 'copied';
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const buttonPropsKeys = ['filled', 'isDisabled', 'isLoading', 'disableIcon', 'rating', 'activeVariant'] as const;

const iconClass = (local: Pick<RatingButtonProps, 'disableIcon' | 'activeVariant'>) => {
  const base = 'flex ' + (local.disableIcon ? 'hidden' : '');
  if (local.activeVariant === 'positive') return base + ' chatbot-feedback-icon-active-positive';
  if (local.activeVariant === 'negative') return base + ' chatbot-feedback-icon-active-negative';
  if (local.activeVariant === 'copied') return base + ' chatbot-feedback-icon';
  return base + ' chatbot-host-bubble';
};

export const CopyToClipboardButton = (props: RatingButtonProps) => {
  const [local, buttonProps] = splitProps(props, buttonPropsKeys);

  return (
    <button
      disabled={local.isDisabled || local.isLoading}
      {...buttonProps}
      class={
        'chatbot-feedback-icon p-2 justify-center font-semibold focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        buttonProps.class
      }
      style={{ background: 'transparent', border: 'none' }}
      title="Скопировать"
    >
      <Show when={!local.isLoading} fallback={<Spinner />}>
        <ClipboardIcon filled={local.filled} class={iconClass({ ...local, activeVariant: local.filled ? 'copied' : 'default' })} />
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
        'chatbot-feedback-icon p-2 justify-center font-semibold focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        buttonProps.class
      }
      style={{ background: 'transparent', border: 'none' }}
      title="Понравилось"
    >
      <Show when={!local.isLoading} fallback={<Spinner />}>
        <ThumbsUpIcon filled={local.filled} class={iconClass({ ...local, activeVariant: local.rating === 'THUMBS_UP' ? 'positive' : 'default' })} />
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
        'chatbot-feedback-icon p-2 justify-center font-semibold focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 chatbot-button ' +
        buttonProps.class
      }
      style={{ background: 'transparent', border: 'none' }}
      title="Не понравилось"
    >
      <Show when={!local.isLoading} fallback={<Spinner />}>
        <ThumbsDownIcon
          filled={local.filled}
          class={iconClass({ ...local, activeVariant: local.rating === 'THUMBS_DOWN' ? 'negative' : 'default' })}
        />
      </Show>
    </button>
  );
};
