/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { getMintClubContractAddress, BOND_ABI, generateCreateArgs, mintclub } from 'mint.club-v2-sdk'
import { getDeployPageImage } from '@/app/ui/deployPage'
import { findTokenCreatedEvent } from '@/app/utils/indexEvent'
import { getResultPageImage } from '@/app/ui/resultPage'
import { getSharePageImage } from '@/app/ui/sharePage'

export type State = {
  name: string,
  symbol: string,
  description: string,
  link: string,
}

const app = new Frog<{State: State}>({
  assetsPath: '/',
  basePath: '/api',
  title: 'frame.fun',
  initialState: {
    name: '',
    symbol: '',
    description: '',
    link: process.env.BASE_URL || 'https://frame.fun',
  },  
  // Supply a Hub to enable frame verification.
  hub: neynar({ apiKey: process.env.NEYNAR_KEY || '' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', (c) => {
  return c.res({
    image: ( '/Default.png'),
    intents: [
      <Button action="/name">Mint your own token!</Button>,
      <Button action="/explore">Explore</Button>,
    ],
  })
})

app.frame('/explore', (c) => {
  return c.res({
    image: ( '/Roadmap.png'),
    intents: [
      <Button action="/">Back</Button>,
    ],
  })
})

app.frame('/name', (c) => {  
  return c.res({
    image: ( '/Name.png'),
    intents: [
      <TextInput placeholder="Token Name"/>,
      <Button action="/symbol">Next</Button>,
      <Button action="/">Back</Button>,
    ],
  })
})

app.frame('/symbol', (c) => {
  const { inputText, deriveState } = c

  deriveState(state => {
    if (inputText) {state.name = inputText}
  })

  return c.res({
    image: ( '/Symbol.png'),
    intents: [
      <TextInput placeholder="Token Symbol"/>,
      <Button action='/description'>Next</Button>,
      <Button action="/name">Back</Button>,
    ],
  })
})

app.frame('/description', (c) => {
  const { inputText, deriveState } = c

  deriveState(state => {
    if (inputText) {state.symbol = inputText}
  })

  return c.res({
    image: ( '/Description.png'),
    intents: [
      <TextInput placeholder="Description"/>,
      <Button action="/link">Next</Button>,
      <Button action="/symbol">Back</Button>,
    ],
  })
})

app.frame('/link', (c) => {
  const { inputText, deriveState } = c

  deriveState(state => {
    if (inputText) {state.description = inputText}
  })

  return c.res({
    image: ( '/Twitter.png'),
    intents: [
      <TextInput placeholder="https://x.com/yourproject"/>,
      <Button action="/deploy">Next</Button>,
      <Button action="/description">Back</Button>,
    ],
  })
})

app.frame('/deploy', async (c) => {
  const { inputText, deriveState } = c

  let s: State = {
    name: '',
    symbol: '',
    description: '',
    link: '',
  };
  deriveState(state => {
    if (inputText) {state.link = inputText}
    s = state
  })
  const symbolAlreadyExists = await mintclub.network('basesepolia').token(s.symbol).exists()
  if (s.name === '' || s.symbol === '' || symbolAlreadyExists) {
    return c.res({
      image: ( '/Error.png'),
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  }

  const twitterId = s.link.split('/').pop()

  return c.res({
    action: '/deployed',
    image: (
      getDeployPageImage(s)
    ),
    intents: [
      <Button.Transaction target={`/create/${s.name}/${s.symbol}/${twitterId}`}>Deploy</Button.Transaction>,
      <Button action="/link">Back</Button>,
    ],
  })
})

app.frame('/deployed', async (c) => {
  const { transactionId, deriveState } = c
  let symbol = ''
  deriveState(state => {
    symbol = state.symbol
  })

  if (!transactionId) {
    return c.res({
      image: ( '/Error.png'),
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  }

  // Sleep 4 seconds
  await new Promise(resolve => setTimeout(resolve, 4000))

  const args = await findTokenCreatedEvent(transactionId)
  if (!args) {
    return c.res({
      image: ( '/Error.png'),
      intents: [
        <Button action="/">Back</Button>,
      ],
    })
  }

  const tokenAddr: string = args.token

  const shareUrl = `${process.env.BASE_URL}/share/${symbol}/${tokenAddr}`
  return c.res({
    image: (getResultPageImage(symbol, tokenAddr)),
    intents: [
      <Button action="/">Home</Button>,
      <Button.Link href={shareUrl}>Share</Button.Link>,
      // <Button action={`/share/${symbol}/${tokenAddr}`}>Share</Button>,
    ],
  })
})

app.frame('/share/:symbol/:tokenAddr', (c) => {
  const symbol = c.req.param('symbol')
  const tokenAddr = c.req.param('tokenAddr')
  return c.res({
    image: (getSharePageImage(symbol, tokenAddr)),
    intents: [
      <Button action="/">Home</Button>,
    ],
  })
})

app.transaction('/create/:name/:symbol/:twitterId', (c) => {
  const name = c.req.param('name')
  const symbol = c.req.param('symbol')
  const link = "https://x.com/" + c.req.param('twitterId')

  const { tokenParams, bondParams } = generateCreateArgs({
    name,
    symbol,
    tokenType: "ERC20",
    reserveToken: {
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
    curveData: {
      curveType: "EXPONENTIAL",
      initialMintingPrice: 0.001,
      finalMintingPrice: 1,
      maxSupply: 1_000_000_000,
      stepCount: 100,
      creatorAllocation: 1,
    },
    buyRoyalty: 1,
    sellRoyalty: 1,
  });

  return c.contract({
    abi: BOND_ABI,
    chainId: "eip155:84532",
    functionName: "createToken",
    to: getMintClubContractAddress("BOND", 84532),
    args: [
      {
        ...tokenParams,
        uri: link,
      },
      bondParams,
    ],
    value: BigInt(0),
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
