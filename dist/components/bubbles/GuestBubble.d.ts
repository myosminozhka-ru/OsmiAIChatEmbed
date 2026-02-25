import { MessageType } from '../Bot';
import { DateTimeToggleTheme } from '@/features/bubble/types';
type Props = {
    message: MessageType;
    apiHost?: string;
    chatflowid: string;
    chatId: string;
    showAvatar?: boolean;
    avatarSrc?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    renderHTML?: boolean;
    dateTime?: string;
    dateTimeToggle?: DateTimeToggleTheme;
};
export declare const GuestBubble: (props: Props) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=GuestBubble.d.ts.map