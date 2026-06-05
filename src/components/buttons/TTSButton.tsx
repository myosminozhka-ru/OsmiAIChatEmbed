import { Show } from 'solid-js';
import { VolumeIcon, CircleDotIcon } from '../icons';

type Props = {
  isLoading?: boolean;
  isPlaying?: boolean;
  onClick: () => void;
  class?: string;
};

export const TTSButton = (props: Props) => {
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    if (props.isLoading) return;
    props.onClick();
  };

  const getTooltip = () => {
    if (props.isLoading) return 'Loading audio...';
    if (props.isPlaying) return 'Stop audio';
    return 'Play audio';
  };

  return (
    <button
      class={`chatbot-feedback-icon py-2 px-2 justify-center font-semibold focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all filter hover:brightness-90 active:brightness-75 ${
        props.class ?? ''
      }`}
      style={{ background: 'transparent', border: 'none' }}
      disabled={props.isLoading}
      onClick={handleClick}
      type="button"
      title={getTooltip()}
    >
      <Show
        when={!props.isLoading}
        fallback={
          <div
            class="animate-spin rounded-full border-2 border-current border-t-transparent"
            style={{
              width: '16px',
              height: '16px',
            }}
          />
        }
      >
        <Show when={!props.isPlaying} fallback={<CircleDotIcon color="var(--chatbot-feedback-negative-color)" />}>
          <VolumeIcon />
        </Show>
      </Show>
    </button>
  );
};
