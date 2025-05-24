// Common type declarations for the project
import { ReactNode } from 'react';
import { IconColor } from '@/components/Icon';

export declare global {
  interface Window {
    plausible: (event: string, options?: any) => void;
  }
}

// Icon component interfaces
export interface IconComponentProps {
  id: string;
  color: IconColor;
}

// Add component type declarations as needed

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
    [key: string]: any;
  }

  export function useDocSearchKeyboardEvents(props: UseDocSearchKeyboardEventsProps): void;
  export const DocSearchModal: React.ComponentType<DocSearchProps>;
}

// Add other module declarations as needed 