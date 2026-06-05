import { For } from 'solid-js';

const DEFAULT_SUGGESTIONS = ['Для чата', 'Для поддержки', 'Для продаж'] as const;

type SuggestionPromptsBarProps = {
  suggestions?: string[];
  onSelect: (text: string) => void;
  class?: string;
};

export const SuggestionPromptsBar = (props: SuggestionPromptsBarProps) => {
  const list = () => (props.suggestions?.length ? props.suggestions : [...DEFAULT_SUGGESTIONS]);
  return (
    <div class={'flex flex-wrap items-center gap-2 w-full ' + (props.class ?? '')} role="list" aria-label="Предложения">
      <For each={list()}>
        {(label) => (
          <button
            type="button"
            role="listitem"
            class="chatbot-suggestion-chip px-2.5 py-[7.5px] rounded-full text-xs font-normal transition-colors duration-200 hover:opacity-90 active:opacity-80 border bg-transparent"
            style={{ 'font-family': 'Montserrat, sans-serif' }}
            onClick={() => props.onSelect(label)}
          >
            {label}
          </button>
        )}
      </For>
    </div>
  );
};
