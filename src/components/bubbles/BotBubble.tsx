import { createEffect, Show, createSignal, onMount, For } from 'solid-js';
import { Avatar } from '../avatars/Avatar';
import { Marked } from '@ts-stack/markdown';
import { FeedbackRatingType, sendFeedbackQuery, sendFileDownloadQuery, updateFeedbackQuery } from '@/queries/sendMessageQuery';
import { FileUpload, IAction, MessageType } from '../Bot';
import { CopyToClipboardButton, ThumbsDownButton, ThumbsUpButton } from '../buttons/FeedbackButtons';
import { TTSButton } from '../buttons/TTSButton';
import FeedbackContentDialog from '../FeedbackContentDialog';
import { SuccessAlert } from './SuccessAlert';
import { AgentReasoningBubble } from './AgentReasoningBubble';
import { TickIcon, XIcon } from '../icons';
import { SourceBubble } from '../bubbles/SourceBubble';
import { DateTimeToggleTheme } from '@/features/bubble/types';
import { WorkflowTreeView } from '../treeview/WorkflowTreeView';
import { TypingBubble } from '../TypingBubble';

type Props = {
  message: MessageType;
  chatflowid: string;
  chatId: string;
  apiHost?: string;
  onRequest?: (request: RequestInit) => Promise<void>;
  fileAnnotations?: any;
  showAvatar?: boolean;
  avatarSrc?: string;
  botTitle?: string;
  backgroundColor?: string;
  textColor?: string;
  chatFeedbackStatus?: boolean;
  fontSize?: number;
  feedbackColor?: string;
  isLoading: boolean;
  dateTimeToggle?: DateTimeToggleTheme;
  showAgentMessages?: boolean;
  sourceDocsTitle?: string;
  renderHTML?: boolean;
  handleActionClick: (elem: any, action: IAction | undefined | null) => void;
  handleSourceDocumentsClick: (src: any) => void;
  isFullPage?: boolean;
  isFullscreen?: boolean;
  isPopup?: boolean;
  enableCopyMessage?: boolean;
  // TTS props
  isTTSEnabled?: boolean;
  isTTSLoading?: Record<string, boolean>;
  isTTSPlaying?: Record<string, boolean>;
  handleTTSClick?: (messageId: string, messageText: string) => void;
  handleTTSStop?: (messageId: string) => void;
  feedbackReasons?: string[];
  userData?: {
    fio?: string;
    email?: string;
    user_name?: string;
    user_id?: string;
    shortname?: string;
    orn?: string;
  };
};

const defaultFontSize = 16;
const defaultFeedbackColor = 'rgba(11, 17, 19, 0.5)';

export const BotBubble = (props: Props) => {
  let botDetailsEl: HTMLDetailsElement | undefined;

  Marked.setOptions({ isNoP: true, sanitize: props.renderHTML !== undefined ? !props.renderHTML : true });

  const [rating, setRating] = createSignal('');
  const [feedbackId, setFeedbackId] = createSignal('');
  const [showFeedbackContentDialog, setShowFeedbackContentModal] = createSignal(false);
  const [showSuccessAlert, setShowSuccessAlert] = createSignal(false);
  const [feedbackError, setFeedbackError] = createSignal('');
  const [copiedMessage, setCopiedMessage] = createSignal(false);
  const [thumbsUpColor, setThumbsUpColor] = createSignal(props.feedbackColor ?? defaultFeedbackColor);
  const [thumbsDownColor, setThumbsDownColor] = createSignal(props.feedbackColor ?? defaultFeedbackColor);

  // Store a reference to the bot message element for the copyMessageToClipboard function
  const [botMessageElement, setBotMessageElement] = createSignal<HTMLElement | null>(null);

  const setBotMessageRef = (el: HTMLSpanElement) => {
    if (el) {
      el.innerHTML = Marked.parse(props.message.message);

      el.querySelectorAll('a, h1, h2, h3, h4, h5, h6, strong, em, blockquote, li').forEach((element) => {
        (element as HTMLElement).style.color = 'inherit';
      });

      el.querySelectorAll('pre').forEach((element) => {
        (element as HTMLElement).style.color = 'var(--chatbot-host-bubble-color)';
        element.querySelectorAll('code').forEach((codeElement) => {
          (codeElement as HTMLElement).style.color = 'var(--chatbot-host-bubble-color)';
        });
      });
      el.querySelectorAll('code:not(pre code)').forEach((element) => {
        (element as HTMLElement).style.color = 'inherit';
      });

      // Set target="_blank" for links
      el.querySelectorAll('a').forEach((link) => {
        link.target = '_blank';
      });

      // Store the element ref for the copy function
      setBotMessageElement(el);

      if (props.message.rating) {
        setRating(props.message.rating);
        if (props.message.rating === 'THUMBS_UP') {
          setThumbsUpColor('#006400');
        } else if (props.message.rating === 'THUMBS_DOWN') {
          setThumbsDownColor('#8B0000');
        }
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
          svgContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-download" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>`;

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
      const messageId = props.message?.messageId || props.message?.id || '';
      const body = {
        chatflowid: props.chatflowid,
        chatId: props.chatId,
        messageId: String(messageId),
        rating: 'THUMBS_UP' as FeedbackRatingType,
        content: '',
        ...(props.userData?.fio && { fio: props.userData.fio }),
        ...(props.userData?.email && { email: props.userData.email }),
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
        setThumbsUpColor('#006400');
        saveToLocalStorage('THUMBS_UP');
      }
    }
  };

  const onThumbsDownClick = async () => {
    if (rating() === '') {
      const messageId = props.message?.messageId || props.message?.id || '';
      const body = {
        chatflowid: props.chatflowid,
        chatId: props.chatId,
        messageId: String(messageId),
        rating: 'THUMBS_DOWN' as FeedbackRatingType,
        content: '',
        ...(props.userData?.fio && { fio: props.userData.fio }),
        ...(props.userData?.email && { email: props.userData.email }),
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
        setThumbsDownColor('#8B0000');
        saveToLocalStorage('THUMBS_DOWN');
      } else if (result.error) {
        setFeedbackError('Произошла ошибка, попробуйте еще раз');
        setShowFeedbackContentModal(true);
      }
    }
  };

  const submitFeedbackContent = async (text: string, _reason?: string) => {
    setFeedbackError('');
    if (!feedbackId()) return;

    const body = {
      content: text,
      ...(props.userData?.fio && { fio: props.userData.fio }),
      ...(props.userData?.email && { email: props.userData.email }),
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
      setShowSuccessAlert(true);
    } else if (result.error) {
      setFeedbackError('Произошла ошибка, попробуйте еще раз');
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

  const renderArtifacts = (item: Partial<FileUpload>) => {
    // Instead of onMount, we'll use a callback ref to apply styles
    const setArtifactRef = (el: HTMLSpanElement) => {
      if (el) {
        el.querySelectorAll('a, h1, h2, h3, h4, h5, h6, strong, em, blockquote, li').forEach((element) => {
          (element as HTMLElement).style.color = 'inherit';
        });
        el.querySelectorAll('pre').forEach((element) => {
          (element as HTMLElement).style.color = 'var(--chatbot-host-bubble-color)';
          element.querySelectorAll('code').forEach((codeElement) => {
            (codeElement as HTMLElement).style.color = 'var(--chatbot-host-bubble-color)';
          });
        });
        el.querySelectorAll('code:not(pre code)').forEach((element) => {
          (element as HTMLElement).style.color = 'inherit';
        });

        el.querySelectorAll('a').forEach((link) => {
          link.target = '_blank';
        });
      }
    };

    return (
      <>
        <Show when={item.type === 'png' || item.type === 'jpeg'}>
          <div class="flex items-center justify-center p-0 m-0">
            <img
              class="w-full h-full bg-cover"
              src={(() => {
                const isFileStorage = typeof item.data === 'string' && item.data.startsWith('FILE-STORAGE::');
                return isFileStorage
                  ? `${props.apiHost}/api/v1/get-upload-file?chatflowId=${props.chatflowid}&chatId=${props.chatId}&fileName=${(
                      item.data as string
                    ).replace('FILE-STORAGE::', '')}`
                  : (item.data as string);
              })()}
            />
          </div>
        </Show>
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
              'border-radius': 'var(--chatbot-border-radius)',
              'font-size': props.fontSize ? `${props.fontSize}px` : 'var(--chatbot-font-size)',
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
        return '';
      }

      // В баблах показываем только время, дата остается в разделителе (как в old)
      const shouldShowTime = showTime !== false;
      let formatted = '';

      if (shouldShowTime) {
        const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        formatted = timeFormatter.format(date);
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getContainerClasses = () => {
    const isFullMode = props.isFullPage || props.isFullscreen;
    const isPopupMode = props.isPopup && !props.isFullscreen;
    const baseClasses = 'flex flex-row justify-start mb-5 items-start host-container';

    if (isPopupMode) {
      return `${baseClasses} w-full pr-[40px]`;
    }

    if (isFullMode) {
      return `${baseClasses} w-full pr-[40px] sm:w-[70%] sm:pr-0 lg:w-3/5 xl:w-1/2`;
    }

    return `${baseClasses} w-2/3`;
  };

  return (
    <div>
      <div class={getContainerClasses()}>
        <div
          class={`flex flex-col justify-start px-4 py-3 rounded-lg rounded-bl-none chatbot-host-bubble min-h-[52px] shadow-sm bg-[var(--chatbot-host-bubble-bg-color)] text-[var(--chatbot-host-bubble-text-color)] ${
            props.isLoading && !props.message.message ? 'w-[72px]' : 'w-full'
          }`}
          style={{
            'font-size': props.fontSize ? `${props.fontSize}px` : 'var(--chatbot-font-size)',
          }}
        >
          <Show when={props.message.message}>
            <div class="flex flex-row items-center justify-between w-full mb-2">
              <div class="flex flex-row items-center gap-2">
                <Show when={props.showAvatar !== false}>
                  <Avatar initialAvatarSrc={props.avatarSrc} />
                </Show>
                <span class="font-semibold text-gray-880">{props.botTitle ?? 'Умный помощник'}</span>
              </div>
              <div class="flex items-center gap-2">
                <Show when={props.enableCopyMessage}>
                  <CopyToClipboardButton feedbackColor={props.feedbackColor ?? defaultFeedbackColor} onClick={() => copyMessageToClipboard()} />
                  <Show when={copiedMessage()}>
                    <div class="copied-message text-xs text-gray-500">Скопировано</div>
                  </Show>
                </Show>
                <Show when={props.chatFeedbackStatus !== false && !props.message.disableFeedback}>
                  {rating() === '' || rating() === 'THUMBS_UP' ? (
                    <ThumbsUpButton
                      feedbackColor={thumbsUpColor()}
                      isDisabled={rating() === 'THUMBS_UP'}
                      rating={rating()}
                      onClick={onThumbsUpClick}
                    />
                  ) : null}
                  {rating() === '' || rating() === 'THUMBS_DOWN' ? (
                    <ThumbsDownButton
                      feedbackColor={thumbsDownColor()}
                      isDisabled={rating() === 'THUMBS_DOWN'}
                      rating={rating()}
                      onClick={onThumbsDownClick}
                    />
                  ) : null}
                </Show>
              </div>
            </div>
          </Show>
          {props.showAgentMessages &&
            props.message.agentFlowExecutedData &&
            Array.isArray(props.message.agentFlowExecutedData) &&
            props.message.agentFlowExecutedData.length > 0 && (
              <div>
                <WorkflowTreeView workflowData={props.message.agentFlowExecutedData} indentationLevel={24} />
              </div>
            )}
          {props.showAgentMessages && props.message.agentReasoning && (
            <details ref={botDetailsEl} class="mb-2 px-4 py-2 ml-2 chatbot-host-bubble rounded-[6px]">
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
          {props.message.artifacts && props.message.artifacts.length > 0 && (
            <div class="flex flex-row items-start flex-wrap w-full gap-2">
              <For each={props.message.artifacts}>
                {(item) => {
                  return item !== null ? <>{renderArtifacts(item)}</> : null;
                }}
              </For>
            </div>
          )}
          {props.message.message ? (
            <span ref={setBotMessageRef} class="mt-3 max-w-full prose overflow-hidden" data-testid="host-bubble" />
          ) : props.isLoading ? (
            <div class="mt-3">
              <TypingBubble />
            </div>
          ) : null}
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
          {props.message.dateTime && !(props.isLoading && !props.message.message) && (
            <div class="text-xs text-gray-500 opacity-70 mt-2 w-full text-right">
              {formatDateTime(props.message.dateTime, props?.dateTimeToggle?.date, props?.dateTimeToggle?.time)}
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
        <div class={`flex items-center gap-2 px-2 pb-2 ${props.showAvatar !== false ? 'ml-10' : ''}`}>
          <Show when={props.isTTSEnabled && (props.message.id || props.message.messageId)}>
            <TTSButton
              feedbackColor={props.feedbackColor ?? defaultFeedbackColor}
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
                if (!messageId) return;
                const messageText = props.message.message || '';
                if (props.isTTSLoading?.[messageId]) return;
                if (props.isTTSPlaying?.[messageId]) {
                  props.handleTTSStop?.(messageId);
                } else {
                  props.handleTTSClick?.(messageId, messageText);
                }
              }}
            />
          </Show>
        </div>
        <FeedbackContentDialog
          isOpen={showFeedbackContentDialog()}
          onClose={() => {
            setShowFeedbackContentModal(false);
            setFeedbackError('');
          }}
          onSubmit={submitFeedbackContent}
          reasons={props.feedbackReasons}
          errorMessage={feedbackError()}
          onErrorClear={() => setFeedbackError('')}
          isFullPage={props.isFullPage}
          userData={props.userData}
        />
        <SuccessAlert isOpen={showSuccessAlert()} onClose={() => setShowSuccessAlert(false)} message="Ваше сообщение отправлено." />
      </div>
    </div>
  );
};
