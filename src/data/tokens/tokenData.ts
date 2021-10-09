import { getPercentChange } from './../../utils/data'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from 'utils/queries'
import { useBlocksFromTimestamps } from 'hooks/useBlocksFromTimestamps'
import { get2DayChange } from 'utils/data'
import { TokenData } from 'state/tokens/reducer'
import { useEthPrices } from 'hooks/useEthPrices'
import { formatTokenSymbol, formatTokenName } from 'utils/tokens'
import { useClients } from 'state/application/hooks'
import { SCX } from '../../constants/index'

export const TOKENS_BULK = (block: number | undefined, tokens: string[]) => {
  let tokenString = `[`
  tokens.map((address) => {
    return (tokenString += `"${address}",`)
  })
  tokenString += ']'
  const queryString =
    `
    query tokens {
      tokens(` + // removed: where: {id_in: ${tokenString}},
    (block ? `block: {number: ${block}} ,` : ``) +
    // Exclude BAT, WBTC, WEIDAI
    ` where: { id_not_in: [
      "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "0xafef0965576070d1608f374cb14049eefad218ec"
    ] }` +
    ` orderBy: liquidity, orderDirection: desc, subgraphError: allow) {
        id
        symbol
        name
        volume
        eth
        ethVolume
        usd
        usdVolume
        liquidity
        totalSupply
      }
    }
    `
  return gql(queryString)
}

interface TokenFields {
  id: string
  symbol: string
  name: string
  volume: string
  eth: string
  ethVolume: string
  usd: string
  usdVolume: string
  liquidity: string
  totalSupply: string
}

interface TokenDataResponse {
  tokens: TokenFields[]
  bundles: {
    ethPriceUSD: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function useFetchedTokenDatas(
  tokenAddresses: string[]
): {
  loading: boolean
  error: boolean
  data:
    | {
        [address: string]: TokenData
      }
    | undefined
} {
  const { dataClient } = useClients()

  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()

  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, block48, blockWeek] = blocks ?? []
  const ethPrices = useEthPrices()

  const { loading, error, data } = useQuery<TokenDataResponse>(TOKENS_BULK(undefined, tokenAddresses), {
    client: dataClient,
  })

  const { loading: loading24, error: error24, data: data24 } = useQuery<TokenDataResponse>(
    TOKENS_BULK(parseInt(block24?.number), tokenAddresses),
    {
      client: dataClient,
    }
  )

  const { loading: loading48, error: error48, data: data48 } = useQuery<TokenDataResponse>(
    TOKENS_BULK(parseInt(block48?.number), tokenAddresses),
    {
      client: dataClient,
    }
  )

  const { loading: loadingWeek, error: errorWeek, data: dataWeek } = useQuery<TokenDataResponse>(
    TOKENS_BULK(parseInt(blockWeek?.number), tokenAddresses),
    {
      client: dataClient,
    }
  )

  const anyError = Boolean(error || error24 || error48 || blockError || errorWeek)
  const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek || !blocks)

  if (!ethPrices) {
    return {
      loading: true,
      error: false,
      data: undefined,
    }
  }

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  const parsed = data?.tokens
    ? data.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed24 = data24?.tokens
    ? data24.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed48 = data48?.tokens
    ? data48.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsedWeek = dataWeek?.tokens
    ? dataWeek.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  // TO DO - Calculate SCX liquidity in Subgraph - Temporarily sum SCX total liquidity
  let totalSCXLiqidity = 0
  data?.tokens.map((token) => {
    totalSCXLiqidity = totalSCXLiqidity + parseFloat(token.liquidity) * parseFloat(token.usd)
  })

  // format data and calculate daily changes
  const formatted = tokenAddresses.reduce((accum: { [address: string]: TokenData }, address) => {
    // const formatted = parsed.reduce((accum: { [address: string]: TokenData }, address) => {
    const current: TokenFields | undefined = parsed[address]
    // const oneDay: TokenFields | undefined = parsed24[address]
    // const twoDay: TokenFields | undefined = parsed48[address]
    // const week: TokenFields | undefined = parsedWeek[address]

    const totalSupply = current ? parseFloat(current.totalSupply) : 0
    const eth = current ? parseFloat(current.eth) : 0
    const ethVolume = current ? parseFloat(current.ethVolume) : 0
    const volume = current ? parseFloat(current.volume) : 0
    const usdVolume = current ? parseFloat(current.usdVolume) : 0
    // const [usdVolume, usdVolumeChange] =
    //   current && oneDay && twoDay
    //     ? get2DayChange(current.usdVolume, oneDay.usdVolume, twoDay.usdVolume)
    //     : current
    //     ? [parseFloat(current.usdVolume), 0]
    //     : [0, 0]

    // const usdVolumeWeek =
    //   current && week
    //     ? parseFloat(current.usdVolume) - parseFloat(week.usdVolume)
    //     : current
    //     ? parseFloat(current.usdVolume)
    //     : 0
    let totalLiquidityUSD = current ? parseFloat(current.liquidity) * parseFloat(current.usd) : 0
    // const totalLiquidityUSDChange = getPercentChange(current?.totalValueLockedUSD, oneDay?.totalValueLockedUSD)
    // const totalLiquidityUSDChange = getPercentChange(current?.totalValueLockedUSD, oneDay?.totalValueLockedUSD)
    const liquidity = current ? parseFloat(current.liquidity) : 0
    const priceUSD = current ? parseFloat(current.usd) : 0
    // const priceUSDOneDay = oneDay ? parseFloat(oneDay.usd) * ethPrices.oneDay : 0
    // const priceUSDWeek = week ? parseFloat(week.usd) * ethPrices.week : 0
    // const priceUSDChange =
    //   priceUSD && priceUSDOneDay ? getPercentChange(priceUSD.toString(), priceUSDOneDay.toString()) : 0
    // const priceUSDChangeWeek =
    //   priceUSD && priceUSDWeek ? getPercentChange(priceUSD.toString(), priceUSDWeek.toString()) : 0

    // const txCount =
    //   current && oneDay
    //     ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
    //     : current
    //     ? parseFloat(current.txCount)
    //     : 0
    // const feesUSD =
    //   current && oneDay
    //     ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
    //     : current
    //     ? parseFloat(current.feesUSD)
    //     : 0

    // SUM all liquidity for SCX
    if (address === SCX.address) {
      totalLiquidityUSD = totalSCXLiqidity
    }

    accum[address] = {
      exists: !!current,
      address,
      name: current ? formatTokenName(address, current.name) : '',
      symbol: current ? formatTokenSymbol(address, current.symbol) : '',
      totalSupply,
      volume,
      eth,
      ethVolume,
      usdVolume,
      liquidity,
      totalLiquidityUSD,
      priceUSD,
    }

    return accum
  }, {})

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}
