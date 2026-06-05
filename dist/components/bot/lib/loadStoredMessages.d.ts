import { MessageType } from '../types';
export declare const mapStoredMessage: (message: MessageType, welcomeMessage?: string) => MessageType;
export declare const buildInitialMessages: (welcomeMessage?: string) => MessageType[];
export declare const loadMessagesFromHistory: (chatHistory: MessageType[] | undefined, welcomeMessage?: string) => MessageType[];
//# sourceMappingURL=loadStoredMessages.d.ts.map