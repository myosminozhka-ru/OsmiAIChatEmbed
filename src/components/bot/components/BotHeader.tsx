import { Show } from 'solid-js';
import { Avatar } from '@/components/avatars/Avatar';
import { CollapseIcon, ExpandIcon } from '@/components/icons';
import { BotProps } from '../types';

export type BotHeaderProps = {
  props: BotProps;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
};

export const BotHeader = (headerProps: BotHeaderProps) => {
  const { props, isFullScreen, onToggleFullScreen } = headerProps;

  const fullscreenButton = (
    <button
      type="button"
      onClick={onToggleFullScreen}
      class="p-2 bg-transparent text-white rounded-full hover:opacity-90 active:opacity-75 transition-opacity"
      title={isFullScreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
    >
      {isFullScreen ? <CollapseIcon class="w-6 h-6" color={props.bubbleTextColor} /> : <ExpandIcon class="w-6 h-6" color={props.bubbleTextColor} />}
    </button>
  );

  return (
    <>
      <Show when={props.showTitle}>
        <div
          class="flex flex-row items-center w-full h-[60px] md:h-[80px] absolute top-0 left-0 z-10"
          style={{
            background: 'var(--chatbot-header-bg-color)',
            color: 'var(--chatbot-header-color)',
          }}
        >
          <div class="flex shrink-0 items-center gap-1 pl-3">
            <Show when={!props.isFullPage}>{fullscreenButton}</Show>
            <Show when={props.titleAvatarSrc}>
              <Avatar initialAvatarSrc={props.titleAvatarSrc} />
            </Show>
          </div>
          <div class="flex flex-1 absolute left-0 right-0 top-0 bottom-0 justify-center items-center pointer-events-none">
            <span class="px-3 whitespace-pre-wrap font-semibold text-center uppercase truncate max-w-full">{props.title || 'чат-бот'}</span>
          </div>
          <div class="flex shrink-0 w-[72px] md:w-[80px] pointer-events-none" aria-hidden="true" />
        </div>
      </Show>
      <Show when={!props.showTitle && props.onFullScreenChange && !props.isFullPage}>
        <div
          class="absolute top-0 left-0 z-10 flex items-center pl-2 pt-2"
          style={{
            background: 'var(--chatbot-header-bg-color)',
            color: 'var(--chatbot-header-color)',
          }}
        >
          {fullscreenButton}
        </div>
      </Show>
    </>
  );
};
