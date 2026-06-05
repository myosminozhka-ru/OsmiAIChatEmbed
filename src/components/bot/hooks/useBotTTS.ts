import { Accessor, Setter, createEffect, createSignal, onCleanup } from 'solid-js';
import { cloneDeep } from 'lodash';
import { abortTTSQuery, generateTTSQuery } from '@/queries/sendMessageQuery';
import { BotProps, MessageType } from '../types';

export type TtsStreamingState = {
  mediaSource: MediaSource | null;
  sourceBuffer: SourceBuffer | null;
  audio: HTMLAudioElement | null;
  chunkQueue: Uint8Array[];
  isBuffering: boolean;
  audioFormat: string | null;
  abortController: AbortController | null;
};

export type UseBotTTSOptions = {
  props: BotProps;
  chatId: Accessor<string>;
  setMessages: Setter<MessageType[]>;
  setTTSAction: (isActive: boolean) => void;
};

export const useBotTTS = (options: UseBotTTSOptions) => {
  const { props, chatId, setMessages } = options;

  const [isTTSLoading, setIsTTSLoading] = createSignal<Record<string, boolean>>({});
  const [isTTSPlaying, setIsTTSPlaying] = createSignal<Record<string, boolean>>({});
  const [ttsAudio, setTtsAudio] = createSignal<Record<string, HTMLAudioElement>>({});
  const [isTTSEnabled, setIsTTSEnabled] = createSignal(false);
  const [ttsStreamingState, setTtsStreamingState] = createSignal<TtsStreamingState>({
    mediaSource: null,
    sourceBuffer: null,
    audio: null,
    chunkQueue: [],
    isBuffering: false,
    audioFormat: null,
    abortController: null,
  });

  let currentSourceBuffer: SourceBuffer | null = null;
  let updateEndHandler: (() => void) | null = null;

  const processChunkQueue = () => {
    const currentState = ttsStreamingState();
    if (!currentState.sourceBuffer || currentState.sourceBuffer.updating || currentState.chunkQueue.length === 0) {
      return;
    }

    const chunk = currentState.chunkQueue[0];
    if (!chunk) return;

    try {
      currentState.sourceBuffer.appendBuffer(chunk);
      setTtsStreamingState((prevState) => ({
        ...prevState,
        chunkQueue: prevState.chunkQueue.slice(1),
        isBuffering: true,
      }));
    } catch (error) {
      console.error('Error appending chunk to buffer:', error);
    }
  };

  const handleTTSStart = (data: { chatMessageId: string; format: string }) => {
    options.setTTSAction(true);

    // Ensure complete cleanup before starting new TTS
    stopAllTTS();

    setIsTTSLoading((prevState) => ({
      ...prevState,
      [data.chatMessageId]: true,
    }));

    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];
      const lastMessage = allMessages[allMessages.length - 1];
      if (lastMessage.type === 'userMessage') return allMessages;
      const existingId = lastMessage.id || lastMessage.messageId;
      if (!existingId) {
        allMessages[allMessages.length - 1].id = data.chatMessageId;
      } else if (!lastMessage.id) {
        allMessages[allMessages.length - 1].id = existingId;
      }
      return allMessages;
    });

    setTtsStreamingState({
      mediaSource: null,
      sourceBuffer: null,
      audio: null,
      chunkQueue: [],
      isBuffering: false,
      audioFormat: data.format,
      abortController: null,
    });

    setTimeout(() => initializeTTSStreaming(data), 100);
  };

  const handleTTSDataChunk = (base64Data: string) => {
    try {
      const audioBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      setTtsStreamingState((prevState) => {
        const newState = {
          ...prevState,
          chunkQueue: [...prevState.chunkQueue, audioBuffer],
        };

        // Schedule processing after state update
        if (prevState.sourceBuffer && !prevState.sourceBuffer.updating) {
          setTimeout(() => processChunkQueue(), 0);
        }

        return newState;
      });
    } catch (error) {
      console.error('Error handling TTS data chunk:', error);
    }
  };

  const handleTTSEnd = () => {
    const currentState = ttsStreamingState();
    if (currentState.mediaSource && currentState.mediaSource.readyState === 'open') {
      try {
        // Process any remaining chunks first
        if (currentState.sourceBuffer && currentState.chunkQueue.length > 0 && !currentState.sourceBuffer.updating) {
          const remainingChunks = [...currentState.chunkQueue];
          remainingChunks.forEach((chunk, index) => {
            setTimeout(() => {
              const state = ttsStreamingState();
              if (state.sourceBuffer && !state.sourceBuffer.updating) {
                try {
                  state.sourceBuffer.appendBuffer(chunk);
                  if (index === remainingChunks.length - 1) {
                    setTimeout(() => {
                      const finalState = ttsStreamingState();
                      if (finalState.mediaSource && finalState.mediaSource.readyState === 'open') {
                        finalState.mediaSource.endOfStream();
                      }
                    }, 100);
                  }
                } catch (error) {
                  console.error('Error appending remaining chunk:', error);
                }
              }
            }, index * 50);
          });

          setTtsStreamingState((prevState) => ({
            ...prevState,
            chunkQueue: [],
          }));
        } else if (currentState.sourceBuffer && !currentState.sourceBuffer.updating) {
          currentState.mediaSource.endOfStream();
        } else if (currentState.sourceBuffer) {
          const handleFinalUpdateEnd = () => {
            const finalState = ttsStreamingState();
            if (finalState.mediaSource && finalState.mediaSource.readyState === 'open') {
              finalState.mediaSource.endOfStream();
            }
          };
          currentState.sourceBuffer.addEventListener('updateend', handleFinalUpdateEnd, { once: true });
        }
      } catch (error) {
        console.error('Error ending TTS stream:', error);
      }
    }
  };

  const initializeTTSStreaming = (data: { chatMessageId: string; format: string }) => {
    try {
      const mediaSource = new MediaSource();
      const audio = new Audio();

      // Pre-configure audio element
      audio.preload = 'none';
      audio.autoplay = false;

      audio.src = URL.createObjectURL(mediaSource);

      const sourceOpenHandler = () => {
        try {
          const mimeType = data.format === 'mp3' ? 'audio/mpeg' : 'audio/mpeg';

          // Check if MediaSource supports the MIME type
          if (!MediaSource.isTypeSupported(mimeType)) {
            console.error('MediaSource does not support MIME type:', mimeType);
            return;
          }

          const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

          setTtsStreamingState((prevState) => ({
            ...prevState,
            mediaSource,
            sourceBuffer,
            audio,
          }));

          // Start audio playback
          audio.play().catch((playError) => {
            console.error('Error starting audio playback:', playError);
            // Cleanup on play error
            cleanupTTSStreaming();
          });
        } catch (error) {
          console.error('Error setting up source buffer:', error);
          console.error('MediaSource readyState:', mediaSource.readyState);
          // Cleanup on error
          cleanupTTSStreaming();
        }
      };

      const playingHandler = () => {
        setIsTTSLoading((prevState) => {
          const newState = { ...prevState };
          delete newState[data.chatMessageId];
          return newState;
        });
        setIsTTSPlaying((prevState) => ({
          ...prevState,
          [data.chatMessageId]: true,
        }));
      };

      const endedHandler = () => {
        setIsTTSPlaying((prevState) => {
          const newState = { ...prevState };
          delete newState[data.chatMessageId];
          return newState;
        });
        cleanupTTSStreaming();
      };

      const errorHandler = (event: Event) => {
        console.error('Audio error during TTS playback:', event);
        setIsTTSLoading((prev) => {
          const newState = { ...prev };
          delete newState[data.chatMessageId];
          return newState;
        });
        setIsTTSPlaying((prev) => {
          const newState = { ...prev };
          delete newState[data.chatMessageId];
          return newState;
        });
        cleanupTTSStreaming();
      };

      mediaSource.addEventListener('sourceopen', sourceOpenHandler);
      audio.addEventListener('playing', playingHandler);
      audio.addEventListener('ended', endedHandler);
      audio.addEventListener('error', errorHandler);
    } catch (error) {
      console.error('Error initializing TTS streaming:', error);
      // Ensure cleanup on initialization error
      setIsTTSLoading((prev) => {
        const newState = { ...prev };
        delete newState[data.chatMessageId];
        return newState;
      });
    }
  };

  const cleanupTTSStreaming = () => {
    const currentState = ttsStreamingState();

    if (currentState.abortController) {
      currentState.abortController.abort();
    }

    if (currentState.audio) {
      currentState.audio.pause();
      currentState.audio.currentTime = 0;
      currentState.audio.removeAttribute('src');
      currentState.audio.load(); // Force reload to clear buffer
      if (currentState.audio.src) {
        URL.revokeObjectURL(currentState.audio.src);
      }
      // Remove all event listeners
      currentState.audio.removeEventListener('playing', () => console.log('Playing'));
      currentState.audio.removeEventListener('ended', () => console.log('Ended'));
    }

    if (currentState.sourceBuffer) {
      // Clear any pending data in the source buffer
      if (currentState.sourceBuffer.updating) {
        try {
          currentState.sourceBuffer.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }

      // Remove buffered data if possible
      try {
        if (currentState.sourceBuffer.buffered.length > 0) {
          const start = currentState.sourceBuffer.buffered.start(0);
          const end = currentState.sourceBuffer.buffered.end(currentState.sourceBuffer.buffered.length - 1);
          currentState.sourceBuffer.remove(start, end);
        }
      } catch (e) {
        // Ignore remove errors during cleanup
      }

      // Remove update listeners
      if (currentState.sourceBuffer.onupdateend) {
        currentState.sourceBuffer.removeEventListener('updateend', currentState.sourceBuffer.onupdateend);
        currentState.sourceBuffer.onupdateend = null;
      }
    }

    if (currentState.mediaSource) {
      if (currentState.mediaSource.readyState === 'open') {
        try {
          // Remove source buffers before ending stream
          if (currentState.sourceBuffer && currentState.mediaSource.sourceBuffers.length > 0) {
            currentState.mediaSource.removeSourceBuffer(currentState.sourceBuffer);
          }
          currentState.mediaSource.endOfStream();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      // Remove source open event listeners
      currentState.mediaSource.removeEventListener('sourceopen', () => console.log('removed source open event listener'));
    }

    setTtsStreamingState({
      mediaSource: null,
      sourceBuffer: null,
      audio: null,
      chunkQueue: [],
      isBuffering: false,
      audioFormat: null,
      abortController: null,
    });
  };

  const cleanupTTSForMessage = (messageId: string) => {
    const audioElements = ttsAudio();
    if (audioElements[messageId]) {
      audioElements[messageId].pause();
      audioElements[messageId].currentTime = 0;
      // Force cleanup of audio element
      audioElements[messageId].src = '';
      audioElements[messageId].load();
      setTtsAudio((prev) => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
    }

    // Always cleanup streaming state when stopping any TTS
    const streamingState = ttsStreamingState();
    if (streamingState.audio || streamingState.mediaSource || streamingState.sourceBuffer) {
      cleanupTTSStreaming();
    }

    setIsTTSPlaying((prev) => {
      const newState = { ...prev };
      delete newState[messageId];
      return newState;
    });

    setIsTTSLoading((prev) => {
      const newState = { ...prev };
      delete newState[messageId];
      return newState;
    });
  };

  const handleTTSStop = async (messageId: string) => {
    options.setTTSAction(true);

    // Abort TTS request if active
    try {
      await abortTTSQuery({
        apiHost: props.apiHost,
        body: {
          chatflowId: props.chatflowid,
          chatId: chatId(),
          chatMessageId: messageId,
        },
        onRequest: props.onRequest,
      });
    } catch (error) {
      console.warn(`Error aborting TTS for message ${messageId}:`, error);
    }

    cleanupTTSForMessage(messageId);
  };

  const stopAllTTS = () => {
    const audioElements = ttsAudio();
    Object.keys(audioElements).forEach((messageId) => {
      if (audioElements[messageId]) {
        audioElements[messageId].pause();
        audioElements[messageId].currentTime = 0;
        // Force cleanup of each audio element
        audioElements[messageId].src = '';
        audioElements[messageId].load();
      }
    });
    setTtsAudio({});

    const streamingState = ttsStreamingState();
    if (streamingState.abortController) {
      streamingState.abortController.abort();
    }

    // Always cleanup streaming state
    cleanupTTSStreaming();

    setIsTTSPlaying({});
    setIsTTSLoading({});
  };

  const handleTTSAbortAll = async () => {
    const activeTTSMessages = Object.keys(isTTSLoading()).concat(Object.keys(isTTSPlaying()));
    for (const messageId of activeTTSMessages) {
      try {
        await abortTTSQuery({
          apiHost: props.apiHost,
          body: {
            chatflowId: props.chatflowid,
            chatId: chatId(),
            chatMessageId: messageId,
          },
          onRequest: props.onRequest,
        });
      } catch (error) {
        console.warn(`Error aborting TTS for message ${messageId}:`, error);
      }
    }
  };

  const handleTTSClick = async (messageId: string, messageText: string) => {
    const loadingState = isTTSLoading();
    if (loadingState[messageId]) return;

    const playingState = isTTSPlaying();
    const audioElement = ttsAudio()[messageId];
    if (playingState[messageId] || audioElement) {
      await handleTTSStop(messageId);
      return;
    }

    options.setTTSAction(true);

    // Ensure complete cleanup before starting new TTS
    await handleTTSAbortAll();
    stopAllTTS();

    handleTTSStart({ chatMessageId: messageId, format: 'mp3' });

    try {
      const abortController = new AbortController();
      setTtsStreamingState((prev) => ({ ...prev, abortController }));

      const response = await generateTTSQuery({
        apiHost: props.apiHost,
        body: {
          chatId: chatId(),
          chatflowId: props.chatflowid,
          chatMessageId: messageId,
          text: messageText,
        },
        onRequest: props.onRequest,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        let done = false;
        while (!done) {
          if (abortController.signal.aborted) {
            break;
          }

          const result = await reader.read();
          done = result.done;
          if (done) break;

          const value = result.value;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const eventData = line.slice(6);
                if (eventData === '[DONE]') break;

                const event = JSON.parse(eventData);
                switch (event.event) {
                  case 'tts_start':
                    break;
                  case 'tts_data':
                    if (!abortController.signal.aborted) {
                      handleTTSDataChunk(event.data.audioChunk);
                    }
                    break;
                  case 'tts_end':
                    if (!abortController.signal.aborted) {
                      handleTTSEnd();
                    }
                    break;
                }
              } catch (parseError) {
                console.error('Error parsing SSE event:', parseError);
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        cleanupTTSForMessage(messageId);
      } else {
        console.error('Error with TTS:', error);
        // Show error feedback to user
        setIsTTSLoading((prev) => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
        setIsTTSPlaying((prev) => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
        cleanupTTSForMessage(messageId);
      }
    } finally {
      setIsTTSLoading((prev) => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
    }
  };

  const handleTTSAbort = (data: { chatMessageId: string }) => {
    const messageId = data.chatMessageId;
    cleanupTTSForMessage(messageId);
  };

  createEffect(() => {
    const streamingState = ttsStreamingState();
    if (currentSourceBuffer && currentSourceBuffer !== streamingState.sourceBuffer && updateEndHandler) {
      currentSourceBuffer.removeEventListener('updateend', updateEndHandler);
      currentSourceBuffer = null;
      updateEndHandler = null;
    }
    if (streamingState.sourceBuffer && streamingState.sourceBuffer !== currentSourceBuffer) {
      const sourceBuffer = streamingState.sourceBuffer;
      currentSourceBuffer = sourceBuffer;
      updateEndHandler = () => {
        setTtsStreamingState((prevState) => ({ ...prevState, isBuffering: false }));
        setTimeout(() => processChunkQueue(), 0);
      };
      sourceBuffer.addEventListener('updateend', updateEndHandler);
    }
  });

  onCleanup(() => {
    cleanupTTSStreaming();
  });

  return {
    isTTSLoading,
    isTTSPlaying,
    ttsAudio,
    isTTSEnabled,
    setIsTTSEnabled,
    handleTTSStart,
    handleTTSDataChunk,
    handleTTSEnd,
    handleTTSAbort,
    handleTTSClick,
    handleTTSStop,
    stopAllTTS,
  };
};
