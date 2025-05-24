/* global Prism */
import 'prismjs';

import { useRef, useState, useEffect, ReactNode } from 'react';
import copy from 'copy-to-clipboard';

import { Icon } from './copyIcon';

interface CodeProps {
  children: ReactNode;
  language?: string;
}

export function Code({ children, language }: CodeProps) {
  let ref = useRef<HTMLPreElement>(null);
  let [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) {
      if (typeof window !== 'undefined' && window.Prism) {
        window.Prism.highlightElement(ref.current, false);
      }
    }
  }, []);

  function handleCopy() {
    if (ref.current) {
      copy(ref.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const lang = language === 'md' ? 'markdoc' : language || 'markdoc';

  const lines =
    typeof children === 'string' ? children.split('\n').filter(Boolean) : [];

  return (
    <div className="relative">
      <pre
        ref={ref}
        className={`language-${lang}`}
        tabIndex={0}
        data-language={language || ''}
      >
        {children}
      </pre>
      <button
        type="button"
        aria-label="Copy"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-slate-700 hover:opacity-80"
      >
        <Icon
          icon={copied ? 'copied' : 'copy'}
          color={copied ? 'green' : 'inherit'}
        />
      </button>
      <style jsx>
        {`
          .code {
            position: relative;
          }
          .code button {
            appearance: none;
            position: absolute;
            color: inherit;
            background: var(--code-background);
            top: ${lines.length === 1 ? '17px' : '13px'};
            right: 11px;
            border-radius: 4px;
            border: none;
            font-size: 15px;
          }
        `}
      </style>
    </div>
  );
}