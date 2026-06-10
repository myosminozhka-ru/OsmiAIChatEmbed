import { createEffect, Show, createSignal, onMount, For } from 'solid-js';
import { Avatar } from '../avatars/Avatar';
import { Marked } from '@ts-stack/markdown';
import { FeedbackRatingType, sendFeedbackQuery, sendFileDownloadQuery, sendMessageQuery, updateFeedbackQuery } from '@/queries/sendMessageQuery';
import { FileUpload, IAction, MessageType } from '../Bot';
import { CopyToClipboardButton, ThumbsDownButton, ThumbsUpButton } from '../buttons/FeedbackButtons';
import { TTSButton } from '../buttons/TTSButton';
import FeedbackContentDialog from '../FeedbackContentDialog';
import { AgentReasoningBubble } from './AgentReasoningBubble';
import { TickIcon, XIcon } from '../icons';
import { SourceBubble } from '../bubbles/SourceBubble';
import { DateTimeToggleTheme } from '@/features/bubble/types';
import { WorkflowTreeView } from '../treeview/WorkflowTreeView';
import { StarterPromptBubble } from './StarterPromptBubble';
import { MessageImage } from './MessageImage';
import { effect } from 'solid-js/web';

type Props = {
  message: MessageType;
  chatflowid: string;
  chatId: string;
  apiHost?: string;
  onRequest?: (request: RequestInit) => Promise<void>;
  fileAnnotations?: any;
  showAvatar?: boolean;
  avatarSrc?: string;
  chatFeedbackStatus?: boolean;
  fontSize?: number;
  isLoading: boolean;
  dateTimeToggle?: DateTimeToggleTheme;
  showAgentMessages?: boolean;
  sourceDocsTitle?: string;
  renderHTML?: boolean;
  handleActionClick: (elem: any, action: IAction | undefined | null) => void;
  handleSourceDocumentsClick: (src: any) => void;
  // TTS props
  isTTSEnabled?: boolean;
  isTTSLoading?: Record<string, boolean>;
  isTTSPlaying?: Record<string, boolean>;
  handleTTSClick?: (messageId: string, messageText: string) => void;
  handleTTSStop?: (messageId: string) => void;
  starterPrompts?: string[];
  starterPromptFontSize?: number;
  onStarterPromptClick?: (prompt: string) => void;
  showFeedback?: boolean;
};

const defaultFontSize = 16;

export const BotBubble = (props: Props) => {
  let botDetailsEl: HTMLDetailsElement | undefined;

  Marked.setOptions({ isNoP: true, sanitize: props.renderHTML !== undefined ? !props.renderHTML : true });

  const [rating, setRating] = createSignal('');
  const [feedbackId, setFeedbackId] = createSignal('');
  const [showFeedbackContentDialog, setShowFeedbackContentModal] = createSignal(false);
  const [copiedMessage, setCopiedMessage] = createSignal(false);

  // Store a reference to the bot message element for the copyMessageToClipboard function
  const [botMessageElement, setBotMessageElement] = createSignal<HTMLElement | null>(null);

  const setBotMessageRef = (el: HTMLDivElement) => {
    if (el) {
      el.innerHTML = Marked.parse(props.message.message);

      // Set target="_blank" for links
      el.querySelectorAll('a').forEach((link) => {
        link.target = '_blank';
      });

      // Store the element ref for the copy function
      setBotMessageElement(el);

      if (props.message.rating) {
        setRating(props.message.rating);
      }
      if (props.fileAnnotations && props.fileAnnotations.length) {
        for (const annotations of props.fileAnnotations) {
          const button = document.createElement('button');
          button.textContent = annotations.fileName;
          button.className =
            'py-2 px-4 mb-2 justify-center font-semibold text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 file-annotation-button';
          button.addEventListener('click', function () {
            downloadFile(annotations);
          });
          const svgContainer = document.createElement('div');
          svgContainer.className = 'ml-2';
          svgContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-download" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>`;

          button.appendChild(svgContainer);
          el.appendChild(button);
        }
      }
    }
  };

  const downloadFile = async (fileAnnotation: any) => {
    try {
      const response = await sendFileDownloadQuery({
        apiHost: props.apiHost,
        body: { fileName: fileAnnotation.fileName, chatflowId: props.chatflowid, chatId: props.chatId } as any,
        onRequest: props.onRequest,
      });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileAnnotation.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const copyMessageToClipboard = async () => {
    try {
      const text = botMessageElement() ? botMessageElement()?.textContent : '';
      await navigator.clipboard.writeText(text || '');
      setCopiedMessage(true);
      setTimeout(() => {
        setCopiedMessage(false);
      }, 2000); // Hide the message after 2 seconds
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const saveToLocalStorage = (rating: FeedbackRatingType) => {
    const chatDetails = localStorage.getItem(`${props.chatflowid}_EXTERNAL`);
    if (!chatDetails) return;
    try {
      const parsedDetails = JSON.parse(chatDetails);
      const messages: MessageType[] = parsedDetails.chatHistory || [];
      const message = messages.find((msg) => msg.messageId === props.message.messageId);
      if (!message) return;
      message.rating = rating;
      localStorage.setItem(`${props.chatflowid}_EXTERNAL`, JSON.stringify({ ...parsedDetails, chatHistory: messages }));
    } catch (e) {
      return;
    }
  };

  const isValidURL = (url: string): URL | undefined => {
    try {
      return new URL(url);
    } catch (err) {
      return undefined;
    }
  };

  const removeDuplicateURL = (message: MessageType) => {
    const visitedURLs: string[] = [];
    const newSourceDocuments: any = [];

    message.sourceDocuments.forEach((source: any) => {
      if (isValidURL(source.metadata.source) && !visitedURLs.includes(source.metadata.source)) {
        visitedURLs.push(source.metadata.source);
        newSourceDocuments.push(source);
      } else if (!isValidURL(source.metadata.source)) {
        newSourceDocuments.push(source);
      }
    });
    return newSourceDocuments;
  };

  const onThumbsUpClick = async () => {
    if (rating() === '') {
      const body = {
        chatflowid: props.chatflowid,
        chatId: props.chatId,
        messageId: props.message?.messageId as string,
        rating: 'THUMBS_UP' as FeedbackRatingType,
        content: '',
      };
      const result = await sendFeedbackQuery({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        body,
        onRequest: props.onRequest,
      });

      if (result.data) {
        const data = result.data as any;
        let id = '';
        if (data && data.id) id = data.id;
        setRating('THUMBS_UP');
        setFeedbackId(id);
        setShowFeedbackContentModal(true);
        saveToLocalStorage('THUMBS_UP');
      }
    }
  };

  const onThumbsDownClick = async () => {
    if (rating() === '') {
      const body = {
        chatflowid: props.chatflowid,
        chatId: props.chatId,
        messageId: props.message?.messageId as string,
        rating: 'THUMBS_DOWN' as FeedbackRatingType,
        content: '',
      };
      const result = await sendFeedbackQuery({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        body,
        onRequest: props.onRequest,
      });

      if (result.data) {
        const data = result.data as any;
        let id = '';
        if (data && data.id) id = data.id;
        setRating('THUMBS_DOWN');
        setFeedbackId(id);
        setShowFeedbackContentModal(true);
        saveToLocalStorage('THUMBS_DOWN');
      }
    }
  };

  const submitFeedbackContent = async (text: string) => {
    const body = {
      content: text,
    };
    const result = await updateFeedbackQuery({
      id: feedbackId(),
      apiHost: props.apiHost,
      body,
      onRequest: props.onRequest,
    });

    if (result.data) {
      setFeedbackId('');
      setShowFeedbackContentModal(false);
    }
  };

  onMount(() => {
    if (botDetailsEl && props.isLoading) {
      botDetailsEl.open = true;
    }
  });

  createEffect(() => {
    if (botDetailsEl && props.isLoading) {
      botDetailsEl.open = true;
    } else if (botDetailsEl && !props.isLoading) {
      botDetailsEl.open = false;
    }
  });

  const getImageArtifactSrc = (item: Partial<FileUpload>) => {
    const isFileStorage = typeof item.data === 'string' && item.data.startsWith('FILE-STORAGE::');
    return isFileStorage
      ? `${props.apiHost}/api/v1/get-upload-file?chatflowId=${props.chatflowid}&chatId=${props.chatId}&fileName=${(item.data as string).replace(
          'FILE-STORAGE::',
          '',
        )}`
      : (item.data as string);
  };

  const imageArtifacts = () => props.message.artifacts?.filter((item) => item && (item.type === 'png' || item.type === 'jpeg')) ?? [];
  const otherArtifacts = () => props.message.artifacts?.filter((item) => item && item.type !== 'png' && item.type !== 'jpeg') ?? [];
  const hasImageMessage = () => imageArtifacts().length > 0;

  const renderOtherArtifacts = (item: Partial<FileUpload>) => {
    // Instead of onMount, we'll use a callback ref to apply styles
    const setArtifactRef = (el: HTMLSpanElement) => {
      if (el) {
        el.querySelectorAll('a').forEach((link) => {
          link.target = '_blank';
        });
      }
    };

    return (
      <>
        <Show when={item.type === 'html'}>
          <div class="mt-2">
            <div innerHTML={item.data as string} />
          </div>
        </Show>
        <Show when={item.type !== 'png' && item.type !== 'jpeg' && item.type !== 'html'}>
          <span
            ref={setArtifactRef}
            innerHTML={Marked.parse(item.data as string)}
            class="prose chatbot-host-bubble"
            style={{
              'border-radius': '6px',
              'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px`,
            }}
          />
        </Show>
      </>
    );
  };

  const formatDateTime = (dateTimeString: string | undefined, showDate: boolean | undefined, showTime: boolean | undefined) => {
    if (!dateTimeString) return '';

    try {
      const date = new Date(dateTimeString);

      if (isNaN(date.getTime())) {
        console.error('Invalid ISO date string:', dateTimeString);
        return '';
      }

      const showDateVal = showDate === true;
      const showTimeVal = showTime !== false; // show time by default when dateTime is present
      let formatted = '';

      if (showDateVal) {
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        const [{ value: month }, , { value: day }, , { value: year }] = dateFormatter.formatToParts(date);
        formatted = `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}, ${year}`;
      }

      if (showTimeVal) {
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        const timeString = timeFormatter.format(date);
        formatted = formatted ? `${formatted}, ${timeString}` : timeString;
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formattedDateTime = () => formatDateTime(props.message.dateTime, props?.dateTimeToggle?.date, props?.dateTimeToggle?.time);

  return (
    <div>
      <div class="flex flex-col gap-4 justify-start mb-2 items-start host-container">
        <Show when={props.showAvatar}>
          <Avatar initialAvatarSrc={props.avatarSrc} />
        </Show>
        <div class="flex flex-col justify-start">
          {props.showAgentMessages &&
            props.message.agentFlowExecutedData &&
            Array.isArray(props.message.agentFlowExecutedData) &&
            props.message.agentFlowExecutedData.length > 0 && (
              <div>
                <WorkflowTreeView workflowData={props.message.agentFlowExecutedData} indentationLevel={24} />
              </div>
            )}
          {props.showAgentMessages && props.message.agentReasoning && (
            <details ref={botDetailsEl} class="mb-2 px-4 py-2 chatbot-host-bubble rounded-[6px]">
              <summary class="cursor-pointer">
                <span class="italic">Agent Messages</span>
              </summary>
              <br />
              <For each={props.message.agentReasoning}>
                {(agent) => {
                  const agentMessages = agent.messages ?? [];
                  let msgContent = agent.instructions || (agentMessages.length > 1 ? agentMessages.join('\\n') : agentMessages[0]);
                  if (agentMessages.length === 0 && !agent.instructions) msgContent = `<p>Finished</p>`;
                  return (
                    <AgentReasoningBubble
                      agentName={agent.agentName ?? ''}
                      agentMessage={msgContent}
                      agentArtifacts={agent.artifacts}
                      fontSize={props.fontSize}
                      apiHost={props.apiHost}
                      chatflowid={props.chatflowid}
                      chatId={props.chatId}
                      renderHTML={props.renderHTML}
                    />
                  );
                }}
              </For>
            </details>
          )}
          <Show when={hasImageMessage()}>
            <div class="flex flex-col w-full max-w-[487px] gap-2">
              <Show when={formattedDateTime()}>
                <span class="text-[12px] text-gray-500">{formattedDateTime()}</span>
              </Show>
              <For each={imageArtifacts()}>{(item) => <MessageImage src={getImageArtifactSrc(item)} />}</For>
            </div>
          </Show>
          {otherArtifacts().length > 0 && (
            <div class="flex flex-row items-start flex-wrap w-full gap-2">
              <For each={otherArtifacts()}>
                {(item) => {
                  return item !== null ? <>{renderOtherArtifacts(item)}</> : null;
                }}
              </For>
            </div>
          )}
          {props.message.message && (
            <Show
              when={hasImageMessage()}
              fallback={
                <div
                  class="px-4 py-2 w-full max-w-[487px] chatbot-host-bubble"
                  data-testid="host-bubble"
                  style={{
                    'border-radius': '16px',
                    'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px`,
                  }}
                >
                  <div ref={setBotMessageRef} class="prose text-gray-300" />
                  <Show when={props.starterPrompts && props.starterPrompts.length > 0}>
                    <div class="mt-3 flex flex-row flex-wrap gap-1.5">
                      <For each={[...props.starterPrompts!]}>
                        {(key) => (
                          <StarterPromptBubble
                            prompt={key}
                            onPromptClick={() => props.onStarterPromptClick?.(key)}
                            starterPromptFontSize={props.starterPromptFontSize}
                          />
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              }
            >
              <div
                class="w-full max-w-[487px]"
                data-testid="host-bubble"
                style={{
                  'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px`,
                }}
              >
                <div ref={setBotMessageRef} class="prose text-gray-300" />
                <Show when={props.starterPrompts && props.starterPrompts.length > 0}>
                  <div class="mt-3 flex flex-row flex-wrap gap-1.5">
                    <For each={[...props.starterPrompts!]}>
                      {(key) => (
                        <StarterPromptBubble
                          prompt={key}
                          onPromptClick={() => props.onStarterPromptClick?.(key)}
                          starterPromptFontSize={props.starterPromptFontSize}
                        />
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </Show>
          )}
          {props.message.action && (
            <div class="px-4 py-2 flex flex-row justify-start space-x-2">
              <For each={props.message.action.elements || []}>
                {(action) => {
                  return (
                    <>
                      {(action.type === 'approve-button' && action.label === 'Yes') || action.type === 'agentflowv2-approve-button' ? (
                        <button
                          type="button"
                          class="px-4 py-2 font-medium text-green-600 border border-green-600 rounded-full hover:bg-green-600 hover:text-white transition-colors duration-300 flex items-center space-x-2"
                          onClick={() => props.handleActionClick(action, props.message.action)}
                        >
                          <TickIcon />
                          &nbsp;
                          {action.label}
                        </button>
                      ) : (action.type === 'reject-button' && action.label === 'No') || action.type === 'agentflowv2-reject-button' ? (
                        <button
                          type="button"
                          class="px-4 py-2 font-medium text-red-600 border border-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors duration-300 flex items-center space-x-2"
                          onClick={() => props.handleActionClick(action, props.message.action)}
                        >
                          <XIcon isCurrentColor={true} />
                          &nbsp;
                          {action.label}
                        </button>
                      ) : (
                        <button type="button">{action.label}</button>
                      )}
                    </>
                  );
                }}
              </For>
            </div>
          )}
        </div>
      </div>
      <div>
        {props.message.sourceDocuments && props.message.sourceDocuments.length && (
          <>
            <Show when={props.sourceDocsTitle}>
              <span class="px-2 py-[10px] font-semibold">{props.sourceDocsTitle}</span>
            </Show>
            <div style={{ display: 'flex', 'flex-direction': 'row', width: '100%', 'flex-wrap': 'wrap' }}>
              <For each={[...removeDuplicateURL(props.message)]}>
                {(src) => {
                  const URL = isValidURL(src.metadata.source);
                  return (
                    <SourceBubble
                      pageContent={URL ? URL.pathname : src.pageContent}
                      metadata={src.metadata}
                      onSourceClick={() => {
                        if (URL) {
                          window.open(src.metadata.source, '_blank');
                        } else {
                          props.handleSourceDocumentsClick(src);
                        }
                      }}
                    />
                  );
                }}
              </For>
            </div>
          </>
        )}
      </div>
      <div>
        <div class={`flex items-center px-2 pb-2 ${props.showAvatar ? '' : ''}`}>
          <Show when={props.isTTSEnabled && (props.message.id || props.message.messageId)}>
            <TTSButton
              isLoading={(() => {
                const messageId = props.message.id || props.message.messageId;
                return !!(messageId && props.isTTSLoading?.[messageId]);
              })()}
              isPlaying={(() => {
                const messageId = props.message.id || props.message.messageId;
                return !!(messageId && props.isTTSPlaying?.[messageId]);
              })()}
              onClick={() => {
                const messageId = props.message.id || props.message.messageId;
                if (!messageId) return; // Don't allow TTS for messages without valid IDs

                const messageText = props.message.message || '';
                if (props.isTTSLoading?.[messageId]) {
                  return; // Prevent multiple clicks while loading
                }
                if (props.isTTSPlaying?.[messageId]) {
                  props.handleTTSStop?.(messageId);
                } else {
                  props.handleTTSClick?.(messageId, messageText);
                }
              }}
            />
          </Show>
          <Show when={props.showFeedback !== false}>
            <CopyToClipboardButton
              filled={copiedMessage()}
              activeVariant={copiedMessage() ? 'copied' : 'default'}
              onClick={() => copyMessageToClipboard()}
            />
            <Show when={copiedMessage()}>
              <div class="copied-message chatbot-feedback-icon">Скопировано!</div>
            </Show>
            {rating() === '' || rating() === 'THUMBS_UP' ? (
              <ThumbsUpButton filled={rating() === 'THUMBS_UP'} isDisabled={rating() === 'THUMBS_UP'} rating={rating()} onClick={onThumbsUpClick} />
            ) : null}
            {rating() === '' || rating() === 'THUMBS_DOWN' ? (
              <ThumbsDownButton
                filled={rating() === 'THUMBS_DOWN'}
                isDisabled={rating() === 'THUMBS_DOWN'}
                rating={rating()}
                onClick={onThumbsDownClick}
              />
            ) : null}
          </Show>
          <Show when={props.message.dateTime && !hasImageMessage()}>
            <div class="text-sm text-gray-500 ml-2">{formattedDateTime()}</div>
          </Show>
        </div>
        <Show when={showFeedbackContentDialog()}>
          <FeedbackContentDialog
            isOpen={showFeedbackContentDialog()}
            onClose={() => setShowFeedbackContentModal(false)}
            onSubmit={submitFeedbackContent}
          />
        </Show>
      </div>
    </div>
  );
};
