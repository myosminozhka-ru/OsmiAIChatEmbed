import { FilePreview as FilePreviewType } from '../types';
export type FilePreviewItemProps = {
    item: FilePreviewType;
    chatContainerWidth?: number;
    isFullPage?: boolean;
    inputDisabled: boolean;
    onDelete: (item: FilePreviewType) => void;
};
export declare const FilePreviewItem: (props: FilePreviewItemProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=FilePreviewItem.d.ts.map