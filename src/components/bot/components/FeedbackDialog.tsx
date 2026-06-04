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
    <div class="fixed inset-0 rounded-lg flex items-center justify-center backdrop-blur-sm z-50" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
      <div class="p-6 rounded-lg shadow-lg max-w-md w-full text-center mx-4 font-sans" style={{ background: 'white', color: 'black' }}>
        <h2 class="text-xl font-semibold mb-4 flex justify-center items-center">Your Feedback</h2>

        <textarea
          class="w-full p-2 border border-gray-300 rounded-md mb-4"
          rows={4}
          placeholder="Please provide your feedback..."
          value={props.feedbackValue}
          onInput={(e) => props.setFeedbackValue(e.target.value)}
        />

        <div class="flex justify-center space-x-4">
          <button
            class="font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
            style={{ background: '#ef4444', color: 'white' }}
            onClick={props.onClose}
          >
            Cancel
          </button>
          <button
            class="font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
            style={{ background: '#3b82f6', color: 'white' }}
            onClick={props.onSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </Show>
);
