import { createSignal } from 'solid-js';

type FeedbackContentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
};

const FeedbackContentDialog = (props: FeedbackContentDialogProps) => {
  const [inputValue, setInputValue] = createSignal('');
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined;

  const handleInput = (value: string) => setInputValue(value);

  const checkIfInputIsValid = () => inputValue() !== '' && inputRef?.reportValidity();

  const submit = () => {
    if (checkIfInputIsValid()) props.onSubmit(inputValue());
    setInputValue('');
  };

  const onClose = () => {
    props.onClose();
  };

  return (
    <>
      <div class="flex overflow-x-hidden overflow-y-auto fixed inset-0 z-[1002] outline-none focus:outline-none justify-center items-center">
        <div class="relative w-full my-6 max-w-3xl mx-4">
          <div class="chatbot-dialog-content border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none focus:outline-none">
            <div class="flex items-center justify-between p-5 chatbot-border rounded-t">
              <span class="whitespace-pre-wrap font-semibold max-w-full">Хотите добавить комментарий?</span>
              <button
                class="p-1 ml-auto bg-transparent border-0 float-right text-xl leading-none font-semibold outline-none focus:outline-none chatbot-dialog-content"
                type="button"
                onClick={onClose}
              >
                <span class="bg-transparent block outline-none focus:outline-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </span>
              </button>
            </div>
            <div class="relative p-6 flex-auto">
              <textarea
                onInput={(e) => handleInput(e.currentTarget.value)}
                ref={inputRef as HTMLTextAreaElement}
                rows="4"
                class="feedback-input block p-2.5 rounded-lg chatbot-border bg-transparent flex-1 w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 font-normal"
                placeholder="Оставьте комментарий"
                value={inputValue()}
              />
            </div>
            <div class="flex items-center justify-end p-4 chatbot-border-t rounded-b">
              <button
                class="chatbot-dialog-primary font-bold text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={submit}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="chatbot-dialog-overlay opacity-25 fixed inset-0 z-[1001]" />
    </>
  );
};

export default FeedbackContentDialog;
