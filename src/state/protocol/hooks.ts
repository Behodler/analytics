import { updateProtocolData, updateChartData, updateTransactions } from './actions'
import { AppState, AppDispatch } from './../index'
import { ProtocolData } from './reducer'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChartDayData, Transaction, TransactionsProtocol } from 'types'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { useFetchAggregateProtocolData } from 'data/protocol/overview'

export function useProtocolData(): [ProtocolData | undefined, (protocolData: ProtocolData) => void] {
  const [activeNetwork] = useActiveNetworkVersion()
  const protocolData: ProtocolData | undefined = useSelector(
    (state: AppState) => state.protocol[activeNetwork.id]?.data
  )

  const dispatch = useDispatch<AppDispatch>()
  const setProtocolData: (protocolData: ProtocolData) => void = useCallback(
    (protocolData: ProtocolData) => dispatch(updateProtocolData({ protocolData, networkId: activeNetwork.id })),
    [activeNetwork.id, dispatch]
  )
  return [protocolData, setProtocolData]
}

export function useProtocolChartData(): [ChartDayData[] | undefined, (chartData: ChartDayData[]) => void] {
  const [activeNetwork] = useActiveNetworkVersion()
  const chartData: ChartDayData[] | undefined = useSelector(
    (state: AppState) => state.protocol[activeNetwork.id]?.chartData
  )

  const dispatch = useDispatch<AppDispatch>()
  const setChartData: (chartData: ChartDayData[]) => void = useCallback(
    (chartData: ChartDayData[]) => dispatch(updateChartData({ chartData, networkId: activeNetwork.id })),
    [activeNetwork.id, dispatch]
  )
  return [chartData, setChartData]
}

export function useProtocolTransactions(): [
  TransactionsProtocol | undefined,
  (transactions: TransactionsProtocol) => void
] {
  const [activeNetwork] = useActiveNetworkVersion()
  const transactions: TransactionsProtocol | undefined = useSelector(
    (state: AppState) => state.protocol[activeNetwork.id]?.transactions
  )
  const dispatch = useDispatch<AppDispatch>()
  const setTransactions: (transactions: TransactionsProtocol) => void = useCallback(
    (transactions: TransactionsProtocol) => dispatch(updateTransactions({ transactions, networkId: activeNetwork.id })),
    [activeNetwork.id, dispatch]
  )
  return [transactions, setTransactions]
}

export function useAggregateOverviewData() {
  useFetchAggregateProtocolData()
}
