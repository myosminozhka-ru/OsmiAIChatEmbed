import { For } from 'solid-js';
import { GuestBubble } from '@/components/bubbles/GuestBubble';
import { BotBubble } from '@/components/bubbles/BotBubble';
import { LoadingBubble } from '@/components/bubbles/LoadingBubble';
import { LeadCaptureBubble } from '@/components/bubbles/LeadCaptureBubble';
import { getLocalStorageChatflow } from '@/utils';
import { BotProps, IAction, LeadsConfig, MessageType } from '../types';
import { DEFAULT_WELCOME_MESSAGE } from '../constants';

export type BotMessageListProps = {
  props: BotProps;
  messages: MessageType[];
  chatId: string;
  loading: boolean;
  chatFeedbackStatus: boolean;
  leadsConfig?: LeadsConfig;
  isLeadSaved: boolean;
  setIsLeadSaved: (value: boolean) => void;
  setLeadEmail: (value: string) => void;
  starterPrompts: string[];
  isTTSEnabled: boolean;
  isTTSLoading: Record<string, boolean>;
  isTTSPlaying: Record<string, boolean>;
  handleTTSClick: (messageId: string, messageText: string) => void;
  handleTTSStop: (messageId: string) => void;
  handleActionClick: (elem: any, action: IAction | undefined | null) => void;
  onStarterPromptClick: (prompt: string) => void;
  onSourceDocumentsClick: (sourceDocuments: any) => void;
};

export const BotMessageList = (listProps: BotMessageListProps) => {
  const { props } = listProps;

  return (
    <For each={[...listProps.messages]}>
      {(message, index) => (
        <>
          {message.type === 'userMessage' && (
            <GuestBubble
              message={message}
              apiHost={props.apiHost}
              chatflowid={props.chatflowid}
              chatId={listProps.chatId}
              showAvatar={props.userMessage?.showAvatar}
              avatarSrc={props.userMessage?.avatarSrc}
              fontSize={props.fontSize}
              renderHTML={props.renderHTML}
              dateTime={message.dateTime}
              dateTimeToggle={props.dateTimeToggle}
            />
          )}
          {message.type === 'apiMessage' && (
            <BotBubble
              message={message}
              fileAnnotations={message.fileAnnotations}
              chatflowid={props.chatflowid}
              chatId={listProps.chatId}
              apiHost={props.apiHost}
              showAvatar={props.botMessage?.showAvatar}
              avatarSrc={props.botMessage?.avatarSrc}
              chatFeedbackStatus={listProps.chatFeedbackStatus}
              fontSize={props.fontSize}
              isLoading={listProps.loading && index() === listProps.messages.length - 1}
              showAgentMessages={props.showAgentMessages}
              handleActionClick={listProps.handleActionClick}
              sourceDocsTitle={props.sourceDocsTitle}
              handleSourceDocumentsClick={listProps.onSourceDocumentsClick}
              dateTimeToggle={props.dateTimeToggle}
              renderHTML={props.renderHTML}
              isTTSEnabled={listProps.isTTSEnabled}
              isTTSLoading={listProps.isTTSLoading}
              isTTSPlaying={listProps.isTTSPlaying}
              handleTTSClick={listProps.handleTTSClick}
              handleTTSStop={listProps.handleTTSStop}
              starterPrompts={index() === 0 && listProps.messages.length === 1 ? listProps.starterPrompts : []}
              starterPromptFontSize={props.starterPromptFontSize}
              onStarterPromptClick={listProps.onStarterPromptClick}
              showFeedback={!(index() === 0 && message.message === (props.welcomeMessage ?? DEFAULT_WELCOME_MESSAGE))}
            />
          )}
          {message.type === 'leadCaptureMessage' && listProps.leadsConfig?.status && !getLocalStorageChatflow(props.chatflowid)?.lead && (
            <LeadCaptureBubble
              message={message}
              chatflowid={props.chatflowid}
              chatId={listProps.chatId}
              apiHost={props.apiHost}
              fontSize={props.fontSize}
              showAvatar={props.botMessage?.showAvatar}
              avatarSrc={props.botMessage?.avatarSrc}
              leadsConfig={listProps.leadsConfig}
              isLeadSaved={listProps.isLeadSaved}
              setIsLeadSaved={listProps.setIsLeadSaved}
              setLeadEmail={listProps.setLeadEmail}
            />
          )}
          {message.type === 'userMessage' && listProps.loading && index() === listProps.messages.length - 1 && (
            <LoadingBubble showAvatar={props.botMessage?.showAvatar} avatarSrc={props.botMessage?.avatarSrc} />
          )}
          {message.type === 'apiMessage' && message.message === '' && listProps.loading && index() === listProps.messages.length - 1 && (
            <LoadingBubble showAvatar={props.botMessage?.showAvatar} avatarSrc={props.botMessage?.avatarSrc} />
          )}
        </>
      )}
    </For>
  );
};
