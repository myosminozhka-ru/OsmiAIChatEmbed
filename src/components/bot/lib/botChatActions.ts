import { Accessor, Setter } from 'solid-js';
import { v4 as uuidv4 } from 'uuid';
import { fetchEventSource, EventStreamContentType } from '@microsoft/fetch-event-source';
import { cloneDeep } from 'lodash';
import { IncomingInput, sendMessageQuery, upsertVectorStoreWithFormData, createAttachmentWithFormData } from '@/queries/sendMessageQuery';
import { setLocalStorageChatflow, removeLocalStorageChatHistory, getLocalStorageChatflow } from '@/utils';
import { BotProps, IAction, IUploads, LeadsConfig, MessageType, UploadsConfig } from '../types';
import { DEFAULT_WELCOME_MESSAGE } from '../constants';
import { createMessageUpdaters } from './messageUpdaters';
import { createReceiveSoundPlayer } from './receiveSound';
import type { useBotTTS } from '../hooks/useBotTTS';

type TtsHandlers = Pick<ReturnType<typeof useBotTTS>, 'handleTTSStart' | 'handleTTSDataChunk' | 'handleTTSEnd' | 'handleTTSAbort' | 'stopAllTTS'>;

export type BotChatActionsContext = {
  props: BotProps;
  chatId: Accessor<string>;
  setChatId: Setter<string>;
  messages: Accessor<MessageType[]>;
  setMessages: Setter<MessageType[]>;
  setLoading: Setter<boolean>;
  setUserInput: Setter<string>;
  setFollowUpPrompts: Setter<string[]>;
  loading: Accessor<boolean>;
  previews: Accessor<import('../types').FilePreview[]>;
  uploadedFiles: Accessor<{ file: File; type: string }[]>;
  setUploadedFiles: Setter<{ file: File; type: string }[]>;
  clearPreviews: () => void;
  fullFileUpload: Accessor<boolean>;
  uploadsConfig: Accessor<UploadsConfig | undefined>;
  isChatFlowAvailableToStream: Accessor<boolean>;
  startInputType: Accessor<string>;
  leadEmail: Accessor<string>;
  leadsConfig: Accessor<LeadsConfig | undefined>;
  welcomeMessage?: string;
  scrollToBottom: () => void;
  setIsMessageStopping: Setter<boolean>;
  tts: TtsHandlers;
  setOpenFeedbackDialog: Setter<boolean>;
  setFeedback: Setter<string>;
  setPendingActionData: Setter<any>;
  setFeedbackType: Setter<string>;
  openFeedbackDialog: Accessor<boolean>;
  feedback: Accessor<string>;
  pendingActionData: Accessor<any>;
  feedbackType: Accessor<string>;
};

export const createBotChatActions = (ctx: BotChatActionsContext) => {
  const { props, chatId, setChatId, setMessages, setLoading, setUserInput, setFollowUpPrompts, scrollToBottom, tts } = ctx;

  const playReceiveSound = createReceiveSoundPlayer(props);
  const updaters = createMessageUpdaters({
    props,
    chatId,
    setMessages,
    playReceiveSound,
  });

  let streamAbortController: AbortController | null = null;

  const handleError = (message = 'Oops! There seems to be an error. Please try again.', preventOverride?: boolean) => {
    let errMessage = message;
    if (!preventOverride && ctx.props.errorMessage) {
      errMessage = ctx.props.errorMessage;
    }
    ctx.setMessages((prevMessages) => {
      const messages: MessageType[] = [...prevMessages, { message: errMessage, type: 'apiMessage' }];
      updaters.addChatMessage(messages);
      return messages;
    });
    ctx.setLoading(false);
    ctx.setUserInput('');
    ctx.setUploadedFiles([]);
    scrollToBottom();
  };

  const promptClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  const followUpPromptClick = (prompt: string) => {
    ctx.setFollowUpPrompts([]);
    handleSubmit(prompt);
  };

  const applyMetadata = (data: any, input: string) => {
    updaters.updateMetadata(data, input, ctx.setFollowUpPrompts, ctx.setChatId);
  };

  const fetchResponseFromEventStream = async (chatflowid: string, params: any) => {
    const chatId = params.chatId;
    const input = params.question;
    params.streaming = true;
    if (streamAbortController) {
      streamAbortController.abort();
      streamAbortController = null;
    }
    streamAbortController = new AbortController();
    fetchEventSource(`${ctx.props.apiHost}/api/v1/prediction/${chatflowid}`, {
      openWhenHidden: true,
      signal: streamAbortController.signal,
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
      },
      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.startsWith(EventStreamContentType)) {
          return; // everything's good
        } else if (response.status === 429) {
          const errMessage = (await response.text()) ?? 'Too many requests. Please try again later.';
          handleError(errMessage, true);
          throw new Error(errMessage);
        } else if (response.status === 403) {
          const errMessage = (await response.text()) ?? 'Unauthorized';
          handleError(errMessage);
          throw new Error(errMessage);
        } else if (response.status === 401) {
          const errMessage = (await response.text()) ?? 'Unauthenticated';
          handleError(errMessage);
          throw new Error(errMessage);
        } else {
          throw new Error();
        }
      },
      async onmessage(ev) {
        const payload = JSON.parse(ev.data);
        switch (payload.event) {
          case 'start':
            ctx.setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }]);
            break;
          case 'token':
            updaters.updateLastMessage(payload.data);
            break;
          case 'sourceDocuments':
            updaters.updateLastMessageSourceDocuments(payload.data);
            break;
          case 'usedTools':
            updaters.updateLastMessageUsedTools(payload.data);
            break;
          case 'fileAnnotations':
            updaters.updateLastMessageFileAnnotations(payload.data);
            break;
          case 'agentReasoning':
            updaters.updateLastMessageAgentReasoning(payload.data);
            break;
          case 'agentFlowEvent':
            updaters.updateAgentFlowEvent(payload.data);
            break;
          case 'agentFlowExecutedData':
            updaters.updateAgentFlowExecutedData(payload.data);
            break;
          case 'action':
            updaters.updateLastMessageAction(payload.data);
            break;
          case 'artifacts':
            updaters.updateLastMessageArtifacts(payload.data);
            break;
          case 'metadata':
            applyMetadata(payload.data, input);
            break;
          case 'error':
            updaters.updateErrorMessage(payload.data);
            break;
          case 'abort':
            abortMessage();
            break;
          case 'end':
            setLocalStorageChatflow(chatflowid, chatId);
            closeResponse();
            break;
          case 'tts_start':
            tts.handleTTSStart(payload.data);
            break;
          case 'tts_data':
            tts.handleTTSDataChunk(payload.data.audioChunk);
            break;
          case 'tts_end':
            tts.handleTTSEnd();
            break;
          case 'tts_abort':
            tts.handleTTSAbort(payload.data);
            break;
        }
      },
      async onclose() {
        closeResponse();
      },
      onerror(err) {
        console.error('EventSource Error: ', err);
        closeResponse();
        throw err;
      },
    });
  };

  const closeResponse = () => {
    streamAbortController = null;
    ctx.setLoading(false);
    ctx.setUserInput('');
    ctx.setUploadedFiles([]);
    updaters.resetSoundPlayed();
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const abortMessage = () => {
    if (streamAbortController) {
      streamAbortController.abort();
      streamAbortController = null;
    }
    ctx.setIsMessageStopping(false);

    // Stop all TTS when aborting message
    tts.stopAllTTS();

    ctx.setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      const lastAgentReasoning = allMessages[allMessages.length - 1].agentReasoning;
      if (lastAgentReasoning && lastAgentReasoning.length > 0) {
        allMessages[allMessages.length - 1].agentReasoning = lastAgentReasoning.filter((reasoning) => !reasoning.nextAgent);
      }
      return allMessages;
    });
    closeResponse();
  };

  const handleFileUploads = async (uploads: IUploads) => {
    if (!ctx.uploadedFiles().length) return uploads;

    if (ctx.fullFileUpload()) {
      const filesWithFullUploadType = ctx.uploadedFiles().filter((file) => file.type === 'file:full');

      if (filesWithFullUploadType.length > 0) {
        const formData = new FormData();
        for (const file of filesWithFullUploadType) {
          formData.append('files', file.file);
        }
        formData.append('chatId', ctx.chatId());

        const response = await createAttachmentWithFormData({
          chatflowid: ctx.props.chatflowid,
          apiHost: ctx.props.apiHost,
          formData: formData,
        });

        if (!response.data) {
          throw new Error('Unable to upload documents');
        } else {
          const data = response.data as any;
          for (const extractedFileData of data) {
            const content = extractedFileData.content;
            const fileName = extractedFileData.name;

            // find matching name in previews and replace data with content
            const uploadIndex = uploads.findIndex((upload) => upload.name === fileName);
            if (uploadIndex !== -1) {
              uploads[uploadIndex] = {
                ...uploads[uploadIndex],
                data: content,
                name: fileName,
                type: 'file:full',
              };
            }
          }
        }
      }
    } else if (ctx.uploadsConfig()?.isRAGFileUploadAllowed) {
      const filesWithRAGUploadType = ctx.uploadedFiles().filter((file) => file.type === 'file:rag');

      if (filesWithRAGUploadType.length > 0) {
        const formData = new FormData();
        for (const file of filesWithRAGUploadType) {
          formData.append('files', file.file);
        }
        formData.append('chatId', ctx.chatId());

        const response = await upsertVectorStoreWithFormData({
          chatflowid: ctx.props.chatflowid,
          apiHost: ctx.props.apiHost,
          formData: formData,
        });

        if (!response.data) {
          throw new Error('Unable to upload documents');
        } else {
          // delay for vector store to be updated
          const delay = (delayInms: number) => {
            return new Promise((resolve) => setTimeout(resolve, delayInms));
          };
          await delay(2500); //TODO: check if embeddings can be retrieved using file name as metadata filter

          uploads = uploads.map((upload) => {
            return {
              ...upload,
              type: 'file:rag',
            };
          });
        }
      }
    }
    return uploads;
  };

  // Handle form submission
  const handleSubmit = async (value: string | object, action?: IAction | undefined | null, humanInput?: any) => {
    if (typeof value === 'string' && value.trim() === '') {
      const containsFile = ctx.previews().filter((item) => !item.mime.startsWith('image') && item.type !== 'audio').length > 0;
      if (!ctx.previews().length || (ctx.previews().length && containsFile)) {
        return;
      }
    }

    let formData = {};
    if (typeof value === 'object') {
      formData = value;
      value = Object.entries(value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }

    ctx.setLoading(true);
    scrollToBottom();

    let uploads: IUploads = ctx.previews().map((item) => {
      return {
        data: item.data,
        type: item.type,
        name: item.name,
        mime: item.mime,
      };
    });

    try {
      uploads = await handleFileUploads(uploads);
    } catch (error) {
      handleError('Unable to upload documents', true);
      return;
    }

    ctx.clearPreviews();

    ctx.setMessages((prevMessages) => {
      const messages: MessageType[] = [
        ...prevMessages,
        { message: value as string, type: 'userMessage', fileUploads: uploads, dateTime: new Date().toISOString() },
      ];
      updaters.addChatMessage(messages);
      return messages;
    });

    const body: IncomingInput = {
      question: value,
      chatId: ctx.chatId(),
    };

    if (ctx.startInputType() === 'formInput') {
      body.form = formData;
      delete body.question;
    }

    if (uploads && uploads.length > 0) body.uploads = uploads;

    if (ctx.props.chatflowConfig) body.overrideConfig = ctx.props.chatflowConfig;

    if (ctx.leadEmail()) body.leadEmail = ctx.leadEmail();

    if (action) body.action = action;

    if (humanInput) body.humanInput = humanInput;

    if (ctx.isChatFlowAvailableToStream()) {
      fetchResponseFromEventStream(ctx.props.chatflowid, body);
    } else {
      const result = await sendMessageQuery({
        chatflowid: ctx.props.chatflowid,
        apiHost: ctx.props.apiHost,
        body,
        onRequest: ctx.props.onRequest,
      });

      if (result.data) {
        const data = result.data;

        let text = '';
        if (data.text) text = data.text;
        else if (data.json) text = JSON.stringify(data.json, null, 2);
        else text = JSON.stringify(data, null, 2);

        if (data?.chatId) ctx.setChatId(data.chatId);

        playReceiveSound();

        ctx.setMessages((prevMessages) => {
          const allMessages = [...cloneDeep(prevMessages)];
          const newMessage = {
            message: text,
            id: data?.chatMessageId,
            sourceDocuments: data?.sourceDocuments,
            usedTools: data?.usedTools,
            fileAnnotations: data?.fileAnnotations,
            agentReasoning: data?.agentReasoning,
            agentFlowExecutedData: data?.agentFlowExecutedData,
            action: data?.action,
            artifacts: data?.artifacts,
            type: 'apiMessage' as const,
            feedback: null,
            dateTime: new Date().toISOString(),
          };
          allMessages.push(newMessage);
          updaters.addChatMessage(allMessages);
          return allMessages;
        });

        applyMetadata(data, typeof value === 'string' ? value : '');

        ctx.setLoading(false);
        ctx.setUserInput('');
        ctx.setUploadedFiles([]);
        scrollToBottom();
      }
      if (result.error) {
        const error = result.error;
        console.error(error);
        if (typeof error === 'object') {
          handleError(`Error: ${error?.message.replaceAll('Error:', ' ')}`);
          return;
        }
        if (typeof error === 'string') {
          handleError(error);
          return;
        }
        handleError();
        return;
      }
    }

    // Update last question to avoid saving base64 data to localStorage
    if (uploads && uploads.length > 0) {
      ctx.setMessages((data) => {
        const messages = data.map((item, i) => {
          if (i === data.length - 2 && item.type === 'userMessage') {
            if (item.fileUploads) {
              const fileUploads = item?.fileUploads.map((file) => ({
                type: file.type,
                name: file.name,
                mime: file.mime,
              }));
              return { ...item, fileUploads };
            }
          }
          return item;
        });
        updaters.addChatMessage(messages);
        return [...messages];
      });
    }
  };

  const clearChat = () => {
    try {
      removeLocalStorageChatHistory(ctx.props.chatflowid);
      ctx.setChatId(
        (ctx.props.chatflowConfig?.vars as any)?.customerId
          ? `${(ctx.props.chatflowConfig?.vars as any).customerId.toString()}+${uuidv4()}`
          : uuidv4(),
      );
      ctx.setUploadedFiles([]);
      const nextMessages: MessageType[] = [
        {
          message: ctx.props.welcomeMessage ?? DEFAULT_WELCOME_MESSAGE,
          type: 'apiMessage',
        },
      ];
      if (ctx.leadsConfig()?.status && !getLocalStorageChatflow(ctx.props.chatflowid)?.lead) {
        nextMessages.push({ message: '', type: 'leadCaptureMessage' });
      }
      ctx.setMessages(nextMessages);
    } catch (error: any) {
      const errorData = error.response?.data || `${error.response?.status}: ${error.response?.statusText}`;
      console.error(`error: ${errorData}`);
    }
  };

  const onSubmitResponse = (actionData: any, feedback = '', type = '') => {
    let fbType = ctx.feedbackType();
    if (type) {
      fbType = type;
    }
    const question = feedback ? feedback : fbType.charAt(0).toUpperCase() + fbType.slice(1);
    handleSubmit(question, undefined, {
      type: fbType,
      startNodeId: actionData?.nodeId,
      feedback,
    });
  };

  const handleSubmitFeedback = () => {
    if (ctx.pendingActionData()) {
      onSubmitResponse(ctx.pendingActionData(), ctx.feedback());
      ctx.setOpenFeedbackDialog(false);
      ctx.setFeedback('');
      ctx.setPendingActionData(null);
      ctx.setFeedbackType('');
    }
  };

  const handleActionClick = async (elem: any, action: IAction | undefined | null) => {
    ctx.setUserInput(elem.label);
    ctx.setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, action: null };
        }
        return item;
      });
      updaters.addChatMessage(updated);
      return [...updated];
    });
    if (elem.type.includes('agentflowv2')) {
      const type = elem.type.includes('approve') ? 'proceed' : 'reject';
      ctx.setFeedbackType(type);

      if (action && action.data && action.data.input && action.data.input.humanInputEnableFeedback) {
        ctx.setPendingActionData(action.data);
        ctx.setOpenFeedbackDialog(true);
      } else if (action) {
        onSubmitResponse(action.data, '', type);
      }
    } else {
      handleSubmit(elem.label, action);
    }
  };

  return {
    ...updaters,
    playReceiveSound,
    handleError,
    promptClick,
    followUpPromptClick,
    handleSubmit,
    onSubmitResponse,
    handleSubmitFeedback,
    handleActionClick,
    clearChat,
    abortMessage,
    fetchResponseFromEventStream,
  };
};
