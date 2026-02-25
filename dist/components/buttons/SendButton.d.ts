import { JSX } from 'solid-js/jsx-runtime';
type SendButtonProps = {
    sendButtonColor?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    disableIcon?: boolean;
    active?: boolean;
    /** When set and isLoading is true, button shows Pause icon and calls onStop on click (stop generation) */
    onStop?: () => void;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const SendButton: (props: SendButtonProps) => JSX.Element;
export declare const Spinner: (props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element;
export {};
//# sourceMappingURL=SendButton.d.ts.map