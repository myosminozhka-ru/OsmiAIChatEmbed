import { createSignal } from 'solid-js';
import { TrashIcon, FileIcon } from '../../../icons';

type CardWithDeleteOverlayProps = {
  item: { name: string };
  disabled?: boolean;
  onDelete: (item: { name: string }) => void;
};

export const FilePreview = (props: CardWithDeleteOverlayProps) => {
  const [isHovered, setIsHovered] = createSignal(false);

  const onMouseEnter = () => {
    if (props.disabled) return;
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    if (props.disabled) return;
    setIsHovered(false);
  };

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} class="relative inline-block">
      <div
        class={`inline-flex items-center h-12 max-w-max p-2 flex-none transition-opacity duration-300 opacity-100 chatbot-border chatbot-attachment-file rounded-md ${
          isHovered() ? 'chatbot-file-preview-hover blur-[2px]' : 'bg-transparent'
        }`}
      >
        <FileIcon class={`chatbot-form-text transition-filter duration-300`} />
        <span class={`ml-1.5 text-inherit transition-filter duration-300 whitespace-nowrap`}>{props.item.name}</span>
      </div>
      {isHovered() && !props.disabled && (
        <button
          disabled={props.disabled}
          onClick={() => props.onDelete(props.item)}
          class="absolute top-0 left-0 right-0 bottom-0 bg-transparent hover:bg-transparent flex items-center justify-center chatbot-header-icon"
          title="Удалить файл"
        >
          <TrashIcon />
        </button>
      )}
      {props.disabled && (
        <div class="chatbot-file-preview-overlay absolute inset-0 flex items-center justify-center z-10 rounded-md">
          <div class="spinner w-6 h-6" />
        </div>
      )}
    </div>
  );
};
