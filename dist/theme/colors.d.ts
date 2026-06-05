export type ThemeColors = {
    container?: {
        background?: string;
        backgroundImage?: string;
        shadow?: string;
    };
    header?: {
        background?: string;
        text?: string;
    };
    botBubble?: {
        background?: string;
        text?: string;
        border?: string;
    };
    userBubble?: {
        background?: string;
        text?: string;
    };
    input?: {
        background?: string;
        text?: string;
        placeholder?: string;
    };
    button?: {
        background?: string;
        icon?: string;
    };
    accent?: string;
    sendButton?: string;
    link?: string;
    feedback?: {
        default?: string;
        positive?: string;
        negative?: string;
    };
    footer?: {
        text?: string;
        poweredBy?: string;
        badgeBackground?: string;
    };
    form?: {
        background?: string;
        text?: string;
        submitButton?: string;
        border?: string;
        focusBorder?: string;
    };
    disclaimer?: {
        overlay?: string;
        background?: string;
        text?: string;
        acceptButton?: string;
        acceptButtonText?: string;
        denyButton?: string;
        denyButtonText?: string;
    };
    tooltip?: {
        background?: string;
        text?: string;
    };
    dialog?: {
        overlay?: string;
        background?: string;
        text?: string;
        primary?: string;
        destructive?: string;
        border?: string;
    };
    markdown?: {
        link?: string;
        inlineCode?: string;
        codeBlockText?: string;
    };
    misc?: {
        secondaryButtonBackground?: string;
        selectableBorder?: string;
        uploadProgress?: string;
        ratingIconFill?: string;
        ratingIconStroke?: string;
        spinnerBorder?: string;
        spinnerTop?: string;
        recordingBackground?: string;
        fileAnnotationBackground?: string;
        border?: string;
        suggestionText?: string;
        overlayHover?: string;
        overlayDark?: string;
    };
};
export declare const DEFAULT_THEME_COLORS: Required<{
    container: Required<NonNullable<ThemeColors['container']>>;
    header: Required<NonNullable<ThemeColors['header']>>;
    botBubble: Required<NonNullable<ThemeColors['botBubble']>>;
    userBubble: Required<NonNullable<ThemeColors['userBubble']>>;
    input: Required<NonNullable<ThemeColors['input']>>;
    button: Required<NonNullable<ThemeColors['button']>>;
    accent: string;
    sendButton: string;
    link: string;
    feedback: Required<NonNullable<ThemeColors['feedback']>>;
    footer: Required<NonNullable<ThemeColors['footer']>>;
    form: Required<NonNullable<ThemeColors['form']>>;
    disclaimer: Required<NonNullable<ThemeColors['disclaimer']>>;
    tooltip: Required<NonNullable<ThemeColors['tooltip']>>;
    dialog: Required<NonNullable<ThemeColors['dialog']>>;
    markdown: Required<NonNullable<ThemeColors['markdown']>>;
    misc: Required<NonNullable<ThemeColors['misc']>>;
}>;
export declare const themeColorsToCssVars: (colors?: ThemeColors) => Record<string, string>;
export declare const themeColorsToHostCss: (colors?: ThemeColors) => string;
//# sourceMappingURL=colors.d.ts.map