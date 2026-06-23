import { Show } from 'solid-js';
import { Avatar } from '@/components/avatars/Avatar';
import { CollapseIcon, ExpandIcon, ResetIcon } from '@/components/icons';
import { BotProps } from '../types';

export type BotHeaderProps = {
  props: BotProps;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onClearChat?: () => void;
};

export const BotHeader = (headerProps: BotHeaderProps) => {
  const { props, isFullScreen, onToggleFullScreen, onClearChat } = headerProps;

  const clearChatButton = (
    <Show when={onClearChat}>
      <button
        type="button"
        onClick={onClearChat}
        class="chatbot-header-icon p-2 bg-transparent rounded-full hover:opacity-90 active:opacity-75 transition-opacity"
        title="Новый чат"
      >
        <ResetIcon class="w-6 h-6" />
      </button>
    </Show>
  );

  const headerRightActions = (
    <div class="flex shrink-0 items-center gap-1 pr-3">
      {clearChatButton}
      <Show when={props.closeBot}>
        <div class="w-8 md:w-10" aria-hidden="true" />
      </Show>
    </div>
  );

  const fullscreenButton = (
    <button
      type="button"
      onClick={onToggleFullScreen}
      class="chatbot-header-icon p-2 bg-transparent rounded-full hover:opacity-90 active:opacity-75 transition-opacity"
      title={isFullScreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
    >
      {isFullScreen ? <CollapseIcon class="w-6 h-6" /> : <ExpandIcon class="w-6 h-6" />}
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
          {headerRightActions}
        </div>
      </Show>
      <Show when={!props.showTitle}>
        <div
          class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-[60px] md:h-[80px] px-2"
          style={{
            background: 'var(--chatbot-header-bg-color)',
            color: 'var(--chatbot-header-color)',
          }}
        >
          <div class="flex shrink-0 items-center gap-1">
            <Show when={props.onFullScreenChange && !props.isFullPage}>{fullscreenButton}</Show>
          </div>
          {headerRightActions}
        </div>
      </Show>
    </>
  );
};
