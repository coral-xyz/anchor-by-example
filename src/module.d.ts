// For external modules without type declarations

declare module '@markdoc/markdoc' {
  const markdoc: any;
  export default markdoc;
}

declare module '@markdoc/next.js' {
  const withMarkdoc: any;
  export default withMarkdoc;
}

// For Next.js features
declare module 'next-plausible' {
  export const withPlausibleProxy: any;
  export const PlausibleProvider: React.ComponentType<{
    domain: string;
    trackOutboundLinks?: boolean;
    children: React.ReactNode;
  }>;
}

// For @docsearch/react
declare module '@docsearch/react' {
  export interface UseDocSearchKeyboardEventsProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    searchButtonRef?: React.RefObject<HTMLButtonElement>;
  }

  export interface DocSearchProps {
    appId: string;
    apiKey: string;
    indexName: string;
    initialScrollY?: number;
    onClose?: () => void;
    hitComponent?: React.ComponentType<any>;
    navigator?: {
      navigate: (params: { itemUrl: string }) => void;
    };
    [key: string]: any;
  }

  export function useDocSearchKeyboardEvents(props: UseDocSearchKeyboardEventsProps): void;
  export const DocSearchModal: React.ComponentType<DocSearchProps>;
} 