import { Accessor, Setter } from 'solid-js';
import { BotProps, FileUpload, IAction, IAgentReasoning, MessageType } from '../types';
export type MessageUpdatersOptions = {
    props: BotProps;
    chatId: Accessor<string>;
    setMessages: Setter<MessageType[]>;
    playReceiveSound: () => void;
};
export declare const createMessageUpdaters: (options: MessageUpdatersOptions) => {
    addChatMessage: (allMessage: MessageType[]) => void;
    resetSoundPlayed: () => void;
    updateLastMessage: (text: string) => void;
    updateErrorMessage: (errorMessage: string) => void;
    updateLastMessageSourceDocuments: (sourceDocuments: any) => void;
    updateLastMessageUsedTools: (usedTools: any[]) => void;
    updateLastMessageFileAnnotations: (fileAnnotations: any) => void;
    updateLastMessageAgentReasoning: (agentReasoning: string | IAgentReasoning[]) => void;
    updateAgentFlowEvent: (event: string) => void;
    updateAgentFlowExecutedData: (agentFlowExecutedData: any) => void;
    updateLastMessageArtifacts: (artifacts: FileUpload[]) => void;
    updateLastMessageAction: (action: IAction) => void;
    updateMetadata: (data: any, input: string, setFollowUpPrompts: (prompts: string[]) => void, setChatId: (id: string) => void) => void;
    stripUploadDataFromLastUserMessage: () => void;
};
//# sourceMappingURL=messageUpdaters.d.ts.map