export const createTTSActionGuard = () => {
  let isTTSActionRef = false;
  let ttsTimeoutRef: ReturnType<typeof setTimeout> | null = null;

  const setTTSAction = (isActive: boolean) => {
    isTTSActionRef = isActive;
    if (ttsTimeoutRef) {
      clearTimeout(ttsTimeoutRef);
      ttsTimeoutRef = null;
    }
    if (isActive) {
      ttsTimeoutRef = setTimeout(() => {
        isTTSActionRef = false;
        ttsTimeoutRef = null;
      }, 300);
    }
  };

  const isTTSActionActive = () => isTTSActionRef;

  const cleanup = () => {
    if (ttsTimeoutRef) {
      clearTimeout(ttsTimeoutRef);
      ttsTimeoutRef = null;
    }
  };

  return { setTTSAction, isTTSActionActive, cleanup };
};
