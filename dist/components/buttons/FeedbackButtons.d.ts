import { JSX } from 'solid-js';
type RatingButtonProps = {
    filled?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    disableIcon?: boolean;
    rating?: string;
    activeVariant?: 'positive' | 'negative' | 'default' | 'copied';
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export declare const CopyToClipboardButton: (props: RatingButtonProps) => JSX.Element;
export declare const ThumbsUpButton: (props: RatingButtonProps) => JSX.Element;
export declare const ThumbsDownButton: (props: RatingButtonProps) => JSX.Element;
export {};
//# sourceMappingURL=FeedbackButtons.d.ts.map