import React, { useState } from 'react'
import styled from 'styled-components'
import { DarkGreyCard } from 'components/Card'
import { TransactionsProtocol } from 'types'
import useTheme from 'hooks/useTheme'
import LiquiditiesTransactionsTable from './liquidities'
import SwapsTransactionsTable from './swaps'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
`
const TransactionsListType = styled.div`
  text-align: center;
  position: relative;
  margin: 0 auto -16px;
`

const TransactionsTypeToggle = styled.div`
  cursor: pointer;
  text-transform: uppercase;
  font-size: 14px;
  display: inline-block;
  vertical-align: center;
  font-weight: 600;
  padding: 8px 20px;
  position: relative;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  :hover:not(.active) {
    color: ${({ theme }) => theme.primary1};
  }
  &.active {
    background: ${({ theme }) => theme.primary4};
  }
`

export default function TransactionsProtocolTable({
  transactions,
  maxItems = 10,
  color,
}: {
  transactions: TransactionsProtocol
  maxItems?: number
  color?: string
}) {
  // theming
  const theme = useTheme()

  // set visible chart
  const [isSwapsChart, setIsVolumeChart] = useState<boolean>(false)
  const setChartType = () => setIsVolumeChart(!isSwapsChart)

  return (
    <Wrapper>
      <TransactionsListType>
        <TransactionsTypeToggle className={isSwapsChart ? '' : 'active'} onClick={setChartType}>
          Swap
        </TransactionsTypeToggle>
        <TransactionsTypeToggle className={isSwapsChart ? 'active' : ''} onClick={setChartType}>
          Liquidity
        </TransactionsTypeToggle>
      </TransactionsListType>
      {isSwapsChart && <LiquiditiesTransactionsTable transactions={transactions} color={color} />}
      {!isSwapsChart && <SwapsTransactionsTable transactions={transactions} color={color} />}
    </Wrapper>
  )
}
