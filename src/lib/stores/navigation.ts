import { writable, get } from "svelte/store";

interface PageStackItem {
  url: string;
  title: string;
}

const MAX_STACK_SIZE = 10;

function createNavigationStore() {
  const { subscribe, set, update } = writable<PageStackItem[]>([]);

  return {
    subscribe,
    push: (url: string, title: string) => {
      update((stack) => {
        // Don't add if it's the same as the current page
        const current = stack[stack.length - 1];
        if (current?.url === url) {
          return stack;
        }

        const newStack = [...stack, { url, title }];

        // Keep only the last MAX_STACK_SIZE items
        if (newStack.length > MAX_STACK_SIZE) {
          return newStack.slice(newStack.length - MAX_STACK_SIZE);
        }

        return newStack;
      });
    },
    pop: () => {
      let poppedItem: PageStackItem | undefined;
      update((stack) => {
        if (stack.length > 0) {
          poppedItem = stack[stack.length - 1];
          return stack.slice(0, -1);
        }
        return stack;
      });
      return poppedItem;
    },
    canGoBack: () => {
      const stack = get({ subscribe });
      return stack.length > 0;
    },
    clear: () => set([]),
    getStack: () => get({ subscribe }),
  };
}

export const navigationStack = createNavigationStore();
