import { JSX } from 'solid-js/jsx-runtime';

const defaultButtonColor = 'currentColor';

export const PlayIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill={props.color ?? defaultButtonColor} {...props}>
    <path
      d="m5.5 22c0 9.11 7.39 16.5 16.5 16.5s16.5-7.39 16.5-16.5-7.39-16.5-16.5-16.5-16.5 7.39-16.5 16.5z"
      stroke="#fff"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      style={{ fill: 'none', stroke: '#fff' }}
    />
    <path
      transform="matrix(.784 0 0 .813 6.54 7.36)"
      d="m26.6 18.2-11.6 6.67v-6.67-6.67l5.78 3.33z"
      style={{ fill: 'none', 'stroke-linejoin': 'round', 'stroke-width': '2.5', stroke: '#fff' }}
    />
  </svg>
);
