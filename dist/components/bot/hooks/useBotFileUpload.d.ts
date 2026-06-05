import { Accessor } from 'solid-js';
import { FileEvent, FilePreview, UploadsConfig } from '../types';
export type UseBotFileUploadOptions = {
    uploadsConfig: Accessor<UploadsConfig | undefined>;
    fullFileUpload: Accessor<boolean>;
};
export declare const useBotFileUpload: (options: UseBotFileUploadOptions) => {
    previews: Accessor<FilePreview[]>;
    setPreviews: import("solid-js").Setter<FilePreview[]>;
    isDragActive: Accessor<boolean>;
    uploadedFiles: Accessor<{
        file: File;
        type: string;
    }[]>;
    setUploadedFiles: import("solid-js").Setter<{
        file: File;
        type: string;
    }[]>;
    clearPreviews: () => void;
    handleFileChange: (event: FileEvent<HTMLInputElement>) => Promise<void>;
    handleDrag: (e: DragEvent) => void;
    handleDrop: (e: InputEvent | DragEvent) => Promise<void>;
    handleDeletePreview: (itemToDelete: FilePreview) => void;
    addRecordingToPreviews: (blob: Blob) => void;
    isFileUploadAllowed: () => boolean;
};
//# sourceMappingURL=useBotFileUpload.d.ts.map