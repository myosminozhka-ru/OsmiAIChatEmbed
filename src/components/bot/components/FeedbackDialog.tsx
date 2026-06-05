import { Show } from 'solid-js';

export type FeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  feedbackValue: string;
  setFeedbackValue: (value: string) => void;
};

export const FeedbackDialog = (props: FeedbackDialogProps) => (
  <Show when={props.isOpen}>
    <div class="chatbot-dialog-overlay fixed inset-0 rounded-lg flex items-center justify-center backdrop-blur-sm z-50">
      <div class="chatbot-dialog-content p-6 rounded-lg shadow-lg max-w-md w-full text-center mx-4 font-sans">
        <h2 class="text-xl font-semibold mb-4 flex justify-center items-center">Your Feedback</h2>

        <textarea
          class="w-full p-2 chatbot-border rounded-md mb-4 chatbot-dialog-content"
          rows={4}
          placeholder="Please provide your feedback..."
          value={props.feedbackValue}
          onInput={(e) => props.setFeedbackValue(e.target.value)}
        />

        <div class="flex justify-center space-x-4">
          <button class="chatbot-dialog-destructive font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline" onClick={props.onClose}>
            Cancel
          </button>
          <button class="chatbot-dialog-primary font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline" onClick={props.onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  </Show>
);
