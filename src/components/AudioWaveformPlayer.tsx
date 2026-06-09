import { Show, createSignal, onCleanup, onMount } from 'solid-js';
import WaveSurfer from 'wavesurfer.js';
import { PlayIcon, PauseBarsIcon } from './icons';
import { formatAudioTime } from '@/utils/formatAudioTime';
import { getCssVar } from '@/theme/cssVar';

type Props = {
  src: string;
  mime?: string;
  class?: string;
};

export const AudioWaveformPlayer = (props: Props) => {
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);

  let wrapperRef: HTMLDivElement | undefined;
  let waveformRef: HTMLDivElement | undefined;
  let wavesurfer: WaveSurfer | null = null;

  onMount(() => {
    if (!wrapperRef || !waveformRef) return;

    const waveColor = getCssVar(wrapperRef, '--chatbot-input-placeholder-color');
    const progressColor = getCssVar(wrapperRef, '--chatbot-header-color');

    wavesurfer = WaveSurfer.create({
      container: waveformRef,
      url: props.src,
      waveColor,
      progressColor,
      cursorWidth: 0,
      height: 32,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      fillParent: true,
      interact: true,
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('finish', () => setIsPlaying(false));
    wavesurfer.on('timeupdate', (time) => setCurrentTime(time));
    wavesurfer.on('ready', (dur) => setDuration(dur));
    wavesurfer.on('decode', (dur) => setDuration(dur));
  });

  onCleanup(() => {
    wavesurfer?.destroy();
    wavesurfer = null;
  });

  const handlePlayPause = () => {
    wavesurfer?.playPause();
  };

  return (
    <div
      ref={wrapperRef}
      class={`grid min-w-[269px] w-full gap-x-2 gap-y-1 ${props.class ?? ''}`}
      style={{
        color: 'inherit',
        'grid-template-columns': 'auto 1fr',
        'grid-template-rows': 'auto auto',
      }}
    >
      <button
        type="button"
        class="flex items-center justify-center w-10 self-stretch bg-transparent border-none cursor-pointer p-0"
        style={{ 'grid-row': '1 / 3' }}
        onClick={handlePlayPause}
        aria-label={isPlaying() ? 'Pause' : 'Play'}
      >
        <Show when={isPlaying()} fallback={<PlayIcon class="w-6 h-6" />}>
          <PauseBarsIcon class="w-6 h-6" />
        </Show>
      </button>
      <div ref={waveformRef} style={{ 'grid-column': '2', 'grid-row': '1' }} />
      <span class="text-sm tabular-nums opacity-80" style={{ 'grid-column': '2', 'grid-row': '2' }}>
        {formatAudioTime(currentTime())}/{formatAudioTime(duration())}
      </span>
    </div>
  );
};
