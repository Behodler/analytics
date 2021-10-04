import { ProtocolData } from './reducer'
import { createAction } from '@reduxjs/toolkit'
import { ChartDayData, TransactionsProtocol } from 'types'
import { SupportedNetwork } from 'constants/networks'

// protocol wide info
export const updateProtocolData = createAction<{ protocolData: ProtocolData; networkId: SupportedNetwork }>(
  'protocol/updateProtocolData'
)
export const updateChartData = createAction<{ chartData: ChartDayData[]; networkId: SupportedNetwork }>(
  'protocol/updateChartData'
)
export const updateTransactions = createAction<{ transactions: TransactionsProtocol; networkId: SupportedNetwork }>(
  'protocol/updateTransactions'
)
