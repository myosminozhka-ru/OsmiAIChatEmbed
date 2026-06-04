import { BotProps } from '../types';
import { DEFAULT_RECEIVE_SOUND } from '../constants';

export const createReceiveSoundPlayer = (props: BotProps) => {
  let audioRef: HTMLAudioElement | undefined;

  return () => {
    if (!props.textInput?.receiveMessageSound) return;
    let audioSrc = DEFAULT_RECEIVE_SOUND;
    if (props.textInput?.receiveSoundLocation) {
      audioSrc = props.textInput.receiveSoundLocation;
    }
    audioRef = new Audio(audioSrc);
    audioRef.play();
  };
};
