import { createSignal, createEffect, For, onMount, Show, mergeProps, createMemo, on, onCleanup } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import { TextInput } from './inputs/textInput';
import { Badge } from './Badge';
import { Popup, DisclaimerPopup } from '@/features/popup';
import { LogoIcon } from './icons';
import { cancelAudioRecording, startAudioRecording, stopAudioRecording } from '@/utils/audioRecording';
import { setCookie } from '@/utils';
import { FollowUpPromptBubble } from '@/components/bubbles/FollowUpPromptBubble';
import { SuggestionPromptsBar } from '@/components/SuggestionPromptsBar';
import { SparklesIcon } from './icons';

export type {
  FileEvent,
  FormEvent,
  UploadsConfig,
  IAgentReasoning,
  IAction,
  FileUpload,
  AgentFlowExecutedData,
  MessageType,
  observersConfigType,
  ObserversConfigType,
  BotProps,
  LeadsConfig,
} from './bot/types';

import { BotProps, MessageType } from './bot/types';
import { DEFAULT_WELCOME_MESSAGE } from './bot/constants';
import { createTTSActionGuard } from './bot/lib/ttsActionGuard';
import { createBotChatActions } from './bot/lib/botChatActions';
import { FeedbackDialog } from './bot/components/FeedbackDialog';
import { FormInputView } from './bot/components/FormInputView';
import { BotHeader } from './bot/components/BotHeader';
import { BotDragOverlay } from './bot/components/BotDragOverlay';
import { BotMessageList } from './bot/components/BotMessageList';
import { FilePreviewItem } from './bot/components/FilePreviewItem';
import { useBotTTS } from './bot/hooks/useBotTTS';
import { useBotFileUpload } from './bot/hooks/useBotFileUpload';
import { useBotInit } from './bot/hooks/useBotInit';

export const Bot = (botProps: BotProps & { class?: string }) => {
  const props = mergeProps({ showTitle: true }, botProps);
  let chatContainer: HTMLDivElement | undefined;
  let botContainer: HTMLDivElement | undefined;

  const [userInput, setUserInput] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [sourcePopupOpen, setSourcePopupOpen] = createSignal(false);
  const [sourcePopupSrc, setSourcePopupSrc] = createSignal({});
  const [messages, setMessages] = createSignal<MessageType[]>([{ message: props.welcomeMessage ?? DEFAULT_WELCOME_MESSAGE, type: 'apiMessage' }], {
    equals: false,
  });

  const [isChatFlowAvailableToStream, setIsChatFlowAvailableToStream] = createSignal(false);
  const [chatId, setChatId] = createSignal('');
  const [isMessageStopping, setIsMessageStopping] = createSignal(false);
  const [starterPrompts, setStarterPrompts] = createSignal<string[]>([], { equals: false });
  const [chatFeedbackStatus, setChatFeedbackStatus] = createSignal(false);
  const [fullFileUpload, setFullFileUpload] = createSignal(false);
  const [uploadsConfig, setUploadsConfig] = createSignal<import('./bot/types').UploadsConfig>();
  const [leadsConfig, setLeadsConfig] = createSignal<import('./bot/types').LeadsConfig>();
  const [isLeadSaved, setIsLeadSaved] = createSignal(false);
  const [leadEmail, setLeadEmail] = createSignal('');
  const [disclaimerPopupOpen, setDisclaimerPopupOpen] = createSignal(false);
  const [isFullScreen, setIsFullScreen] = createSignal(false);

  const [openFeedbackDialog, setOpenFeedbackDialog] = createSignal(false);
  const [feedback, setFeedback] = createSignal('');
  const [pendingActionData, setPendingActionData] = createSignal<any>(null);
  const [feedbackType, setFeedbackType] = createSignal('');

  const [startInputType, setStartInputType] = createSignal('');
  const [formTitle, setFormTitle] = createSignal('');
  const [formDescription, setFormDescription] = createSignal('');
  const [formInputParams, setFormInputParams] = createSignal([]);

  const [followUpPromptsStatus, setFollowUpPromptsStatus] = createSignal(false);
  const [followUpPrompts, setFollowUpPrompts] = createSignal<string[]>([]);
  const [fullFileUploadAllowedTypes, setFullFileUploadAllowedTypes] = createSignal('*');

  const [elapsedTime, setElapsedTime] = createSignal('00:00');
  const [isRecording, setIsRecording] = createSignal(false);
  const [pendingAudioSend, setPendingAudioSend] = createSignal(false);

  const ttsGuard = createTTSActionGuard();

  const fileUpload = useBotFileUpload({ uploadsConfig, fullFileUpload });

  const tts = useBotTTS({
    props,
    chatId,
    setMessages,
    setTTSAction: ttsGuard.setTTSAction,
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      chatContainer?.scrollTo(0, chatContainer.scrollHeight);
    }, 50);
  };

  const chat = createBotChatActions({
    props,
    chatId,
    setChatId,
    messages,
    setMessages,
    setLoading,
    setUserInput,
    setFollowUpPrompts,
    loading,
    previews: fileUpload.previews,
    uploadedFiles: fileUpload.uploadedFiles,
    setUploadedFiles: fileUpload.setUploadedFiles,
    clearPreviews: fileUpload.clearPreviews,
    fullFileUpload,
    uploadsConfig,
    isChatFlowAvailableToStream,
    startInputType,
    leadEmail,
    leadsConfig,
    scrollToBottom,
    setIsMessageStopping,
    tts,
    setOpenFeedbackDialog,
    setFeedback,
    setPendingActionData,
    setFeedbackType,
    openFeedbackDialog,
    feedback,
    pendingActionData,
    feedbackType,
  });

  createMemo(() => {
    const customerId = (props.chatflowConfig?.vars as any)?.customerId;
    setChatId(customerId ? `${customerId.toString()}+${uuidv4()}` : uuidv4());
  });

  onMount(() => {
    if (props.observersConfig) {
      const { observeUserInput, observeLoading, observeMessages } = props.observersConfig;
      if (typeof observeUserInput === 'function') {
        createMemo(() => observeUserInput(userInput()));
      }
      if (typeof observeLoading === 'function') {
        createMemo(() => observeLoading(loading()));
      }
      if (typeof observeMessages === 'function') {
        createMemo(() => observeMessages(messages()));
      }
    }
    setTimeout(() => chatContainer?.scrollTo(0, chatContainer.scrollHeight), 50);
  });

  const handleDisclaimerAccept = () => {
    setDisclaimerPopupOpen(false);
    setCookie('chatbotDisclaimer', 'true', 365);
  };

  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  createEffect(() => props.onFullScreenChange?.(isFullScreen()));

  createEffect(() => {
    if (!props.starterPrompts) return;
    const prompts = Array.isArray(props.starterPrompts)
      ? props.starterPrompts
      : Object.values(props.starterPrompts).map((p: { prompt: string }) => p.prompt);
    setStarterPrompts(prompts.filter((prompt) => prompt !== ''));
  });

  createEffect(() => {
    if (messages().length > 1 && !ttsGuard.isTTSActionActive()) {
      setTimeout(() => chatContainer?.scrollTo(0, chatContainer.scrollHeight), 400);
    }
  });

  createEffect(() => {
    if (props.fontSize && botContainer) botContainer.style.fontSize = `${props.fontSize}px`;
  });

  useBotInit({
    props,
    setChatId,
    setMessages,
    setDisclaimerPopupOpen,
    setIsChatFlowAvailableToStream,
    setChatFeedbackStatus,
    setUploadsConfig,
    setLeadsConfig,
    setFollowUpPromptsStatus,
    setFullFileUpload,
    setFullFileUploadAllowedTypes,
    setIsTTSEnabled: tts.setIsTTSEnabled,
    setStartInputType,
    setFormTitle,
    setFormDescription,
    setFormInputParams,
    setUserInput,
    setUploadedFiles: fileUpload.setUploadedFiles,
    setLoading,
    setIsLeadSaved,
    setLeadEmail,
  });

  onCleanup(() => ttsGuard.cleanup());

  createEffect(() => {
    if (!followUpPromptsStatus() || messages().length === 0) return;
    const lastMessage = messages()[messages().length - 1];
    if (lastMessage.type === 'apiMessage' && lastMessage.followUpPrompts) {
      setFollowUpPrompts(JSON.parse(lastMessage.followUpPrompts));
    } else if (lastMessage.type === 'userMessage') {
      setFollowUpPrompts([]);
    }
  });

  const onMicrophoneClicked = () => {
    startAudioRecording(
      () => setIsRecording(true),
      () => {
        setMessages((prev) => [...prev, { message: 'Не удалось найти микрофон', type: 'apiMessage' }]);
        scrollToBottom();
      },
      setElapsedTime,
    );
  };

  const onRecordingCancelled = () => {
    cancelAudioRecording();
    setIsRecording(false);
    setElapsedTime('00:00');
  };

  const onRecordingSend = () => {
    stopAudioRecording((blob) => {
      setPendingAudioSend(true);
      fileUpload.addRecordingToPreviews(blob);
    });
  };

  const getInputDisabled = (): boolean => {
    const messagesArray = messages();
    return (
      loading() ||
      !props.chatflowid ||
      (leadsConfig()?.status && !isLeadSaved()) ||
      !!(messagesArray[messagesArray.length - 1].action && Object.keys(messagesArray[messagesArray.length - 1].action as object).length > 0)
    );
  };

  createEffect(
    on(fileUpload.previews, (uploads) => {
      if (pendingAudioSend() && uploads.some((item) => item.type === 'audio')) {
        setPendingAudioSend(false);
        setIsRecording(false);
        setElapsedTime('00:00');
        chat.handleSubmit('');
      }
    }),
  );

  return (
    <>
      {startInputType() === 'formInput' && messages().length === 1 ? (
        <FormInputView
          title={formTitle()}
          description={formDescription()}
          inputParams={formInputParams()}
          onSubmit={(formData) => chat.handleSubmit(formData)}
          fontSize={props.fontSize}
        />
      ) : (
        <div
          ref={botContainer}
          class={'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center chatbot-container ' + props.class}
          onDragEnter={fileUpload.handleDrag}
        >
          <BotDragOverlay
            isDragActive={fileUpload.isDragActive()}
            uploadsConfig={uploadsConfig()}
            isFileUploadAllowed={fileUpload.isFileUploadAllowed()}
            onDragEnter={fileUpload.handleDrag}
            onDragLeave={fileUpload.handleDrag}
            onDragEnd={fileUpload.handleDrag}
            onDragOver={fileUpload.handleDrag}
            onDrop={fileUpload.handleDrop}
          />

          <BotHeader props={props} isFullScreen={isFullScreen()} onToggleFullScreen={toggleFullScreen} onClearChat={chat.clearChat} />

          <div class="flex flex-col w-full h-full justify-start z-0">
            <div
              ref={chatContainer}
              class="overflow-y-scroll flex flex-col flex-grow mx-auto w-full px-5 pt-[80px] relative scrollable-container chatbot-chat-view scroll-smooth"
            >
              <div class="flex flex-row items-center justify-center pt-[69px] pb-[65px] sm:pt-[89px] sm:pb-[95px]">
                <LogoIcon class="w-auto flex shrink-0" />
              </div>
              <BotMessageList
                props={props}
                messages={messages()}
                chatId={chatId()}
                loading={loading()}
                chatFeedbackStatus={chatFeedbackStatus()}
                leadsConfig={leadsConfig()}
                isLeadSaved={isLeadSaved()}
                setIsLeadSaved={setIsLeadSaved}
                setLeadEmail={setLeadEmail}
                starterPrompts={fileUpload.previews().length > 0 ? [] : starterPrompts()}
                isTTSEnabled={tts.isTTSEnabled()}
                isTTSLoading={tts.isTTSLoading()}
                isTTSPlaying={tts.isTTSPlaying()}
                handleTTSClick={tts.handleTTSClick}
                handleTTSStop={tts.handleTTSStop}
                handleActionClick={chat.handleActionClick}
                onStarterPromptClick={chat.promptClick}
                onSourceDocumentsClick={(docs) => {
                  setSourcePopupSrc(docs);
                  setSourcePopupOpen(true);
                }}
              />
            </div>

            <Show when={messages().length > 2 && followUpPromptsStatus() && fileUpload.previews().length === 0}>
              <Show when={followUpPrompts().length > 0}>
                <div class="mx-auto max-w-[796px] w-full flex items-center gap-1 px-5">
                  <SparklesIcon class="w-4 h-4" />
                  <span class="text-sm text-gray-700">Try these prompts</span>
                </div>
                <div class="mx-auto max-w-[796px] w-full flex flex-row flex-wrap px-5 py-[10px] gap-2">
                  <For each={[...followUpPrompts()]}>
                    {(prompt) => (
                      <FollowUpPromptBubble
                        prompt={prompt}
                        onPromptClick={() => chat.followUpPromptClick(prompt)}
                        starterPromptFontSize={props.starterPromptFontSize}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </Show>

            <Show when={fileUpload.previews().length > 0}>
              <div class="w-full flex items-center justify-start gap-2 px-5 chatbot-border-t chatbot-scroller">
                <For each={[...fileUpload.previews()]}>
                  {(item) => (
                    <FilePreviewItem
                      item={item}
                      chatContainerWidth={chatContainer?.offsetWidth}
                      isFullPage={props.isFullPage}
                      inputDisabled={getInputDisabled()}
                      onDelete={fileUpload.handleDeletePreview}
                    />
                  )}
                </For>
              </div>
            </Show>

            <div class="mx-auto max-w-[796px] w-full px-5 pt-2 pb-1 flex flex-col gap-4 items-center">
              <Show when={messages().length > 1 && starterPrompts().length > 0 && fileUpload.previews().length === 0}>
                <SuggestionPromptsBar suggestions={starterPrompts()} onSelect={(text) => chat.handleSubmit(text)} class="pb-1" />
              </Show>
              <Show when={isRecording()}>
                <button
                  class="chatbot-recording-bar h-[44px] w-fit flex items-center gap-3 rounded-full px-5"
                  data-testid="voice-input"
                  type="button"
                  onClick={onRecordingCancelled}
                >
                  <span class="chatbot-recording-indicator w-3 h-3 rounded-[2px]" />
                  <span class="text-sm font-medium tabular-nums">{elapsedTime()}</span>
                  <span class="text-sm font-medium">Остановить</span>
                </button>
              </Show>
              <TextInput
                placeholder={props.textInput?.placeholder}
                maxChars={props.textInput?.maxChars}
                maxCharsWarningMessage={props.textInput?.maxCharsWarningMessage}
                autoFocus={props.textInput?.autoFocus}
                fontSize={props.fontSize}
                disabled={getInputDisabled() || isRecording()}
                inputValue={userInput()}
                onInputChange={setUserInput}
                onSubmit={chat.handleSubmit}
                uploadsConfig={uploadsConfig()}
                isFullFileUpload={fullFileUpload()}
                fullFileUploadAllowedTypes={fullFileUploadAllowedTypes()}
                setPreviews={fileUpload.setPreviews}
                onMicrophoneClicked={onMicrophoneClicked}
                handleFileChange={fileUpload.handleFileChange}
                sendMessageSound={props.textInput?.sendMessageSound}
                sendSoundLocation={props.textInput?.sendSoundLocation}
                enableInputHistory={true}
                maxHistorySize={10}
                isLoading={loading()}
                onAbortMessage={chat.abortMessage}
                isRecording={isRecording()}
                onRecordingSend={onRecordingSend}
              />
            </div>
            <Badge footer={props.footer} botContainer={botContainer} />
          </div>
        </div>
      )}

      {sourcePopupOpen() && <Popup isOpen={sourcePopupOpen()} value={sourcePopupSrc()} onClose={() => setSourcePopupOpen(false)} />}

      {disclaimerPopupOpen() && (
        <DisclaimerPopup
          isOpen={disclaimerPopupOpen()}
          onAccept={handleDisclaimerAccept}
          title={props.disclaimer?.title}
          message={props.disclaimer?.message}
          buttonText={props.disclaimer?.buttonText}
          denyButtonText={props.disclaimer?.denyButtonText}
          onDeny={props.closeBot}
          isFullPage={props.isFullPage}
        />
      )}

      {openFeedbackDialog() && (
        <FeedbackDialog
          isOpen={openFeedbackDialog()}
          onClose={() => {
            setOpenFeedbackDialog(false);
            chat.handleSubmitFeedback();
          }}
          onSubmit={chat.handleSubmitFeedback}
          feedbackValue={feedback()}
          setFeedbackValue={setFeedback}
        />
      )}
    </>
  );
};
