import { createSignal, For } from 'solid-js';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '../constants';

export type FormInputViewProps = {
  title: string;
  description: string;
  inputParams: any[];
  onSubmit: (formData: object) => void;
  parentBackgroundColor?: string;
  backgroundColor?: string;
  textColor?: string;
  sendButtonColor?: string;
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
      class="w-full h-full flex flex-col items-center justify-center px-4 py-8 rounded-lg"
      style={{
        'font-family': 'Montserrat, sans-serif',
        'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
        background: props.parentBackgroundColor || DEFAULT_BACKGROUND_COLOR,
        color: props.textColor || DEFAULT_TEXT_COLOR,
      }}
    >
      <div
        class="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden"
        style={{
          'font-family': 'Montserrat, sans-serif',
          'font-size': props.fontSize ? `${props.fontSize}px` : '16px',
          background: props.backgroundColor || DEFAULT_BACKGROUND_COLOR,
          color: props.textColor || DEFAULT_TEXT_COLOR,
        }}
      >
        <div class="p-6">
          <h2 class="text-xl font-bold mb-2">{props.title}</h2>
          {props.description && (
            <p class="text-gray-600 mb-6" style={{ color: props.textColor || DEFAULT_TEXT_COLOR }}>
              {props.description}
            </p>
          )}

          <form onSubmit={handleSubmit} class="space-y-4">
            <For each={props.inputParams}>
              {(param) => (
                <div class="space-y-2">
                  <label class="block text-sm font-medium">{param.label}</label>

                  {param.type === 'string' && (
                    <input
                      type="text"
                      class="w-full px-3 py-2 rounded-md focus:outline-none"
                      style={{
                        border: '1px solid #9ca3af',
                        'border-radius': '0.375rem',
                      }}
                      onFocus={(e) => (e.target.style.border = '1px solid #3b82f6')}
                      onBlur={(e) => (e.target.style.border = '1px solid #9ca3af')}
                      name={param.name}
                      onInput={(e) => handleInputChange(param.name, e.target.value)}
                      required
                    />
                  )}

                  {param.type === 'number' && (
                    <input
                      type="number"
                      class="w-full px-3 py-2 rounded-md focus:outline-none"
                      style={{
                        border: '1px solid #9ca3af',
                        'border-radius': '0.375rem',
                      }}
                      onFocus={(e) => (e.target.style.border = '1px solid #3b82f6')}
                      onBlur={(e) => (e.target.style.border = '1px solid #9ca3af')}
                      name={param.name}
                      onInput={(e) => handleInputChange(param.name, parseFloat(e.target.value))}
                      required
                    />
                  )}

                  {param.type === 'boolean' && (
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        style={{
                          border: '1px solid #9ca3af',
                        }}
                        name={param.name}
                        onChange={(e) => handleInputChange(param.name, e.target.checked)}
                      />
                      <span class="ml-2">Yes</span>
                    </div>
                  )}

                  {param.type === 'options' && (
                    <select
                      class="w-full px-3 py-2 rounded-md focus:outline-none"
                      style={{
                        border: '1px solid #9ca3af',
                        'border-radius': '0.375rem',
                      }}
                      onFocus={(e) => (e.target.style.border = '1px solid #3b82f6')}
                      onBlur={(e) => (e.target.style.border = '1px solid #9ca3af')}
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
                class="w-full py-2 px-4 text-white font-semibold rounded-md focus:outline-none transition duration-300 ease-in-out"
                style={{
                  'background-color': props.sendButtonColor || '#3B81F6',
                }}
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
