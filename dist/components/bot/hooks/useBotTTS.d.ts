import { Accessor, Setter } from 'solid-js';
import { BotProps, MessageType } from '../types';
export type TtsStreamingState = {
    mediaSource: MediaSource | null;
    sourceBuffer: SourceBuffer | null;
    audio: HTMLAudioElement | null;
    chunkQueue: Uint8Array[];
    isBuffering: boolean;
    audioFormat: string | null;
    abortController: AbortController | null;
};
export type UseBotTTSOptions = {
    props: BotProps;
    chatId: Accessor<string>;
    setMessages: Setter<MessageType[]>;
    setTTSAction: (isActive: boolean) => void;
};
export declare const useBotTTS: (options: UseBotTTSOptions) => {
    isTTSLoading: Accessor<Record<string, boolean>>;
    isTTSPlaying: Accessor<Record<string, boolean>>;
    ttsAudio: Accessor<Record<string, HTMLAudioElement>>;
    isTTSEnabled: Accessor<boolean>;
    setIsTTSEnabled: Setter<boolean>;
    handleTTSStart: (data: {
        chatMessageId: string;
        format: string;
    }) => void;
    handleTTSDataChunk: (base64Data: string) => void;
    handleTTSEnd: () => void;
    handleTTSAbort: (data: {
        chatMessageId: string;
    }) => void;
    handleTTSClick: (messageId: string, messageText: string) => Promise<void>;
    handleTTSStop: (messageId: string) => Promise<void>;
    stopAllTTS: () => void;
};
//# sourceMappingURL=useBotTTS.d.ts.map