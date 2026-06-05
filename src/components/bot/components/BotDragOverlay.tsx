import { For, Show } from 'solid-js';
import { UploadsConfig } from '../types';

export type BotDragOverlayProps = {
  isDragActive: boolean;
  uploadsConfig?: UploadsConfig;
  isFileUploadAllowed: boolean;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: InputEvent | DragEvent) => void;
};

export const BotDragOverlay = (props: BotDragOverlayProps) => (
  <>
    <Show when={props.isDragActive}>
      <div
        class="absolute top-0 left-0 bottom-0 right-0 w-full h-full z-50"
        onDragEnter={props.onDragEnter}
        onDragLeave={props.onDragLeave}
        onDragEnd={props.onDragEnd}
        onDragOver={props.onDragOver}
        onDrop={props.onDrop}
      />
    </Show>
    <Show when={props.isDragActive && (props.uploadsConfig?.isImageUploadAllowed || props.isFileUploadAllowed)}>
      <div
        class="absolute top-0 left-0 bottom-0 right-0 flex flex-col items-center justify-center backdrop-blur-sm z-40 gap-2 border-2 border-dashed chatbot-drag-overlay"
        style={{ background: 'var(--chatbot-overlay-dark-color)', color: 'var(--chatbot-header-color)' }}
      >
        <h2 class="text-xl font-semibold">Drop here to upload</h2>
        <For each={[...(props.uploadsConfig?.imgUploadSizeAndTypes || []), ...(props.uploadsConfig?.fileUploadSizeAndTypes || [])]}>
          {(allowed) => (
            <>
              <span>{allowed.fileTypes?.join(', ')}</span>
              {allowed.maxUploadSize && <span>Max Allowed Size: {allowed.maxUploadSize} MB</span>}
            </>
          )}
        </For>
      </div>
    </Show>
  </>
);
