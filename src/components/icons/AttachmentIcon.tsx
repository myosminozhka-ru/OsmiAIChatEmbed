import { JSX } from 'solid-js/jsx-runtime';
const defaultButtonColor = 'currentColor';
export const AttachmentIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke-width="2"
    stroke={props.color ?? defaultButtonColor}
    stroke-linecap="round"
    stroke-linejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 10H15M10 15L10 5" />
  </svg>
);
