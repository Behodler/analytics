import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useClients } from 'state/application/hooks'

// Exclude BAT, WBTC, WEIDAI
export const TOP_TOKENS = gql`
  query tokens {
    tokens(
      first: 50
      where: {
        id_not_in: [
          "0x0d8775f648430679a709e98d2b0cb6250d2887ef"
          "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
          "0xafef0965576070d1608f374cb14049eefad218ec"
        ]
      }
      orderBy: liquidity
      orderDirection: desc
      subgraphError: allow
    ) {
      id
      liquidity
      usd
    }
  }
`

interface TopTokensResponse {
  tokens: {
    id: string
    liquidity: string
    usd: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useTopTokenAddresses(): {
  loading: boolean
  error: boolean
  addresses: string[] | undefined
} {
  const { dataClient } = useClients()

  const { loading, error, data } = useQuery<TopTokensResponse>(TOP_TOKENS, { client: dataClient })

  const formattedData = useMemo(() => {
    if (data) {
      return data.tokens
        .sort((a, b) =>
          parseFloat(a.liquidity) * parseFloat(a.usd) > parseFloat(b.liquidity) * parseFloat(b.usd) ? 1 : -1
        )
        .map((t) => t.id)
    } else {
      return undefined
    }
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    addresses: formattedData,
  }
}
