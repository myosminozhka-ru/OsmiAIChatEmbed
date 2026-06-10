import { For, Show } from 'solid-js';
import { Avatar } from '../avatars/Avatar';
import { Marked } from '@ts-stack/markdown';
import { FileUpload, MessageType } from '../Bot';
import { AttachmentIcon } from '../icons';
import { AudioWaveformPlayer } from '../AudioWaveformPlayer';
import { DateTimeToggleTheme } from '@/features/bubble/types';
import { MessageImage } from './MessageImage';

type Props = {
  message: MessageType;
  apiHost?: string;
  chatflowid: string;
  chatId: string;
  showAvatar?: boolean;
  avatarSrc?: string;
  fontSize?: number;
  renderHTML?: boolean;
  dateTime?: string;
  dateTimeToggle?: DateTimeToggleTheme;
};

const defaultFontSize = 16;

const formatDateTime = (dateTimeString: string | undefined, showDate: boolean | undefined, showTime: boolean | undefined) => {
  if (!dateTimeString) return '';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return '';
    const showDateVal = showDate === true;
    const showTimeVal = showTime !== false;
    let formatted = '';
    if (showDateVal) {
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const [{ value: month }, , { value: day }, , { value: year }] = dateFormatter.formatToParts(date);
      formatted = `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}, ${year}`;
    }
    if (showTimeVal) {
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const timeString = timeFormatter.format(date);
      formatted = formatted ? `${formatted}, ${timeString}` : timeString;
    }
    return formatted;
  } catch {
    return '';
  }
};

export const GuestBubble = (props: Props) => {
  Marked.setOptions({ isNoP: true, sanitize: props.renderHTML !== undefined ? !props.renderHTML : true });

  const setUserMessageRef = (el: HTMLSpanElement) => {
    if (el) {
      el.innerHTML = Marked.parse(props.message.message);
      el.querySelectorAll('a').forEach((link) => {
        link.target = '_blank';
      });
    }
  };

  const getImageUploadSrc = (item: Partial<FileUpload>) => {
    const fileData = `${props.apiHost}/api/v1/get-upload-file?chatflowId=${props.chatflowid}&chatId=${props.chatId}&fileName=${item.name}`;
    return (item.data as string) ?? fileData;
  };

  const imageUploads = () => props.message.fileUploads?.filter((item) => item?.mime?.startsWith('image/')) ?? [];
  const nonImageUploads = () => props.message.fileUploads?.filter((item) => !item?.mime?.startsWith('image/')) ?? [];
  const hasImageMessage = () => imageUploads().length > 0;

  const renderNonImageUpload = (item: Partial<FileUpload>) => {
    if (item?.mime?.startsWith('audio/')) {
      const fileData = `${props.apiHost}/api/v1/get-upload-file?chatflowId=${props.chatflowid}&chatId=${props.chatId}&fileName=${item.name}`;
      const src = (item.data as string) ?? fileData;
      return <AudioWaveformPlayer src={src} mime={item.mime} />;
    }

    return (
      <div class="inline-flex items-center h-12 max-w-max p-2 mr-1 flex-none bg-transparent border border-gray-300 rounded-md">
        <AttachmentIcon />
        <span class="ml-1.5 text-inherit">{item.name}</span>
      </div>
    );
  };

  const formattedTime = () => (props.dateTime ? formatDateTime(props.dateTime, props.dateTimeToggle?.date, props.dateTimeToggle?.time) : '');

  return (
    <div class="flex flex-col mb-2 items-end guest-container mt-7" style={{ 'margin-left': '50px' }}>
      <Show
        when={hasImageMessage()}
        fallback={
          <>
            <Show when={formattedTime()}>
              <span class="text-[12px] text-gray-500 mb-1">{formattedTime()}</span>
            </Show>
            <div class="flex justify-end items-end">
              <div
                class="max-w-full flex flex-col justify-center items-start chatbot-guest-bubble px-4 py-2 gap-2"
                data-testid="guest-bubble"
                style={{ 'border-radius': '16px' }}
              >
                {nonImageUploads().length > 0 && (
                  <div class="flex flex-col items-start flex-wrap w-full gap-2">
                    <For each={nonImageUploads()}>{(item) => renderNonImageUpload(item)}</For>
                  </div>
                )}
                {props.message.message && (
                  <span
                    ref={setUserMessageRef}
                    class="whitespace-pre-wrap"
                    style={{ 'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px` }}
                  />
                )}
              </div>
              <Show when={props.showAvatar}>
                <Avatar initialAvatarSrc={props.avatarSrc} />
              </Show>
            </div>
          </>
        }
      >
        <div class="flex justify-end items-end">
          <div class="flex flex-col items-end max-w-[487px] w-full gap-2">
            <Show when={formattedTime()}>
              <span class="text-[12px] text-gray-500">{formattedTime()}</span>
            </Show>
            <For each={imageUploads()}>{(item) => <MessageImage src={getImageUploadSrc(item)} />}</For>
            {props.message.message && (
              <span
                ref={setUserMessageRef}
                class="whitespace-pre-wrap"
                style={{
                  color: 'var(--chatbot-guest-bubble-color)',
                  'font-size': props.fontSize ? `${props.fontSize}px` : `${defaultFontSize}px`,
                }}
              />
            )}
            {nonImageUploads().length > 0 && (
              <div class="flex flex-col items-end flex-wrap w-full gap-2">
                <For each={nonImageUploads()}>{(item) => renderNonImageUpload(item)}</For>
              </div>
            )}
          </div>
          <Show when={props.showAvatar}>
            <Avatar initialAvatarSrc={props.avatarSrc} />
          </Show>
        </div>
      </Show>
    </div>
  );
};
