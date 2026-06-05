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
export declare const BotDragOverlay: (props: BotDragOverlayProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=BotDragOverlay.d.ts.map