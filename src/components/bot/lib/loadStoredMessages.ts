import { MessageType } from '../types';
import { DEFAULT_WELCOME_MESSAGE } from '../constants';

export const mapStoredMessage = (message: MessageType, welcomeMessage?: string): MessageType => {
  const chatHistory: MessageType = {
    messageId: message?.messageId,
    message: message.message,
    type: message.type,
    rating: message.rating,
    dateTime: message.dateTime,
  };
  if (message.sourceDocuments) chatHistory.sourceDocuments = message.sourceDocuments;
  if (message.fileAnnotations) chatHistory.fileAnnotations = message.fileAnnotations;
  if (message.fileUploads) chatHistory.fileUploads = message.fileUploads;
  if (message.agentReasoning) chatHistory.agentReasoning = message.agentReasoning;
  if (message.action) chatHistory.action = message.action;
  if (message.artifacts) chatHistory.artifacts = message.artifacts;
  if (message.followUpPrompts) chatHistory.followUpPrompts = message.followUpPrompts;
  if (message.execution?.executionData) {
    chatHistory.agentFlowExecutedData =
      typeof message.execution.executionData === 'string' ? JSON.parse(message.execution.executionData) : message.execution.executionData;
  }
  if (message.agentFlowExecutedData) {
    chatHistory.agentFlowExecutedData =
      typeof message.agentFlowExecutedData === 'string' ? JSON.parse(message.agentFlowExecutedData) : message.agentFlowExecutedData;
  }
  return chatHistory;
};

export const buildInitialMessages = (welcomeMessage?: string): MessageType[] => [
  {
    message: welcomeMessage ?? DEFAULT_WELCOME_MESSAGE,
    type: 'apiMessage',
  },
];

export const loadMessagesFromHistory = (chatHistory: MessageType[] | undefined, welcomeMessage?: string): MessageType[] => {
  if (!chatHistory?.length) {
    return buildInitialMessages(welcomeMessage);
  }
  return chatHistory.map((message) => mapStoredMessage(message, welcomeMessage));
};
