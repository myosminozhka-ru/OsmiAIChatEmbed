import { FooterTheme } from '@/features/bubble/types';
import { Show, onCleanup, onMount } from 'solid-js';

type Props = {
  footer?: FooterTheme;
  botContainer: HTMLDivElement | undefined;
};

export const Badge = (props: Props) => {
  let liteBadge: HTMLAnchorElement | undefined;
  let observer: MutationObserver | undefined;

  const appendBadgeIfNecessary = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if ('id' in removedNode && liteBadge && removedNode.id == 'lite-badge') {
          console.log("Sorry, you can't remove the brand 😅");
          props.botContainer?.append(liteBadge);
        }
      });
    });
  };

  onMount(() => {
    if (!document || !props.botContainer) return;
    observer = new MutationObserver(appendBadgeIfNecessary);
    observer.observe(props.botContainer, {
      subtree: false,
      childList: true,
    });
  });

  onCleanup(() => {
    if (observer) observer.disconnect();
  });

  return (
    <>
      <Show when={props.footer?.showFooter === undefined || props.footer?.showFooter === null || props.footer?.showFooter === true}>
        <span class="chatbot-badge chatbot-footer-text hidden md:block w-full text-center px-[10px] pt-[6px] pb-[10px] m-auto font-normal text-[12px]">
          <a
            ref={liteBadge}
            href={'https://osmi-it.ru/'}
            target="_blank"
            rel="noopener noreferrer"
            class="lite-badge chatbot-footer-text"
            id="lite-badge"
          >
            <span>Разработано OSMI</span>
          </a>
        </span>
      </Show>
      <Show when={props.footer?.showFooter === false}>
        <span class="chatbot-badge chatbot-footer-text w-full text-center px-[10px] pt-[6px] pb-[10px] m-auto font-normal text-[12px]" />
      </Show>
    </>
  );
};
