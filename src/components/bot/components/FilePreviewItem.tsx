import { TrashIcon } from '@/components/icons';
import { FilePreview as FilePreviewType } from '../types';
import { FilePreview } from '@/components/inputs/textInput/components/FilePreview';

export type FilePreviewItemProps = {
  item: FilePreviewType;
  chatContainerWidth?: number;
  isFullPage?: boolean;
  inputDisabled: boolean;
  onDelete: (item: FilePreviewType) => void;
};

export const FilePreviewItem = (props: FilePreviewItemProps) => {
  const { item } = props;

  if (item.mime.startsWith('image/')) {
    return (
      <button
        class="group w-12 h-12 flex items-center justify-center relative rounded-[10px] overflow-hidden transition-colors duration-200"
        onClick={() => props.onDelete(item)}
      >
        <img class="w-full h-full bg-cover" src={item.data as string} />
        <span class="absolute hidden group-hover:flex items-center justify-center z-10 w-full h-full top-0 left-0 bg-black/10 rounded-[10px] transition-colors duration-200">
          <TrashIcon />
        </span>
      </button>
    );
  }

  if (item.mime.startsWith('audio/')) {
    const width = props.chatContainerWidth ? (props.isFullPage ? props.chatContainerWidth / 4 : props.chatContainerWidth / 2) : 200;
    return (
      <div
        class="inline-flex basis-auto flex-grow-0 flex-shrink-0 justify-between items-center rounded-xl h-12 p-1 mr-1 bg-gray-500"
        style={{ width: `${width}px` }}
      >
        <audio class="block bg-cover bg-center w-full h-full rounded-none text-transparent" controls src={item.data as string} />
        <button class="w-7 h-7 flex items-center justify-center bg-transparent p-1" onClick={() => props.onDelete(item)}>
          <TrashIcon color="white" />
        </button>
      </div>
    );
  }

  return <FilePreview disabled={props.inputDisabled} item={item} onDelete={() => props.onDelete(item)} />;
};
