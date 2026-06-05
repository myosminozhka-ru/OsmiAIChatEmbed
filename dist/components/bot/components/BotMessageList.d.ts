import { BotProps, IAction, LeadsConfig, MessageType } from '../types';
export type BotMessageListProps = {
    props: BotProps;
    messages: MessageType[];
    chatId: string;
    loading: boolean;
    chatFeedbackStatus: boolean;
    leadsConfig?: LeadsConfig;
    isLeadSaved: boolean;
    setIsLeadSaved: (value: boolean) => void;
    setLeadEmail: (value: string) => void;
    starterPrompts: string[];
    isTTSEnabled: boolean;
    isTTSLoading: Record<string, boolean>;
    isTTSPlaying: Record<string, boolean>;
    handleTTSClick: (messageId: string, messageText: string) => void;
    handleTTSStop: (messageId: string) => void;
    handleActionClick: (elem: any, action: IAction | undefined | null) => void;
    onStarterPromptClick: (prompt: string) => void;
    onSourceDocumentsClick: (sourceDocuments: any) => void;
};
export declare const BotMessageList: (listProps: BotMessageListProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=BotMessageList.d.ts.map