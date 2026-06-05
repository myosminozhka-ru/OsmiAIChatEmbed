import type { ThemeColors } from '@/theme/colors';
export type BubbleParams = {
    theme?: BubbleTheme;
};
export type BubbleTheme = {
    colors?: ThemeColors;
    chatWindow?: ChatWindowTheme;
    button?: ButtonTheme;
    tooltip?: ToolTipTheme;
    disclaimer?: DisclaimerPopUpTheme;
    customCSS?: string;
};
export type TextInputTheme = {
    placeholder?: string;
    maxChars?: number;
    maxCharsWarningMessage?: string;
    autoFocus?: boolean;
    sendMessageSound?: boolean;
    sendSoundLocation?: string;
    receiveMessageSound?: boolean;
    receiveSoundLocation?: string;
};
export type UserMessageTheme = {
    showAvatar?: boolean;
    avatarSrc?: string;
};
export type BotMessageTheme = {
    showAvatar?: boolean;
    avatarSrc?: string;
};
export type FooterTheme = {
    showFooter?: boolean;
    text?: string;
    company?: string;
    companyLink?: string;
};
export type ChatWindowTheme = {
    showTitle?: boolean;
    showAgentMessages?: boolean;
    title?: string;
    titleAvatarSrc?: string;
    welcomeMessage?: string;
    errorMessage?: string;
    height?: number;
    width?: number;
    fontSize?: number;
    userMessage?: UserMessageTheme;
    botMessage?: BotMessageTheme;
    textInput?: TextInputTheme;
    footer?: FooterTheme;
    sourceDocsTitle?: string;
    starterPrompts?: string[];
    starterPromptFontSize?: number;
    clearChatOnReload?: boolean;
    dateTimeToggle?: DateTimeToggleTheme;
    renderHTML?: boolean;
};
export type ButtonTheme = {
    size?: 'small' | 'medium' | 'large' | number;
    customIconSrc?: string;
    bottom?: number;
    right?: number;
    dragAndDrop?: boolean;
    autoWindowOpen?: autoWindowOpenTheme;
};
export type ToolTipTheme = {
    showTooltip?: boolean;
    tooltipMessage?: string;
    tooltipFontSize?: number;
};
export type autoWindowOpenTheme = {
    autoOpen?: boolean;
    openDelay?: number;
    autoOpenOnMobile?: boolean;
};
export type DisclaimerPopUpTheme = {
    title?: string;
    message?: string;
    buttonText?: string;
    denyButtonText?: string;
};
export type DateTimeToggleTheme = {
    date?: boolean;
    time?: boolean;
};
//# sourceMappingURL=types.d.ts.map