import { getPercentChange } from '../../utils/data'
import { ProtocolData } from '../../state/protocol/reducer'
import gql from 'graphql-tag'
import { useQuery, ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { useMemo } from 'react'
import { useClients } from 'state/application/hooks'
import { client, blockClient, arbitrumClient, arbitrumBlockClient } from 'apollo/client'

export const GLOBAL_DATA = (block?: string) => {
  const queryString = ` query behodlers {
      behodlers (
       ${block ? `block: { number: ${block}}` : ``} 
       first: 1, subgraphError: allow) {
        id
        ethVolume
        usdVolume
        ethLiquidity
        usdLiquidity
        tokens {
          id
          name
          symbol
          eth
          usd
          totalSupply
          liquidity
          ethVolume
          usdVolume
        }
        block
      }
    }`
  return gql(queryString)
}

interface GlobalResponse {
  behodlers: {
    id: string
    ethVolume: string
    usdVolume: string
    ethLiquidity: string
    usdLiquidity: string
    tokens: Tokens[]
    block: string
  }[]
}

interface Tokens {
  tokens: {
    id: string
    name: string
    symbol: string
    eth: string
    usd: string
    totalSupply: string
    liquidity: string
    ethVolume: string
    usdVolume: string
  }[]
}

export function useFetchProtocolData(
  dataClientOverride?: ApolloClient<NormalizedCacheObject>,
  blockClientOverride?: ApolloClient<NormalizedCacheObject>
): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  // get appropriate clients if override needed
  const { dataClient, blockClient } = useClients()
  const activeDataClient = dataClientOverride ?? dataClient
  const activeBlockClient = blockClientOverride ?? blockClient

  // get blocks from historic timestamps
  const [t24, t48] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48], activeBlockClient)
  const [block24, block48] = blocks ?? []

  // fetch all data
  const { loading, error, data } = useQuery<GlobalResponse>(GLOBAL_DATA(), { client: activeDataClient })

  const { loading: loading24, error: error24, data: data24 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block24?.number ?? undefined),
    { client: activeDataClient }
  )

  const { loading: loading48, error: error48, data: data48 } = useQuery<GlobalResponse>(
    GLOBAL_DATA(block48?.number ?? undefined),
    { client: activeDataClient }
  )

  const anyError = Boolean(error || error24 || error48 || blockError)
  const anyLoading = Boolean(loading || loading24 || loading48)

  const parsed = data?.behodlers?.[0]
  const parsed24 = data24?.behodlers?.[0]
  const parsed48 = data48?.behodlers?.[0]

  const formattedData: ProtocolData | undefined = useMemo(() => {
    if (anyError || anyLoading || !parsed || !blocks) {
      return undefined
    }

    // volume data
    const totalVolumeUSD = parseFloat(parsed.usdVolume)

    // const dailyVolumeUSD =
    //   parsed && parsed24 ? parseFloat(parsed.usdVolume) - parseFloat(parsed24.usdVolume) : parseFloat(parsed.usdVolume)

    // const volumeOneWindowAgo =
    //   parsed24 && parsed48 ? parseFloat(parsed24.usdVolume) - parseFloat(parsed48.usdVolume) : undefined

    // const dailyVolumeUSDChange =
    //   dailyVolumeUSD && volumeOneWindowAgo ? ((dailyVolumeUSD - volumeOneWindowAgo) / volumeOneWindowAgo) * 100 : 0

    // total value locked
    const totalLiquidityUSDChange = getPercentChange(parsed?.usdLiquidity, parsed24?.usdLiquidity)

    // 24H transactions
    // const txCount =
    //   parsed && parsed24 ? parseFloat(parsed.txCount) - parseFloat(parsed24.txCount) : parseFloat(parsed.txCount)

    // const txCountOneWindowAgo =
    //   parsed24 && parsed48 ? parseFloat(parsed24.txCount) - parseFloat(parsed48.txCount) : undefined

    // const txCountChange =
    //   txCount && txCountOneWindowAgo ? getPercentChange(txCount.toString(), txCountOneWindowAgo.toString()) : 0

    // const feesOneWindowAgo =
    //   parsed24 && parsed48 ? parseFloat(parsed24.totalFeesUSD) - parseFloat(parsed48.totalFeesUSD) : undefined

    // const feesUSD =
    //   parsed && parsed24
    //     ? parseFloat(parsed.totalFeesUSD) - parseFloat(parsed24.totalFeesUSD)
    //     : parseFloat(parsed.totalFeesUSD)

    // const feeChange =
    //   feesUSD && feesOneWindowAgo ? getPercentChange(feesUSD.toString(), feesOneWindowAgo.toString()) : 0

    return {
      totalVolumeUSD,
      // dailyVolumeUSD,
      // dailyVolumeUSDChange: typeof dailyVolumeUSDChange === 'number' ? dailyVolumeUSDChange : 0,
      totalLiquidityUSD: parseFloat(parsed.usdLiquidity),
      totalLiquidityUSDChange,
      // feesUSD,
      // feeChange,
      // txCount,
      // txCountChange,
    }
  }, [anyError, anyLoading, blocks, parsed, parsed24, parsed48])

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedData,
  }
}

export function useFetchAggregateProtocolData(): {
  loading: boolean
  error: boolean
  data: ProtocolData | undefined
} {
  const { data: ethereumData, loading: loadingEthereum, error: errorEthereum } = useFetchProtocolData(
    client,
    blockClient
  )
  const { data: arbitrumData, loading: loadingArbitrum, error: errorArbitrum } = useFetchProtocolData(
    arbitrumClient,
    arbitrumBlockClient
  )

  if (!ethereumData && !arbitrumData) {
    return {
      data: undefined,
      loading: false,
      error: false,
    }
  }

  // for now until useMultipleDatas hook just manuall construct ProtocolData object

  // console.log(ethereumData)
  // console.log(arbitrumData)

  return {
    data: undefined,
    loading: false,
    error: false,
  }
}
