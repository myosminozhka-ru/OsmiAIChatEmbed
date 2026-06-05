export const getCssVar = (el: HTMLElement, name: string): string => getComputedStyle(el).getPropertyValue(name).trim();
