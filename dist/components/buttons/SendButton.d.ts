import { JSX } from 'solid-js/jsx-runtime';
type SendButtonProps = {
    isDisabled?: boolean;
    isLoading?: boolean;
    disableIcon?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const SendButton: (props: SendButtonProps) => JSX.Element;
export { DeleteButton } from './DeleteButton';
export declare const Spinner: (props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element;
//# sourceMappingURL=SendButton.d.ts.map