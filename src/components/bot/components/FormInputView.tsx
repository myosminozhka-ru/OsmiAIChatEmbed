import { createSignal, For } from 'solid-js';

export type FormInputViewProps = {
  title: string;
  description: string;
  inputParams: any[];
  onSubmit: (formData: object) => void;
  fontSize?: number;
};

export const FormInputView = (props: FormInputViewProps) => {
  const [formData, setFormData] = createSignal<Record<string, any>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSubmit(formData());
  };

  return (
    <div
      class="chatbot-form-view w-full h-full flex flex-col items-center justify-center px-4 py-8 rounded-lg"
      style={{
        'font-family': 'Montserrat, sans-serif',
        'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
      }}
    >
      <div
        class="chatbot-form-view w-full max-w-md shadow-lg rounded-lg overflow-hidden"
        style={{
          'font-family': 'Montserrat, sans-serif',
          'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
        }}
      >
        <div class="p-6">
          <h2 class="text-xl font-bold mb-2">{props.title}</h2>
          {props.description && <p class="mb-6">{props.description}</p>}

          <form onSubmit={handleSubmit} class="space-y-4">
            <For each={props.inputParams}>
              {(param) => (
                <div class="space-y-2">
                  <label class="block text-sm font-medium">{param.label}</label>

                  {param.type === 'string' && (
                    <input
                      type="text"
                      class="chatbot-form-input w-full px-3 py-2 rounded-md focus:outline-none"
                      name={param.name}
                      onInput={(e) => handleInputChange(param.name, e.target.value)}
                      required
                    />
                  )}

                  {param.type === 'number' && (
                    <input
                      type="number"
                      class="chatbot-form-input w-full px-3 py-2 rounded-md focus:outline-none"
                      name={param.name}
                      onInput={(e) => handleInputChange(param.name, parseFloat(e.target.value))}
                      required
                    />
                  )}

                  {param.type === 'boolean' && (
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        class="chatbot-form-input h-4 w-4 rounded"
                        name={param.name}
                        onChange={(e) => handleInputChange(param.name, e.target.checked)}
                      />
                      <span class="ml-2">Yes</span>
                    </div>
                  )}

                  {param.type === 'options' && (
                    <select
                      class="chatbot-form-input w-full px-3 py-2 rounded-md focus:outline-none"
                      name={param.name}
                      onChange={(e) => handleInputChange(param.name, e.target.value)}
                      required
                    >
                      <option value="">Select an option</option>
                      <For each={param.options}>{(option) => <option value={option.name}>{option.label}</option>}</For>
                    </select>
                  )}
                </div>
              )}
            </For>

            <div class="pt-4">
              <button
                type="submit"
                class="chatbot-form-submit w-full py-2 px-4 font-semibold rounded-md focus:outline-none transition duration-300 ease-in-out"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
