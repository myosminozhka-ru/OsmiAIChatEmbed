import { Setter } from 'solid-js';
import { BotProps, LeadsConfig, MessageType, UploadsConfig } from '../types';
export type UseBotInitOptions = {
    props: BotProps;
    setChatId: Setter<string>;
    setMessages: Setter<MessageType[]>;
    setDisclaimerPopupOpen: Setter<boolean>;
    setIsChatFlowAvailableToStream: Setter<boolean>;
    setStarterPrompts: Setter<string[]>;
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
    setUploadedFiles: Setter<{
        file: File;
        type: string;
    }[]>;
    setLoading: Setter<boolean>;
    setIsLeadSaved: Setter<boolean>;
    setLeadEmail: Setter<string>;
};
export declare const useBotInit: (options: UseBotInitOptions) => void;
//# sourceMappingURL=useBotInit.d.ts.map