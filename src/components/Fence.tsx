import { Fragment, ReactNode } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

interface FenceProps {
  children: string;
  language?: string;
}

export function Fence({ children, language = 'jsx' }: FenceProps) {
  return (
    <Highlight 
      theme={themes.dracula}
      code={children.trimEnd()}
      language={language as any}
    >
      {({ className, style, tokens, getTokenProps, getLineProps }) => (
        <pre className={className} style={{ ...style }} tabIndex={0}>
          <code className={`language-${language}`}>
            {tokens.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {line.map((token, tokenIndex) => (
                  <span key={`${lineIndex}-${tokenIndex}`} {...getTokenProps({ token, key: tokenIndex })} />
                ))}
                {'\n'}
              </Fragment>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  )
}
