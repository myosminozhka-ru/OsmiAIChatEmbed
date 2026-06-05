import { JSX } from 'solid-js/jsx-runtime';

const defaultButtonColor = 'currentColor';

type ClipboardIconProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  filled?: boolean;
};

export const ClipboardIcon = (props: ClipboardIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon icon-tabler icon-tabler-refresh w-4 h-4"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill={props.filled ? props.color ?? defaultButtonColor : 'none'}
    stroke={props.color ?? defaultButtonColor}
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12.6665 6H10.7998C10.0531 6 9.67942 5.99998 9.39421 5.85466C9.14332 5.72682 8.9395 5.52286 8.81167 5.27198C8.66634 4.98676 8.66634 4.6134 8.66634 3.86667V2M12.6663 11.8667V6.217C12.6663 5.89088 12.6661 5.72779 12.6292 5.57434C12.5966 5.43829 12.5428 5.30825 12.4697 5.18896C12.3872 5.0544 12.2723 4.9391 12.0417 4.70849L9.95801 2.62484C9.72741 2.39424 9.61209 2.27895 9.47754 2.19649C9.35824 2.12339 9.22822 2.0695 9.09218 2.03684C8.93873 2 8.7756 2 8.44948 2H5.46647C4.71973 2 4.34609 2 4.06087 2.14532C3.80999 2.27316 3.60616 2.47714 3.47833 2.72803C3.33301 3.01324 3.33301 3.3866 3.33301 4.13334V11.8667C3.33301 12.6134 3.33301 12.9868 3.47833 13.272C3.60616 13.5229 3.80999 13.7268 4.06087 13.8547C4.34609 14 4.71973 14 5.46647 14H10.5331C11.2799 14 11.653 14 11.9382 13.8547C12.1891 13.7268 12.3933 13.5229 12.5212 13.272C12.6665 12.9868 12.6663 12.6134 12.6663 11.8667Z" />
  </svg>
);
