import { observersConfigType } from './components/Bot';
import { BubbleTheme } from './features/bubble/types';

/* eslint-disable solid/reactivity */
type BotProps = {
  chatflowid: string;
  apiHost?: string;
  authApiUrl?: string;
  apiKey?: string;
  onRequest?: (request: RequestInit) => Promise<void>;
  chatflowConfig?: Record<string, unknown>;
  observersConfig?: observersConfigType;
  theme?: BubbleTheme;
};

let elementUsed: Element | undefined;

const createOnRequestWithApiKey = (apiKey?: string, customOnRequest?: (request: RequestInit) => Promise<void>) => {
  if (!apiKey && !customOnRequest) return undefined;
  return async (request: RequestInit) => {
    if (apiKey) {
      if (!request.headers) request.headers = {};
      (request.headers as Record<string, string>)['Authorization'] = `Bearer ${apiKey}`;
    }
    if (customOnRequest) await customOnRequest(request);
  };
};

export const initFull = (props: BotProps & { id?: string }) => {
  destroy();
  const { apiKey, authApiUrl, onRequest, ...restProps } = props;
  const finalOnRequest = createOnRequestWithApiKey(apiKey, onRequest);
  if (authApiUrl && typeof window !== 'undefined') {
    (window as any).__AUTH_API_URL__ = authApiUrl;
  }
  const finalProps = { ...restProps, authApiUrl, onRequest: finalOnRequest };
  let fullElement = props.id ? document.getElementById(props.id) : document.querySelector('osmi-ai-fullchatbot');
  if (!fullElement) {
    fullElement = document.createElement('osmi-ai-fullchatbot');
    Object.assign(fullElement, finalProps);
    document.body.appendChild(fullElement);
  } else {
    Object.assign(fullElement, finalProps);
  }
  elementUsed = fullElement;
};

export const init = (props: BotProps) => {
  destroy();
  const { apiKey, authApiUrl, onRequest, ...restProps } = props;
  const finalOnRequest = createOnRequestWithApiKey(apiKey, onRequest);
  if (authApiUrl && typeof window !== 'undefined') {
    (window as any).__AUTH_API_URL__ = authApiUrl;
  }
  const element = document.createElement('osmi-ai-chatbot');
  Object.assign(element, { ...restProps, authApiUrl, onRequest: finalOnRequest });
  document.body.appendChild(element);
  elementUsed = element;
};

export const destroy = () => {
  elementUsed?.remove();
};

type Chatbot = {
  initFull: typeof initFull;
  init: typeof init;
  destroy: typeof destroy;
};

declare const window:
  | {
      Chatbot: Chatbot | undefined;
    }
  | undefined;

export const parseChatbot = () => ({
  initFull,
  init,
  destroy,
});

export const injectChatbotInWindow = (bot: Chatbot) => {
  if (typeof window === 'undefined') return;
  window.Chatbot = { ...bot };
};
