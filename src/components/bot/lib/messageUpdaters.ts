import { Accessor, Setter } from 'solid-js';
import { cloneDeep } from 'lodash';
import { BotProps, FileUpload, IAction, IAgentReasoning, MessageType } from '../types';
import { persistChatMessages } from './chatStorage';

export type MessageUpdatersOptions = {
  props: BotProps;
  chatId: Accessor<string>;
  setMessages: Setter<MessageType[]>;
  playReceiveSound: () => void;
};

export const createMessageUpdaters = (options: MessageUpdatersOptions) => {
  const { props, chatId, setMessages, playReceiveSound } = options;
  let hasSoundPlayed = false;

  const addChatMessage = (allMessage: MessageType[]) => {
    persistChatMessages(props.chatflowid, chatId(), allMessage);
  };

  const resetSoundPlayed = () => {
    hasSoundPlayed = false;
  };

  const updateLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      if (!text) return allMessages;
      allMessages[allMessages.length - 1].message += text;
      allMessages[allMessages.length - 1].rating = undefined;
      allMessages[allMessages.length - 1].dateTime = new Date().toISOString();
      if (!hasSoundPlayed) {
        playReceiveSound();
        hasSoundPlayed = true;
      }
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateErrorMessage = (errorMessage: string) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      allMessages.push({ message: props.errorMessage || errorMessage, type: 'apiMessage' });
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageSourceDocuments = (sourceDocuments: any) => {
    setMessages((data) => {
      const updated = data.map((item, i) => (i === data.length - 1 ? { ...item, sourceDocuments } : item));
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateLastMessageUsedTools = (usedTools: any[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].usedTools = usedTools;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageFileAnnotations = (fileAnnotations: any) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].fileAnnotations = fileAnnotations;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageAgentReasoning = (agentReasoning: string | IAgentReasoning[]) => {
    setMessages((data) => {
      const updated = data.map((item, i) =>
        i === data.length - 1
          ? { ...item, agentReasoning: typeof agentReasoning === 'string' ? JSON.parse(agentReasoning) : agentReasoning }
          : item,
      );
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateAgentFlowEvent = (event: string) => {
    if (event === 'INPROGRESS') {
      setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage', agentFlowEventStatus: event }]);
    } else {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
        allMessages[allMessages.length - 1].agentFlowEventStatus = event;
        return allMessages;
      });
    }
  };

  const updateAgentFlowExecutedData = (agentFlowExecutedData: any) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].agentFlowExecutedData = agentFlowExecutedData;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageArtifacts = (artifacts: FileUpload[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
      allMessages[allMessages.length - 1].artifacts = artifacts;
      addChatMessage(allMessages);
      return allMessages;
    });
  };

  const updateLastMessageAction = (action: IAction) => {
    setMessages((data) => {
      const updated = data.map((item, i) =>
        i === data.length - 1 ? { ...item, action: typeof action === 'string' ? JSON.parse(action) : action } : item,
      );
      addChatMessage(updated);
      return [...updated];
    });
  };

  const updateMetadata = (data: any, input: string, setFollowUpPrompts: (prompts: string[]) => void, setChatId: (id: string) => void) => {
    if (data.chatId) {
      setChatId(data.chatId);
    }

    if (data.chatMessageId) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'apiMessage') {
          allMessages[allMessages.length - 1].messageId = data.chatMessageId;
        }
        addChatMessage(allMessages);
        return allMessages;
      });
    }

    if (input === '' && data.question) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 2].type === 'apiMessage') return allMessages;
        allMessages[allMessages.length - 2].message = data.question;
        addChatMessage(allMessages);
        return allMessages;
      });
    }

    if (data.followUpPrompts) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];
        if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages;
        allMessages[allMessages.length - 1].followUpPrompts = data.followUpPrompts;
        addChatMessage(allMessages);
        return allMessages;
      });
      setFollowUpPrompts(JSON.parse(data.followUpPrompts));
    }
  };

  const stripUploadDataFromLastUserMessage = () => {
    setMessages((data) => {
      const messages = data.map((item, i) => {
        if (i === data.length - 2 && item.type === 'userMessage' && item.fileUploads) {
          const fileUploads = item.fileUploads.map((file) => ({
            type: file.type,
            name: file.name,
            mime: file.mime,
          }));
          return { ...item, fileUploads };
        }
        return item;
      });
      addChatMessage(messages);
      return [...messages];
    });
  };

  return {
    addChatMessage,
    resetSoundPlayed,
    updateLastMessage,
    updateErrorMessage,
    updateLastMessageSourceDocuments,
    updateLastMessageUsedTools,
    updateLastMessageFileAnnotations,
    updateLastMessageAgentReasoning,
    updateAgentFlowEvent,
    updateAgentFlowExecutedData,
    updateLastMessageArtifacts,
    updateLastMessageAction,
    updateMetadata,
    stripUploadDataFromLastUserMessage,
  };
};
