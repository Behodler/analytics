export interface Block {
  number: number
  timestamp: string
}

export interface ChartDayData {
  date: number
  dailyVolumeUSD: number
  totalLiquidityUSD: number
}

export enum TransactionType {
  SWAP,
  MINT,
  BURN,
  POOL,
}

export type Transaction = {
  type: TransactionType
  hash: string
  timestamp: string
  sender: string
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  amountToken0: number
  amountToken1: number
}

export type TransactionSwaps = {
  type: TransactionType
  hash: string
  timestamp: string
  sender: string
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  amountToken0: number
  amountToken1: number
  value: number
}

export type TransactionLiquidities = {
  hash: string
  timestamp: string
  direction: TransactionType
  token0Symbol: string
  token0Address: string
  scx: number
  amount: number
  value: number
  totalLiquidity: number
}

export type TransactionsProtocol = {
  swaps: TransactionSwaps[]
  liquidities: TransactionLiquidities[]
}

/**
 * Formatted type for Candlestick charts
 */
export type PriceChartEntry = {
  time: number // unix timestamp
  open: number
  close: number
  high: number
  low: number
}
