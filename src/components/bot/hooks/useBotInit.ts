import { Accessor, Setter, createEffect } from 'solid-js';
import { getCookie, getLocalStorageChatflow } from '@/utils';
import { getChatbotConfig, isStreamAvailableQuery } from '@/queries/sendMessageQuery';
import { BotProps, LeadsConfig, MessageType, UploadsConfig } from '../types';
import { loadMessagesFromHistory } from '../lib/loadStoredMessages';
import { parseStartNodeFormConfig } from '../lib/parseFormInputParams';

export type UseBotInitOptions = {
  props: BotProps;
  setChatId: Setter<string>;
  setMessages: Setter<MessageType[]>;
  setDisclaimerPopupOpen: Setter<boolean>;
  setIsChatFlowAvailableToStream: Setter<boolean>;
  setChatFeedbackStatus: Setter<boolean>;
  setUploadsConfig: Setter<UploadsConfig | undefined>;
  setLeadsConfig: Setter<LeadsConfig | undefined>;
  setFollowUpPromptsStatus: Setter<boolean>;
  setFullFileUpload: Setter<boolean>;
  setFullFileUploadAllowedTypes: Setter<string>;
  setIsTTSEnabled: Setter<boolean>;
  setStartInputType: Setter<string>;
  setFormTitle: Setter<string>;
  setFormDescription: Setter<string>;
  setFormInputParams: Setter<any[]>;
  setUserInput: Setter<string>;
  setUploadedFiles: Setter<{ file: File; type: string }[]>;
  setLoading: Setter<boolean>;
  setIsLeadSaved: Setter<boolean>;
  setLeadEmail: Setter<string>;
};

export const useBotInit = (options: UseBotInitOptions) => {
  const { props } = options;

  createEffect(() => {
    if (props.disclaimer) {
      options.setDisclaimerPopupOpen(getCookie('chatbotDisclaimer') !== 'true');
    } else {
      options.setDisclaimerPopupOpen(false);
    }

    const chatMessage = getLocalStorageChatflow(props.chatflowid);
    if (chatMessage && Object.keys(chatMessage).length) {
      if (chatMessage.chatId) options.setChatId(chatMessage.chatId);
      const savedLead = chatMessage.lead;
      if (savedLead) {
        options.setIsLeadSaved(!!savedLead);
        options.setLeadEmail(savedLead.email);
      }
      const loadedMessages = loadMessagesFromHistory(chatMessage.chatHistory, props.welcomeMessage);
      const filteredMessages = loadedMessages.filter((message) => message.type !== 'leadCaptureMessage');
      options.setMessages([...filteredMessages]);
    }

    void (async () => {
      const { data } = await isStreamAvailableQuery({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        onRequest: props.onRequest,
      });
      if (data) {
        options.setIsChatFlowAvailableToStream(data?.isStreaming ?? false);
      }

      const result = await getChatbotConfig({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        onRequest: props.onRequest,
      });

      if (!result.data) return;

      const chatbotConfig = result.data;

      if (chatbotConfig.flowData) {
        const nodes = JSON.parse(chatbotConfig.flowData).nodes ?? [];
        const startNode = nodes.find((node: any) => node.data.name === 'startAgentflow');
        if (startNode) {
          const formConfig = parseStartNodeFormConfig(startNode);
          options.setStartInputType(formConfig.startInputType);
          if (formConfig.formInputParams.length > 0) {
            options.setFormInputParams(formConfig.formInputParams);
            options.setFormTitle(formConfig.formTitle);
            options.setFormDescription(formConfig.formDescription);
          }
        }
      }

      if (chatbotConfig.chatFeedback) {
        options.setChatFeedbackStatus(chatbotConfig.chatFeedback.status);
      }
      if (chatbotConfig.uploads) {
        options.setUploadsConfig(chatbotConfig.uploads);
      }
      if (chatbotConfig.leads) {
        options.setLeadsConfig(chatbotConfig.leads);
        if (chatbotConfig.leads?.status && !getLocalStorageChatflow(props.chatflowid)?.lead) {
          options.setMessages((prev) => [...prev, { message: '', type: 'leadCaptureMessage' }]);
        }
      }
      if (chatbotConfig.followUpPrompts) {
        options.setFollowUpPromptsStatus(chatbotConfig.followUpPrompts.status);
      }
      if (chatbotConfig.fullFileUpload) {
        options.setFullFileUpload(chatbotConfig.fullFileUpload.status);
        if (chatbotConfig.fullFileUpload?.allowedUploadFileTypes) {
          options.setFullFileUploadAllowedTypes(chatbotConfig.fullFileUpload.allowedUploadFileTypes);
        }
      }
      options.setIsTTSEnabled(!!chatbotConfig.isTTSEnabled);
    })();

    return () => {
      options.setUserInput('');
      options.setUploadedFiles([]);
      options.setLoading(false);
    };
  });
};
