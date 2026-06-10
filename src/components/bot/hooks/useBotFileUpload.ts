import { Accessor, createSignal } from 'solid-js';
import { FileEvent, FilePreview, UploadsConfig } from '../types';

export type UseBotFileUploadOptions = {
  uploadsConfig: Accessor<UploadsConfig | undefined>;
  fullFileUpload: Accessor<boolean>;
};

export const useBotFileUpload = (options: UseBotFileUploadOptions) => {
  const { uploadsConfig, fullFileUpload } = options;

  const [previews, setPreviews] = createSignal<FilePreview[]>([]);
  const [isDragActive, setIsDragActive] = createSignal(false);
  const [uploadedFiles, setUploadedFiles] = createSignal<{ file: File; type: string }[]>([]);

  const clearPreviews = () => {
    previews().forEach((file) => URL.revokeObjectURL(file.preview));
    setPreviews([]);
  };

  const isImageFile = (file: File) => file.type.startsWith('image/');

  const isFileAllowedForUpload = (file: File) => {
    const config = uploadsConfig();
    const sizeInMB = file.size / 1024 / 1024;

    if (isImageFile(file)) {
      if (!config?.isImageUploadAllowed) {
        alert(`Cannot upload file. Kindly check the allowed file types and maximum allowed size.`);
        return false;
      }
      if (config.imgUploadSizeAndTypes) {
        let acceptFile = false;
        config.imgUploadSizeAndTypes.forEach((allowed) => {
          if (allowed.fileTypes.includes(file.type) && sizeInMB <= allowed.maxUploadSize) {
            acceptFile = true;
          }
        });
        if (!acceptFile) {
          alert(`Cannot upload file. Kindly check the allowed file types and maximum allowed size.`);
        }
        return acceptFile;
      }
      return true;
    }

    if (fullFileUpload()) {
      return true;
    }

    if (config?.isRAGFileUploadAllowed && config.fileUploadSizeAndTypes) {
      let acceptFile = false;
      const fileExt = file.name.split('.').pop();
      if (fileExt) {
        config.fileUploadSizeAndTypes.forEach((allowed) => {
          if (allowed.fileTypes.length === 1 && allowed.fileTypes[0] === '*') {
            acceptFile = true;
          } else if (allowed.fileTypes.includes(`.${fileExt}`)) {
            acceptFile = true;
          }
        });
      }
      if (!acceptFile) {
        alert(`Cannot upload file. Kindly check the allowed file types and maximum allowed size.`);
      }
      return acceptFile;
    }

    alert(`Cannot upload file. Kindly check the allowed file types and maximum allowed size.`);
    return false;
  };

  const isFileUploadAllowed = () => fullFileUpload() || !!uploadsConfig()?.isRAGFileUploadAllowed;

  const appendFilesFromInput = async (files: FileList | File[], useDropPreview = false) => {
    const filesList: Promise<FilePreview>[] = [];
    const newUploadedFiles: { file: File; type: string }[] = [];

    for (const file of files) {
      if (!isFileAllowedForUpload(file)) {
        return;
      }
      if (!isImageFile(file)) {
        newUploadedFiles.push({ file, type: fullFileUpload() ? 'file:full' : 'file:rag' });
      }
      const reader = new FileReader();
      const { name } = file;
      filesList.push(
        new Promise((resolve) => {
          reader.onload = (evt) => {
            if (!evt?.target?.result) return;
            const { result } = evt.target;
            let previewUrl: string;
            if (useDropPreview) {
              if (file.type.startsWith('audio/')) {
                previewUrl = '../assets/wave-sound.jpg';
              } else if (file.type.startsWith('image/')) {
                previewUrl = URL.createObjectURL(file);
              } else {
                previewUrl = URL.createObjectURL(file);
              }
            } else {
              previewUrl = URL.createObjectURL(file);
            }
            resolve({
              data: result,
              preview: previewUrl,
              type: 'file',
              name,
              mime: file.type,
            });
          };
          reader.readAsDataURL(file);
        }),
      );
    }

    const newFiles = await Promise.all(filesList);
    setUploadedFiles(newUploadedFiles);
    setPreviews((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = async (event: FileEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    await appendFilesFromInput(files);
  };

  const handleDrag = (e: DragEvent) => {
    if (uploadsConfig()?.isImageUploadAllowed || isFileUploadAllowed()) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragActive(true);
      } else if (e.type === 'dragleave') {
        setIsDragActive(false);
      }
    }
  };

  const handleDrop = async (e: InputEvent | DragEvent) => {
    if (!uploadsConfig()?.isImageUploadAllowed && !isFileUploadAllowed()) {
      return;
    }
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer?.files.length) {
      await appendFilesFromInput(Array.from(e.dataTransfer.files), true);
    }

    if (e.dataTransfer?.items) {
      for (const item of e.dataTransfer.items) {
        if (item.kind === 'string' && item.type.match('^text/uri-list')) {
          item.getAsString((s: string) => {
            setPreviews((prev) => [
              ...prev,
              {
                data: s,
                preview: s,
                type: 'url',
                name: s.substring(s.lastIndexOf('/') + 1),
                mime: '',
              },
            ]);
          });
        } else if (item.kind === 'string' && item.type.match('^text/html')) {
          item.getAsString((s: string) => {
            if (s.indexOf('href') === -1) return;
            const start = s.substring(s.indexOf('href') + 6);
            const hrefStr = start.substring(0, start.indexOf('"'));
            setPreviews((prev) => [
              ...prev,
              {
                data: hrefStr,
                preview: hrefStr,
                type: 'url',
                name: hrefStr.substring(hrefStr.lastIndexOf('/') + 1),
                mime: '',
              },
            ]);
          });
        }
      }
    }
  };

  const handleDeletePreview = (itemToDelete: FilePreview) => {
    if (itemToDelete.type === 'file') {
      URL.revokeObjectURL(itemToDelete.preview);
    }
    setPreviews(previews().filter((item) => item !== itemToDelete));
  };

  const addRecordingToPreviews = (blob: Blob) => {
    let mimeType = blob.type;
    const pos = blob.type.indexOf(';');
    if (pos !== -1) {
      mimeType = blob.type.substring(0, pos);
    }

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as FilePreview['data'];
      setPreviews((prev) => [
        ...prev,
        {
          data: base64data,
          preview: '../assets/wave-sound.jpg',
          type: 'audio',
          name: `audio_${Date.now()}.wav`,
          mime: mimeType,
        },
      ]);
    };
  };

  return {
    previews,
    setPreviews,
    isDragActive,
    uploadedFiles,
    setUploadedFiles,
    clearPreviews,
    handleFileChange,
    handleDrag,
    handleDrop,
    handleDeletePreview,
    addRecordingToPreviews,
    isFileUploadAllowed,
  };
};
