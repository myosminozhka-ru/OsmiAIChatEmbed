import { createSignal, Show, splitProps, onCleanup, createEffect } from 'solid-js';
import styles from '../../../assets/index.css';
import { BubbleButton } from './BubbleButton';
import { BubbleParams } from '../types';
import { Bot, BotProps } from '../../../components/Bot';
import Tooltip from './Tooltip';
import { DeleteButton } from '../../../components/inputs/textInput';
import { getBubbleButtonSize } from '@/utils';
import { themeColorsToHostCss } from '@/theme/colors';

export type BubbleProps = BotProps & BubbleParams;

const CHAT_OPEN_KEY = (chatflowid: string) => `${chatflowid}_CHAT_OPEN`;

export const Bubble = (props: BubbleProps) => {
  const [bubbleProps] = splitProps(props, ['theme']);

  const storedOpen = () => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem(CHAT_OPEN_KEY(props.chatflowid)) === 'true';
    } catch {
      return false;
    }
  };

  const [isBotOpened, setIsBotOpened] = createSignal(storedOpen());
  const [isBotStarted, setIsBotStarted] = createSignal(storedOpen());
  const [isFullScreen, setIsFullScreen] = createSignal(false);
  const [clearChatRef, setClearChatRef] = createSignal<{ clear: () => void; getCanClear: () => boolean } | null>(null);
  const [buttonPosition, setButtonPosition] = createSignal({
    bottom: bubbleProps.theme?.button?.bottom ?? 20,
    right: bubbleProps.theme?.button?.right ?? 20,
  });

  const openBot = () => {
    if (!isBotStarted()) setIsBotStarted(true);
    setIsBotOpened(true);
    try {
      localStorage.setItem(CHAT_OPEN_KEY(props.chatflowid), 'true');
    } catch {
      // ignore localStorage errors (e.g. private mode, quota)
    }
  };

  const closeBot = () => {
    setIsBotOpened(false);
    try {
      localStorage.setItem(CHAT_OPEN_KEY(props.chatflowid), 'false');
    } catch {
      // ignore localStorage errors (e.g. private mode, quota)
    }
  };

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot();
  };

  onCleanup(() => {
    setIsBotStarted(false);
  });

  const buttonSize = getBubbleButtonSize(props.theme?.button?.size);
  const buttonBottom = props.theme?.button?.bottom ?? 20;
  const chatWindowBottom = buttonBottom + buttonSize + 10;

  createEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, interactive-widget=resizes-content';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  });

  const showTooltip = bubbleProps.theme?.tooltip?.showTooltip ?? false;

  return (
    <>
      <Show when={props.theme?.customCSS}>
        <style>{props.theme?.customCSS}</style>
      </Show>
      <style>{styles}</style>
      <style>{themeColorsToHostCss(props.theme?.colors)}</style>
      <Tooltip
        showTooltip={showTooltip && !isBotOpened()}
        position={buttonPosition()}
        buttonSize={buttonSize}
        tooltipMessage={bubbleProps.theme?.tooltip?.tooltipMessage}
        tooltipFontSize={bubbleProps.theme?.tooltip?.tooltipFontSize}
      />
      <BubbleButton
        {...bubbleProps.theme?.button}
        toggleBot={toggleBot}
        isBotOpened={isBotOpened()}
        setButtonPosition={setButtonPosition}
        dragAndDrop={bubbleProps.theme?.button?.dragAndDrop ?? false}
        autoOpen={bubbleProps.theme?.button?.autoWindowOpen?.autoOpen ?? false}
        openDelay={bubbleProps.theme?.button?.autoWindowOpen?.openDelay}
        autoOpenOnMobile={bubbleProps.theme?.button?.autoWindowOpen?.autoOpenOnMobile ?? false}
      />
      <div
        part="bot"
        style={{
          height: isFullScreen()
            ? '100vh'
            : bubbleProps.theme?.chatWindow?.height
              ? `${bubbleProps.theme?.chatWindow?.height.toString()}px`
              : 'calc(100% - 150px)',
          width: isFullScreen() ? '100vw' : bubbleProps.theme?.chatWindow?.width ? `${bubbleProps.theme?.chatWindow?.width.toString()}px` : undefined,
          top: isFullScreen() ? '0' : undefined,
          left: isFullScreen() ? '0' : undefined,
          transition: 'transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out',
          'transform-origin': 'bottom right',
          transform: isBotOpened() ? 'scale3d(1, 1, 1)' : 'scale3d(0, 0, 1)',
          overflow: 'hidden',
          'z-index': 42424242,
          bottom: isFullScreen() ? '0' : `${Math.min(buttonPosition().bottom + buttonSize + 10, window.innerHeight - chatWindowBottom)}px`,
          right: isFullScreen()
            ? '0'
            : `${Math.max(0, Math.min(buttonPosition().right, window.innerWidth - (bubbleProps.theme?.chatWindow?.width ?? 410) - 10))}px`,
          'max-height': isFullScreen() ? '100vh' : '704px',
        }}
        class={
          `chatbot-window-outer fixed w-full` +
          (isFullScreen() ? ' h-full' : ` sm:right-5 md:rounded-[30px] sm:w-[400px]`) +
          (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none')
        }
      >
        <Show when={isBotStarted()}>
          <div class="relative h-full bg-transparent">
            <Show when={isBotOpened()}>
              <DeleteButton
                type="button"
                isDisabled={clearChatRef()?.getCanClear() ?? true}
                class="py-3 md:py-[22px] pr-2 absolute top-0 right-10 md:right-12 m-[6px] bg-transparent rounded-full z-50 chatbot-close-icon"
                onClick={() => clearChatRef()?.clear()}
                title="Очистить чат"
              >
                <span style={{ 'font-family': 'Montserrat, sans-serif' }}>Clear</span>
              </DeleteButton>
              <button
                onClick={closeBot}
                class="py-3 md:py-[22px] pr-3 absolute top-0 right-0 m-[6px] bg-transparent chatbot-close-icon rounded-full z-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75"
                title="Close Chat"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" class="chatbot-close-icon">
                  <path
                    fill="currentColor"
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                  />
                </svg>
              </button>
            </Show>
            <Bot
              showTitle={bubbleProps.theme?.chatWindow?.showTitle}
              showAgentMessages={bubbleProps.theme?.chatWindow?.showAgentMessages}
              title={bubbleProps.theme?.chatWindow?.title}
              titleAvatarSrc={bubbleProps.theme?.chatWindow?.titleAvatarSrc}
              welcomeMessage={bubbleProps.theme?.chatWindow?.welcomeMessage}
              errorMessage={bubbleProps.theme?.chatWindow?.errorMessage}
              textInput={bubbleProps.theme?.chatWindow?.textInput}
              botMessage={bubbleProps.theme?.chatWindow?.botMessage}
              userMessage={bubbleProps.theme?.chatWindow?.userMessage}
              fontSize={bubbleProps.theme?.chatWindow?.fontSize}
              footer={bubbleProps.theme?.chatWindow?.footer}
              sourceDocsTitle={bubbleProps.theme?.chatWindow?.sourceDocsTitle}
              starterPrompts={bubbleProps.theme?.chatWindow?.starterPrompts}
              starterPromptFontSize={bubbleProps.theme?.chatWindow?.starterPromptFontSize}
              chatflowid={props.chatflowid}
              chatflowConfig={props.chatflowConfig}
              apiHost={props.apiHost}
              onRequest={props.onRequest}
              observersConfig={props.observersConfig}
              clearChatOnReload={bubbleProps.theme?.chatWindow?.clearChatOnReload}
              disclaimer={bubbleProps.theme?.disclaimer}
              dateTimeToggle={bubbleProps.theme?.chatWindow?.dateTimeToggle}
              renderHTML={props.theme?.chatWindow?.renderHTML}
              closeBot={closeBot}
              onFullScreenChange={setIsFullScreen}
              registerClearChat={(clear, getCanClear) => setClearChatRef({ clear, getCanClear })}
            />
          </div>
        </Show>
      </div>
    </>
  );
};
