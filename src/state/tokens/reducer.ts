import { currentTimestamp } from './../../utils/index'
import {
  updateTokenData,
  addTokenKeys,
  addPoolAddresses,
  updateChartData,
  updatePriceData,
  updateTransactions,
} from './actions'
import { createReducer } from '@reduxjs/toolkit'
import { PriceChartEntry, Transaction, TransactionToken } from 'types'
import { SupportedNetwork, SUPPORTED_NETWORK_VERSIONS } from 'constants/networks'

export type TokenData = {
  // token is in some pool on behodler
  exists: boolean

  // basic token info
  name: string
  symbol: string
  address: string
  totalSupply: number
  eth: number

  // volume
  volume: number
  ethVolume: number
  usdVolume: number
  // dailyVolumeUSD: number
  // dailyVolumeUSDChange: number
  // dailyVolumeUSDWeek: number
  // txCount: number

  //fees
  // feesUSD: number

  // tvl
  liquidity: number
  // tvlToken: number
  totalLiquidityUSD: number
  // totalLiquidityUSDChange: number

  priceUSD: number
  // priceUSDChange: number
  // priceUSDChangeWeek: number
}

export interface TokenChartEntry {
  date: number
  dailyVolumeUSD: number
  totalValueLockedUSD: number
}

export interface TokensState {
  // analytics data from
  byAddress: {
    [networkId: string]: {
      [address: string]: {
        data: TokenData | undefined
        poolAddresses: string[] | undefined
        chartData: TokenChartEntry[] | undefined
        priceData: {
          oldestFetchedTimestamp?: number | undefined
          [secondsInterval: number]: PriceChartEntry[] | undefined
        }
        transactions: TransactionToken | undefined
        lastUpdated: number | undefined
      }
    }
  }
}

export const initialState: TokensState = {
  byAddress: {
    [SupportedNetwork.ETHEREUM]: {},
    [SupportedNetwork.ARBITRUM]: {},
    [SupportedNetwork.OPTIMISM]: {},
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateTokenData, (state, { payload: { tokens, networkId } }) => {
      tokens.map(
        (tokenData) =>
          (state.byAddress[networkId][tokenData.address] = {
            ...state.byAddress[networkId][tokenData.address],
            data: tokenData,
            lastUpdated: currentTimestamp(),
          })
      )
    }) // add address to byAddress keys if not included yet
    .addCase(addTokenKeys, (state, { payload: { tokenAddresses, networkId } }) => {
      tokenAddresses.map((address) => {
        if (!state.byAddress[networkId][address]) {
          state.byAddress[networkId][address] = {
            poolAddresses: undefined,
            data: undefined,
            chartData: undefined,
            priceData: {},
            transactions: undefined,
            lastUpdated: undefined,
          }
        }
      })
    })
    // add list of pools the token is included in
    .addCase(addPoolAddresses, (state, { payload: { tokenAddress, poolAddresses, networkId } }) => {
      state.byAddress[networkId][tokenAddress] = { ...state.byAddress[networkId][tokenAddress], poolAddresses }
    })
    // add list of pools the token is included in
    .addCase(updateChartData, (state, { payload: { tokenAddress, chartData, networkId } }) => {
      state.byAddress[networkId][tokenAddress] = { ...state.byAddress[networkId][tokenAddress], chartData }
    })
    // add list of pools the token is included in
    .addCase(updateTransactions, (state, { payload: { tokenAddress, transactions, networkId } }) => {
      state.byAddress[networkId][tokenAddress] = { ...state.byAddress[networkId][tokenAddress], transactions }
    })
    // update historical price volume based on interval size
    .addCase(
      updatePriceData,
      (state, { payload: { tokenAddress, secondsInterval, priceData, oldestFetchedTimestamp, networkId } }) => {
        state.byAddress[networkId][tokenAddress] = {
          ...state.byAddress[networkId][tokenAddress],
          priceData: {
            ...state.byAddress[networkId][tokenAddress].priceData,
            [secondsInterval]: priceData,
            oldestFetchedTimestamp,
          },
        }
      }
    )
)
