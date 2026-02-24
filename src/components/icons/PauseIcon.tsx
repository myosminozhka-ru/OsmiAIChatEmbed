import { JSX } from 'solid-js/jsx-runtime';
const defaultButtonColor = '#3B81F6';

export const PauseIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={props.color ?? defaultButtonColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M17.3333 13.5999V4.73328V4.72943C17.3333 3.42521 17.3333 2.77269 17.0793 2.27405C16.8556 1.835 16.4981 1.47802 16.0591 1.25432C15.56 1 14.907 1 13.6002 1H4.73356C3.42677 1 2.77289 1 2.27376 1.25432C1.83472 1.47802 1.47802 1.835 1.25432 2.27405C1 2.77318 1 3.42649 1 4.73328V13.5999C1 14.9067 1 15.5602 1.25432 16.0594C1.47802 16.4984 1.83472 16.8553 2.27376 17.079C2.77289 17.3333 3.42677 17.3333 4.73356 17.3333H13.6002C14.907 17.3333 15.56 17.3333 16.0591 17.079C16.4981 16.8553 16.8556 16.4984 17.0793 16.0594C17.3333 15.5607 17.3333 14.908 17.3333 13.6038V13.5999Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
)