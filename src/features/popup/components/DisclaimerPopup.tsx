import { Show, splitProps } from 'solid-js';

export type DisclaimerPopupProps = {
  isOpen?: boolean;
  isFullPage?: boolean; // New prop to indicate full-page mode
  onAccept?: () => void;
  onDeny?: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  denyButtonText?: string;
  blurredBackgroundColor?: string;
  backgroundColor?: string;
  buttonColor?: string;
  textColor?: string;
  buttonTextColor?: string;
  denyButtonBgColor?: string;
};

export const DisclaimerPopup = (props: DisclaimerPopupProps) => {
  const [popupProps] = splitProps(props, [
    'onAccept',
    'onDeny',
    'isOpen',
    'isFullPage', // New prop
    'title',
    'message',
    'textColor',
    'buttonColor',
    'buttonText',
    'denyButtonText',
    'buttonTextColor',
    'denyButtonBgColor',
    'blurredBackgroundColor',
    'backgroundColor',
  ]);

  const handleAccept = () => {
    popupProps.onAccept?.();
  };

  const handleDeny = () => {
    popupProps.onDeny?.();
  };

  return (
    <Show when={popupProps.isOpen}>
      <div
        class="fixed inset-0 rounded-lg flex items-center justify-center backdrop-blur-sm z-50"
        style={{ background: popupProps.blurredBackgroundColor ?? 'rgba(0, 0, 0, 0.4)' }}
      >
        <div
          class="p-10 rounded-lg shadow-lg max-w-md w-full text-center mx-4 font-sans chatbot-container"
          style={{ background: 'var(--chatbot-container-bg-color)', color: 'var(--chatbot-container-color)' }}
        >
          <h2 class="text-2xl font-semibold mb-4 flex justify-center items-center">{popupProps.title ?? 'Disclaimer'}</h2>

          <p
            class="text-gray-700 text-base mb-6"
            style={{ color: 'var(--chatbot-container-color)' }}
            innerHTML={
              popupProps.message ??
              'By using this chatbot, you agree to the <a target="_blank" href="https://flowiseai.com/terms">Terms & Condition</a>.'
            }
          />

          <div class="flex justify-center space-x-4">
            <button
              class="font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline chatbot-button"
              style={{ background: 'var(--chatbot-button-bg-color)', color: 'var(--chatbot-button-color)' }}
              onClick={handleAccept}
            >
              {popupProps.buttonText ?? 'Start Chatting'}
            </button>

            <Show when={!popupProps.isFullPage}>
              <button
                class="font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                style={{ background: popupProps.denyButtonBgColor ?? '#ef4444', color: 'var(--chatbot-button-color)' }}
                onClick={handleDeny}
              >
                {popupProps.denyButtonText ?? 'Cancel'}
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
