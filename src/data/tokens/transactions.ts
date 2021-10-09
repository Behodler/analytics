import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { TransactionToken, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'

const GLOBAL_TRANSACTIONS = gql`
  query transactions($address: Bytes!) {
    swaps0(
      first: 500
      orderBy: timestamp
      where: { inputToken_contains: $address }
      orderDirection: desc
      subgraphError: allow
    ) {
      id
      transaction
      timestamp
      sender
      inputToken {
        id
        symbol
        usd
      }
      inputAmount
      outputToken {
        id
        symbol
        usd
      }
      outputAmount
    }
    swaps1(
      first: 500
      orderBy: timestamp
      where: { outputToken_contains: $address }
      orderDirection: desc
      subgraphError: allow
    ) {
      id
      transaction
      timestamp
      sender
      inputToken {
        id
        symbol
        usd
      }
      inputAmount
      outputToken {
        id
        symbol
        usd
      }
      outputAmount
    }
    liquidities(
      first: 500
      orderBy: timestamp
      orderDirection: desc
      where: { token_contains: $address }
      subgraphError: allow
    ) {
      id
      transaction
      timestamp
      direction
      amount
      scx
      token {
        id
        symbol
        eth
        usd
        liquidity
      }
    }
  }
`

type TransactionEntry = {
  timestamp: string
  id: string
  // mints: {
  //   pool: {
  //     token0: {
  //       id: string
  //       symbol: string
  //     }
  //     token1: {
  //       id: string
  //       symbol: string
  //     }
  //   }
  //   origin: string
  //   amount0: string
  //   amount1: string
  //   amountUSD: string
  // }[]
  swaps0: {
    id: string
    transaction: string
    timestamp: string
    sender: string
    inputToken: {
      id: string
      symbol: string
      usd: string
    }
    inputAmount: string
    outputToken: {
      id: string
      symbol: string
      usd: string
    }
    outputAmount: string
  }[]
  swaps1: {
    id: string
    transaction: string
    timestamp: string
    sender: string
    inputToken: {
      id: string
      symbol: string
      usd: string
    }
    inputAmount: string
    outputToken: {
      id: string
      symbol: string
      usd: string
    }
    outputAmount: string
  }[]
  liquidities: {
    id: string
    transaction: string
    timestamp: string
    direction: string
    amount: string
    scx: string
    token: {
      id: string
      symbol: string
      eth: string
      usd: string
    }
  }[]
  // burns: {
  //   pool: {
  //     token0: {
  //       id: string
  //       symbol: string
  //     }
  //     token1: {
  //       id: string
  //       symbol: string
  //     }
  //   }
  //   owner: string
  //   origin: string
  //   amount0: string
  //   amount1: string
  //   amountUSD: string
  // }[]
}

interface TransactionResults {
  swaps0: any[]
  swaps1: any[]
  liquidities: any[]
}

export async function fetchTokenTransactions(
  address: string,
  client: ApolloClient<NormalizedCacheObject>
): Promise<{ data: TransactionToken | undefined; error: boolean; loading: boolean }> {
  try {
    const { data, error, loading } = await client.query<TransactionResults>({
      query: GLOBAL_TRANSACTIONS,
      variables: {
        address: address,
      },
      fetchPolicy: 'cache-first',
    })

    if (error) {
      return {
        data: undefined,
        error: true,
        loading: false,
      }
    }

    if (loading && !data) {
      return {
        data: undefined,
        error: false,
        loading: true,
      }
    }

    const swap0Entries = data.swaps0.map((m) => {
      return {
        hash: m.id,
        type: TransactionType.SWAP,
        timestamp: m.timestamp,
        sender: m.sender,
        token0Symbol: formatTokenSymbol(m.inputToken.id, m.inputToken.symbol),
        token1Symbol: formatTokenSymbol(m.outputToken.id, m.outputToken.symbol),
        token0Address: m.inputToken.id,
        token1Address: m.outputToken.id,
        amountToken0: parseFloat(m.inputAmount),
        amountToken1: parseFloat(m.outputAmount),
        value: parseFloat(m.inputToken.usd) * parseFloat(m.inputAmount),
      }
    })

    const swap1Entries = data.swaps1.map((m) => {
      return {
        hash: m.id,
        type: TransactionType.SWAP,
        timestamp: m.timestamp,
        sender: m.sender,
        token0Symbol: formatTokenSymbol(m.inputToken.id, m.inputToken.symbol),
        token1Symbol: formatTokenSymbol(m.outputToken.id, m.outputToken.symbol),
        token0Address: m.inputToken.id,
        token1Address: m.outputToken.id,
        amountToken0: parseFloat(m.inputAmount),
        amountToken1: parseFloat(m.outputAmount),
        value: parseFloat(m.inputToken.usd) * parseFloat(m.inputAmount),
      }
    })

    const liquidityEntries = data.liquidities.map((m) => {
      let txType = TransactionType.MINT
      if (m.direction === 'Withdraw') {
        txType = TransactionType.BURN
      }
      return {
        hash: m.id,
        timestamp: m.timestamp,
        direction: txType,
        token0Symbol: formatTokenSymbol(m.token.id, m.token.symbol),
        token0Address: m.token.id,
        scx: parseFloat(m.scx),
        amount: parseFloat(m.amount),
        value: parseFloat(m.token.usd),
        totalLiquidity: parseFloat(m.token.liquidity),
      }
    })

    const accum = {
      swaps: [...swap0Entries, ...swap1Entries],
      liquidities: liquidityEntries,
    }
    console.log('accum', accum)
    return { data: accum, error: false, loading: false }
  } catch {
    return {
      data: undefined,
      error: true,
      loading: false,
    }
  }
}
