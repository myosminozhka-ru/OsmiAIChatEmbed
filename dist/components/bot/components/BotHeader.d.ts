import { BotProps } from '../types';
export type BotHeaderProps = {
    props: BotProps;
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
    onClearChat?: () => void;
};
export declare const BotHeader: (headerProps: BotHeaderProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=BotHeader.d.ts.map