import { setLocalStorageChatflow } from '@/utils';
import { MessageType } from '../types';

export const serializeMessagesForStorage = (messages: MessageType[]): MessageType[] =>
  messages.map((item) => {
    if (item.fileUploads) {
      const fileUploads = item.fileUploads.map((file) => ({
        type: file.type,
        name: file.name,
        mime: file.mime,
      }));
      return { ...item, fileUploads };
    }
    return item;
  });

export const persistChatMessages = (chatflowid: string, chatId: string, messages: MessageType[]) => {
  setLocalStorageChatflow(chatflowid, chatId, { chatHistory: serializeMessagesForStorage(messages) });
};
