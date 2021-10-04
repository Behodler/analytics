import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import gql from 'graphql-tag'
import { Transaction, TransactionsProtocol, TransactionType } from 'types'
import { formatTokenSymbol } from 'utils/tokens'
import { SCX } from '../../constants'

const GLOBAL_TRANSACTIONS = gql`
  query transactions {
    swaps(first: 500, orderBy: timestamp, orderDirection: desc, subgraphError: allow) {
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
    liquidities(first: 500, orderBy: timestamp, orderDirection: desc, subgraphError: allow) {
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
  swaps: {
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
  swaps: any[]
  liquidities: any[]
}

export async function fetchTopTransactions(
  client: ApolloClient<NormalizedCacheObject>
): Promise<TransactionsProtocol | undefined> {
  try {
    const { data, error, loading } = await client.query<TransactionResults>({
      query: GLOBAL_TRANSACTIONS,
      fetchPolicy: 'cache-first',
    })

    if (error || loading || !data) {
      return undefined
    }

    const swapEntries = data.swaps.map((m) => {
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

    //   // const liquidityEntries = t.liquidities.map((m) => {
    //   //   return {
    //   //     hash: m.id,
    //   //     type: TransactionType.POOL,
    //   //     direction: m.direction,
    //   //     timestamp: t.timestamp,
    //   //     token0Symbol: formatTokenSymbol(m.token.id, m.token.symbol),
    //   //     token0Address: m.token.id,
    //   //     amountUSD: parseFloat(m.token.usd),
    //   //     amountToken0: parseFloat(m.amount),
    //   //   }
    //   // })

    // const formatted = data.swaps.reduce((accum: Transaction, t: TransactionEntry) => {
    //   // const mintEntries = t.mints.map((m) => {
    //   //   return {
    //   //     type: TransactionType.MINT,
    //   //     hash: t.id,
    //   //     timestamp: t.timestamp,
    //   //     sender: m.origin,
    //   //     token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
    //   //     token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
    //   //     token0Address: m.pool.token0.id,
    //   //     token1Address: m.pool.token1.id,
    //   //     amountUSD: parseFloat(m.amountUSD),
    //   //     amountToken0: parseFloat(m.amount0),
    //   //     amountToken1: parseFloat(m.amount1),
    //   //   }
    //   // })
    //   // const burnEntries = t.burns.map((m) => {
    //   //   return {
    //   //     type: TransactionType.BURN,
    //   //     hash: t.id,
    //   //     timestamp: t.timestamp,
    //   //     sender: m.origin,
    //   //     token0Symbol: formatTokenSymbol(m.pool.token0.id, m.pool.token0.symbol),
    //   //     token1Symbol: formatTokenSymbol(m.pool.token1.id, m.pool.token1.symbol),
    //   //     token0Address: m.pool.token0.id,
    //   //     token1Address: m.pool.token1.id,
    //   //     amountUSD: parseFloat(m.amountUSD),
    //   //     amountToken0: parseFloat(m.amount0),
    //   //     amountToken1: parseFloat(m.amount1),
    //   //   }
    //   // })

    //   const swapEntries = t.swaps.map((m) => {
    //     return {
    //       hash: m.id,
    //       type: TransactionType.SWAP,
    //       timestamp: m.timestamp,
    //       sender: m.sender,
    //       token0Symbol: formatTokenSymbol(m.inputToken.id, m.inputToken.symbol),
    //       token1Symbol: formatTokenSymbol(m.outputToken.id, m.outputToken.symbol),
    //       token0Address: m.inputToken.id,
    //       token1Address: m.outputToken.id,
    //       amountToken0: parseFloat(m.inputAmount),
    //       amountToken1: parseFloat(m.outputAmount),
    //     }
    //   })
    //   console.log('swapEntries', swapEntries)

    //   // const liquidityEntries = t.liquidities.map((m) => {
    //   //   return {
    //   //     hash: m.id,
    //   //     type: TransactionType.POOL,
    //   //     direction: m.direction,
    //   //     timestamp: t.timestamp,
    //   //     token0Symbol: formatTokenSymbol(m.token.id, m.token.symbol),
    //   //     token0Address: m.token.id,
    //   //     amountUSD: parseFloat(m.token.usd),
    //   //     amountToken0: parseFloat(m.amount),
    //   //   }
    //   // })

    //   // accum = [...accum, ...mintEntries, ...burnEntries, ...swapEntries]
    //   accum = [...accum, ...swapEntries]
    //   console.log('accum', accum)
    //   return accum
    // }, [])

    const accum = {
      swaps: swapEntries,
      liquidities: liquidityEntries,
    }
    console.log('accum', accum)
    return accum
  } catch {
    return undefined
  }
}
