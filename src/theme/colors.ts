export type ThemeColors = {
  container?: { background?: string; backgroundImage?: string; shadow?: string };
  header?: { background?: string; text?: string };
  botBubble?: { background?: string; text?: string; border?: string };
  userBubble?: { background?: string; text?: string };
  input?: { background?: string; text?: string; placeholder?: string };
  button?: { background?: string; icon?: string };
  accent?: string;
  sendButton?: string;
  link?: string;
  feedback?: { default?: string; positive?: string; negative?: string };
  footer?: { text?: string; poweredBy?: string; badgeBackground?: string };
  form?: { background?: string; text?: string; submitButton?: string; border?: string; focusBorder?: string };
  disclaimer?: {
    overlay?: string;
    background?: string;
    text?: string;
    acceptButton?: string;
    acceptButtonText?: string;
    denyButton?: string;
    denyButtonText?: string;
  };
  tooltip?: { background?: string; text?: string };
  dialog?: { overlay?: string; background?: string; text?: string; primary?: string; destructive?: string; border?: string };
  markdown?: { link?: string; inlineCode?: string; codeBlockText?: string };
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

export const DEFAULT_THEME_COLORS: Required<{
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
}> = {
  container: {
    background: '#0f0f10',
    backgroundImage: 'none',
    shadow: 'rgb(0 0 0 / 16%) 0px 5px 40px',
  },
  header: {
    background: '#252b5f',
    text: '#ffffff',
  },
  botBubble: {
    background: '#19191b',
    text: '#ffffff',
    border: '#4D5164',
  },
  userBubble: {
    background: '#FF4978',
    text: '#ffffff',
  },
  input: {
    background: '#19191b',
    text: '#ffffff',
    placeholder: '#9095a0',
  },
  button: {
    background: '#4D5164',
    icon: '#ffffff',
  },
  accent: '#FF4978',
  sendButton: '#FF4978',
  link: '#16bed7',
  feedback: {
    default: '#3B81F6',
    positive: '#00e676',
    negative: '#f44336',
  },
  footer: {
    text: '#FFFFFF',
    poweredBy: '#FFFFFF',
    badgeBackground: '#4D5164',
  },
  form: {
    background: '#ffffff',
    text: '#303235',
    submitButton: '#3B81F6',
    border: '#9ca3af',
    focusBorder: '#3b82f6',
  },
  disclaimer: {
    overlay: 'rgba(0, 0, 0, 0.4)',
    background: '#ffffff',
    text: '#303235',
    acceptButton: '#3b82f6',
    acceptButtonText: '#ffffff',
    denyButton: '#ef4444',
    denyButtonText: '#ffffff',
  },
  tooltip: {
    background: '#000000',
    text: '#ffffff',
  },
  dialog: {
    overlay: 'rgba(0, 0, 0, 0.4)',
    background: '#ffffff',
    text: '#303235',
    primary: '#3b82f6',
    destructive: '#ef4444',
    border: '#eeeeee',
  },
  markdown: {
    link: '#16bed7',
    inlineCode: '#4CAF50',
    codeBlockText: '#FFFFFF',
  },
  misc: {
    secondaryButtonBackground: '#f7f8ff',
    selectableBorder: '#0042da',
    uploadProgress: '#0042da',
    ratingIconFill: '#f7f8ff',
    ratingIconStroke: '#0042da',
    spinnerBorder: 'rgba(255, 255, 255, 0.3)',
    spinnerTop: '#ffffff',
    recordingBackground: '#29292C',
    fileAnnotationBackground: '#02a0a0c2',
    border: '#eeeeee',
    suggestionText: 'rgba(255, 255, 255, 0.9)',
    overlayHover: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.4)',
  },
};

const mergeColors = (colors?: ThemeColors) => ({
  container: { ...DEFAULT_THEME_COLORS.container, ...colors?.container },
  header: { ...DEFAULT_THEME_COLORS.header, ...colors?.header },
  botBubble: { ...DEFAULT_THEME_COLORS.botBubble, ...colors?.botBubble },
  userBubble: { ...DEFAULT_THEME_COLORS.userBubble, ...colors?.userBubble },
  input: { ...DEFAULT_THEME_COLORS.input, ...colors?.input },
  button: { ...DEFAULT_THEME_COLORS.button, ...colors?.button },
  accent: colors?.accent ?? DEFAULT_THEME_COLORS.accent,
  sendButton: colors?.sendButton ?? colors?.accent ?? DEFAULT_THEME_COLORS.sendButton,
  link: colors?.link ?? DEFAULT_THEME_COLORS.link,
  feedback: { ...DEFAULT_THEME_COLORS.feedback, ...colors?.feedback },
  footer: { ...DEFAULT_THEME_COLORS.footer, ...colors?.footer },
  form: { ...DEFAULT_THEME_COLORS.form, ...colors?.form },
  disclaimer: { ...DEFAULT_THEME_COLORS.disclaimer, ...colors?.disclaimer },
  tooltip: { ...DEFAULT_THEME_COLORS.tooltip, ...colors?.tooltip },
  dialog: { ...DEFAULT_THEME_COLORS.dialog, ...colors?.dialog },
  markdown: { ...DEFAULT_THEME_COLORS.markdown, ...colors?.markdown },
  misc: { ...DEFAULT_THEME_COLORS.misc, ...colors?.misc },
});

const formatBackgroundImage = (value: string): string => {
  if (!value || value === 'none') return 'none';
  if (value.startsWith('url(')) return value;
  return `url(${value})`;
};

export const themeColorsToCssVars = (colors?: ThemeColors): Record<string, string> => {
  const c = mergeColors(colors);

  return {
    '--chatbot-container-bg-image': formatBackgroundImage(c.container.backgroundImage),
    '--chatbot-container-bg-color': c.container.background,
    '--chatbot-container-shadow': c.container.shadow,

    '--chatbot-header-bg-color': c.header.background,
    '--chatbot-header-color': c.header.text,

    '--chatbot-host-bubble-bg-color': c.botBubble.background,
    '--chatbot-host-bubble-color': c.botBubble.text,
    '--chatbot-host-bubble-border': `1px solid ${c.botBubble.border}`,

    '--chatbot-guest-bubble-bg-color': c.userBubble.background,
    '--chatbot-guest-bubble-color': c.userBubble.text,

    '--chatbot-input-bg-color': c.input.background,
    '--chatbot-input-color': c.input.text,
    '--chatbot-input-placeholder-color': c.input.placeholder,

    '--chatbot-button-bg-color': c.button.background,
    '--chatbot-button-color': c.button.icon,
    '--chatbot-button-icon-color': c.button.icon,

    '--chatbot-accent-color': c.accent,
    '--chatbot-send-button-color': c.sendButton,
    '--chatbot-link-color': c.link,

    '--chatbot-feedback-color': c.feedback.default,
    '--chatbot-feedback-positive-color': c.feedback.positive,
    '--chatbot-feedback-negative-color': c.feedback.negative,

    '--chatbot-footer-text-color': c.footer.text,
    '--chatbot-powered-by-text-color': c.footer.poweredBy,
    '--chatbot-badge-background-color': c.footer.badgeBackground,

    '--chatbot-form-bg-color': c.form.background,
    '--chatbot-form-text-color': c.form.text,
    '--chatbot-form-submit-button-color': c.form.submitButton,
    '--chatbot-form-border-color': c.form.border,
    '--chatbot-form-focus-border-color': c.form.focusBorder,

    '--chatbot-disclaimer-overlay-color': c.disclaimer.overlay,
    '--chatbot-disclaimer-bg-color': c.disclaimer.background,
    '--chatbot-disclaimer-text-color': c.disclaimer.text,
    '--chatbot-disclaimer-accept-button-color': c.disclaimer.acceptButton,
    '--chatbot-disclaimer-accept-button-text-color': c.disclaimer.acceptButtonText,
    '--chatbot-disclaimer-deny-button-color': c.disclaimer.denyButton,
    '--chatbot-disclaimer-deny-button-text-color': c.disclaimer.denyButtonText,

    '--chatbot-tooltip-background-color': c.tooltip.background,
    '--chatbot-tooltip-text-color': c.tooltip.text,

    '--chatbot-dialog-overlay-color': c.dialog.overlay,
    '--chatbot-dialog-bg-color': c.dialog.background,
    '--chatbot-dialog-text-color': c.dialog.text,
    '--chatbot-dialog-primary-color': c.dialog.primary,
    '--chatbot-dialog-destructive-color': c.dialog.destructive,
    '--chatbot-dialog-border-color': c.dialog.border,

    '--chatbot-markdown-link-color': c.markdown.link,
    '--chatbot-markdown-inline-code-color': c.markdown.inlineCode,
    '--chatbot-markdown-code-block-text-color': c.markdown.codeBlockText,

    '--chatbot-secondary-button-bg-color': c.misc.secondaryButtonBackground,
    '--chatbot-selectable-border-color': c.misc.selectableBorder,
    '--chatbot-upload-progress-color': c.misc.uploadProgress,
    '--chatbot-rating-icon-fill-color': c.misc.ratingIconFill,
    '--chatbot-rating-icon-stroke-color': c.misc.ratingIconStroke,
    '--chatbot-spinner-border-color': c.misc.spinnerBorder,
    '--chatbot-spinner-top-color': c.misc.spinnerTop,
    '--chatbot-recording-bg-color': c.misc.recordingBackground,
    '--chatbot-file-annotation-bg-color': c.misc.fileAnnotationBackground,
    '--chatbot-border-color': c.misc.border,
    '--chatbot-suggestion-text-color': c.misc.suggestionText,
    '--chatbot-overlay-hover-color': c.misc.overlayHover,
    '--chatbot-overlay-dark-color': c.misc.overlayDark,
  };
};

export const themeColorsToHostCss = (colors?: ThemeColors): string => {
  const vars = themeColorsToCssVars(colors);
  const declarations = Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
  return `:host { ${declarations}; }`;
};
