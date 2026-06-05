import { Show, splitProps } from 'solid-js';

export type DisclaimerPopupProps = {
  isOpen?: boolean;
  isFullPage?: boolean;
  onAccept?: () => void;
  onDeny?: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  denyButtonText?: string;
};

export const DisclaimerPopup = (props: DisclaimerPopupProps) => {
  const [popupProps] = splitProps(props, ['onAccept', 'onDeny', 'isOpen', 'isFullPage', 'title', 'message', 'buttonText', 'denyButtonText']);

  const handleAccept = () => {
    popupProps.onAccept?.();
  };

  const handleDeny = () => {
    popupProps.onDeny?.();
  };

  return (
    <Show when={popupProps.isOpen}>
      <div class="chatbot-disclaimer-overlay fixed inset-0 rounded-lg flex items-center justify-center backdrop-blur-sm z-50">
        <div class="chatbot-disclaimer-content p-10 rounded-lg shadow-lg max-w-md w-full text-center mx-4 font-sans">
          <h2 class="text-2xl font-semibold mb-4 flex justify-center items-center">{popupProps.title ?? 'Disclaimer'}</h2>

          <p
            class="text-base mb-6"
            innerHTML={
              popupProps.message ??
              'By using this chatbot, you agree to the <a target="_blank" href="https://your-domain.com/terms">Terms & Condition</a>.'
            }
          />

          <div class="flex justify-center space-x-4">
            <button class="chatbot-disclaimer-accept font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline" onClick={handleAccept}>
              {popupProps.buttonText ?? 'Start Chatting'}
            </button>

            <Show when={!popupProps.isFullPage}>
              <button class="chatbot-disclaimer-deny font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline" onClick={handleDeny}>
                {popupProps.denyButtonText ?? 'Cancel'}
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
