import Head from 'next/head'
import { slugifyWithCounter } from '@sindresorhus/slugify'

import Prism from 'prism-react-renderer/prism' // prism is for code highlighting
;(typeof global !== 'undefined' ? global : window).Prism = Prism

require('prismjs/components/prism-rust')
require('prismjs/components/prism-toml')
require('prismjs/components/prism-typescript')

import { Layout } from '@/components/Layout'

import 'focus-visible'
import '@/styles/tailwind.css'

const navigation = [
  {
    title: 'Getting Started',
    links: [
      { title: 'Hello World', href: '/docs/hello-world', active: true },
      { title: 'On-chain Voting', href: '/docs/onchain-voting', active: true },
      {
        title: 'Decentralized Crowdfund',
        href: '/docs/decentralized-crowdfund',
        active: false,
      },
    ],
  },
  {
    title: 'Intermediate',
    links: [
      {
        title: 'Self-Custodial Facebook',
        href: '/docs/self-custodial-facebook',
        active: true,
      },
      {
        title: 'Non-custodial Escrow',
        href: '/docs/non-custodial-escrow',
        active: true,
      },
      {
        title: 'Job Board - Convention Over Configuration',
        href: '/docs/jobs',
        active: true,
      },
      {
        title: 'Cross-Program Invocations',
        href: '/docs/cross-program-invocations',
        active: false,
      },

    ],
  },
  {
    title: 'Advance',
    links: [
      { title: 'Merkel Trees', href: '/docs/merkel-trees', active: false },
      {
        title: 'Multi Sig Wallet',
        href: '/docs/multi-sig-wallet',
        active: false,
      },
      {
        title: 'Automated Market Maker',
        href: '/docs/automated-market-maker',
        active: false,
      },
      {
        title: 'Lending Borrowing Protocol',
        href: '/docs/lending-borrowing-protocol',
        active: false,
      },
    ],
  },
  {
    title: 'Sealevel Attacks',
    links: [
      { title: 'Owner Checks', href: '/docs/owner-checks', active: false },
      { title: 'Arbitrary CPI', href: '/docs/arbitrary-cpi', active: false },
      {
        title: 'Closing Accounts',
        href: '/docs/Closing Accounts',
        active: false,
      },
      {
        title: 'Sandwich Instructions',
        href: '/docs/sandwich',
        active: true,
      },
    ],
  },
]

function getNodeText(node) {
  let text = ''
  for (let child of node.children ?? []) {
    if (typeof child === 'string') {
      text += child
    }
    text += getNodeText(child)
  }
  return text
}

function collectHeadings(nodes, slugify = slugifyWithCounter()) {
  let sections = []

  for (let node of nodes) {
    if (/^h[23]$/.test(node.name)) {
      let title = getNodeText(node)
      if (title) {
        let id = slugify(title)
        node.attributes.id = id
        if (node.name === 'h3') {
          sections[sections.length - 1].children.push({
            ...node.attributes,
            title,
          })
        } else {
          sections.push({ ...node.attributes, title, children: [] })
        }
      }
    }

    sections.push(...collectHeadings(node.children ?? [], slugify))
  }

  return sections
}

export default function App({ Component, pageProps }) {
  let title = pageProps.markdoc?.frontmatter.title

  let pageTitle =
    pageProps.markdoc?.frontmatter.pageTitle ||
    `${pageProps.markdoc?.frontmatter.title} - Docs`

  let description = pageProps.markdoc?.frontmatter.description

  let tableOfContents = pageProps.markdoc?.content
    ? collectHeadings(pageProps.markdoc.content)
    : []

  return (
    <>
      {/* <PlausibleProvider domain="anchor-lang.com" trackOutboundLinks={true}> */}
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://www.anchor-lang.com/logo.png"
        />
        <meta property="og:image:width" content="250" />
        <meta property="og:image:height" content="214" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta
          name="twitter:image"
          content="https://www.anchor-lang.com/logo.png"
        />
      </Head>
      <Layout
        navigation={navigation}
        title={title}
        tableOfContents={tableOfContents}
      >
        <Component {...pageProps} />
      </Layout>
      {/* </PlausibleProvider> */}
    </>
  )
}
