import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row'
import LineChart from 'components/LineChart/alt'
import useTheme from 'hooks/useTheme'
import {
  useProtocolData,
  useProtocolChartData,
  useProtocolTransactions,
  useAggregateOverviewData,
} from 'state/protocol/hooks'
import { DarkGreyCard } from 'components/Card'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { HideMedium, HideSmall, StyledInternalLink } from '../../theme/components'
import TokenTable from 'components/tokens/TokenTable'
import PoolTable from 'components/pools/PoolTable'
import { PageWrapper, ThemedBackgroundGlobal } from 'pages/styled'
import { unixToDate } from 'utils/date'
import BarChart from 'components/BarChart/alt'
import { useAllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import SwapsTransactionsTable from '../../components/TransactionsProtocolTable/swaps'
import LiquiditiesTransactionsTable from '../../components/TransactionsProtocolTable/liquidities'
import { useAllTokenData } from 'state/tokens/hooks'
import { MonoSpace } from 'components/shared'
import { useActiveNetworkVersion } from 'state/application/hooks'
import dayjs from 'dayjs'
import { useWindowSize } from '../../hooks/useWindowSize'

const ChartWrapper = styled.div`
  display: block;
  width: 100%;
  max-width: 100%;
  background: ${({ theme }) => theme.bg0};
  margin-bottom: 30px;
  border-radius: 10px;
`
const ChartKeyWrapper = styled.div`
  margin: 0;
  padding: 20px 15px;
  background: ${({ theme }) => theme.bg3};
  border-radius: 6px;
  text-align: center;
`
const ChartKeyTitle = styled.div`
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 600;
  line-height: 1;
  color: #ffffff;
  padding: 2px 5px;
  margin-left: -5px;
  @media (max-width: 1080px) {
    font-size: 12px;
  }
`
const ChartKeyValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  @media (max-width: 1080px) {
    font-size: 24px;
  }
`
const ChartKeyDate = styled.div`
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  line-height: 1;
  color: #ffffff;
  @media (max-width: 1080px) {
    display: none;
  }
`
const ChartKeyButton = styled.div`
  a {
    color: ${({ theme }) => theme.primary1};
    text-transform: uppercase;
    text-decoration: none;
    font-weight: 600;
    font-size: 12px;
    line-height: 1;
    padding: 10px 25px;
    cursor: pointer;
    display: inline-block;
    border-radius: 6px;
    margin: 10px auto 0;
    border-radius: 4px;
    background: transparent;
    transition: all 300ms ease-in-out;
    border: 1px solid ${({ theme }) => theme.primary1};
    box-sizing: border-box;
    :hover {
      background: ${({ theme }) => theme.primary1};
      color: ${({ theme }) => theme.white};
    }
    @media (max-width: 1080px) {
      padding: 8px 12px;
    }
  }
`

const ChartType = styled.div`
  text-align: center;
  position: relative;
  margin: 0 auto -16px;
`
const ChartTypeToggle = styled.div`
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

const ChartSize = styled.div`
  text-align: center;
  position: relative;
  margin: -5px 10px 0 0;
`
const ChartSizeOption = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-block;
  font-weight: 500;
  padding: 0px 10px;
  position: relative;
  color: ${({ theme }) => theme.text2};

  &.active {
    color: ${({ theme }) => theme.primary1};
  }
  :hover:not(.active) {
    color: ${({ theme }) => theme.primary1};
  }
`
const TransactionsListType = styled.div`
  text-align: center;
  position: relative;
  margin: 40px auto -16px;
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

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()

  useAggregateOverviewData()

  const [activeNetwork] = useActiveNetworkVersion()

  const [protocolData] = useProtocolData()
  const [chartData] = useProtocolChartData()
  const [transactions] = useProtocolTransactions()
  const { width, height } = useWindowSize()

  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [leftLabel, setLeftLabel] = useState<string | undefined>()
  const [rightLabel, setRightLabel] = useState<string | undefined>()
  const [isVolumeChart, setIsVolumeChart] = useState<boolean>(false)
  const [liquidityChartPeriod, setLiquidityChartPeriod] = useState<number>(0)
  const [volumeChartPeriod, setVolumeChartPeriod] = useState<number>(0)
  const [chartIntervals, setChartIntervals] = useState<number>(7)

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

  // set visible chart
  const setChartType = () => setIsVolumeChart(!isVolumeChart)

  // set visible table
  const [isSwapsChart, setIsSwapTable] = useState<boolean>(false)
  const setTableType = () => setIsSwapTable(!isSwapsChart)

  // set chart intervals
  useEffect(() => {
    if (width && width < 760) {
      setChartIntervals(4)
    } else {
      setChartIntervals(7)
    }
  }, [width])

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (!volumeHover && protocolData) {
      setVolumeHover(protocolData.totalVolumeUSD)
    }
  }, [protocolData, volumeHover])

  const formattedLiquidityData = useMemo(() => {
    if (chartData) {
      setLiquidityHover(chartData[chartData.length - 1].totalLiquidityUSD)
      return chartData.slice(liquidityChartPeriod).map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.totalLiquidityUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData, liquidityChartPeriod])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      if (protocolData) {
        setVolumeHover(protocolData.totalVolumeUSD)
      }
      return chartData.slice(volumeChartPeriod).map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.dailyVolumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData, volumeChartPeriod, protocolData])

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((t) => t.data)
      .filter(notEmpty)
  }, [allTokens])

  return (
    <PageWrapper>
      <ThemedBackgroundGlobal />
      <AutoColumn gap="16px">
        <ChartType>
          <ChartTypeToggle className={isVolumeChart ? '' : 'active'} onClick={setChartType}>
            Liquidity
          </ChartTypeToggle>
          <ChartTypeToggle className={isVolumeChart ? 'active' : ''} onClick={setChartType}>
            Volume
          </ChartTypeToggle>
        </ChartType>
        <ResponsiveRow>
          {!isVolumeChart && (
            <ChartWrapper>
              <LineChart
                data={formattedLiquidityData}
                height={220}
                minHeight={332}
                interval={chartIntervals}
                color={activeNetwork.primaryColor}
                value={liquidityHover}
                label={leftLabel}
                setValue={setLiquidityHover}
                setLabel={setLeftLabel}
                topLeft={
                  <ChartKeyWrapper>
                    <ChartKeyTitle>Behodler Liquidity</ChartKeyTitle>
                    <ChartKeyValue>{formatDollarAmount(liquidityHover, 2, true)}</ChartKeyValue>
                    <ChartKeyDate>
                      {leftLabel ? <div>{leftLabel}</div> : <div>{dayjs().format('MMM D, YYYY')}</div>}
                    </ChartKeyDate>
                    <ChartKeyButton>
                      <a href="https://app.behodler.io" target="_blank" rel="noreferrer">
                        Add liquidity
                      </a>
                    </ChartKeyButton>
                  </ChartKeyWrapper>
                }
                topRight={
                  <ChartSize>
                    <ChartSizeOption
                      onClick={() => setLiquidityChartPeriod(-7)}
                      className={liquidityChartPeriod === -7 ? 'active' : ''}
                    >
                      Week
                    </ChartSizeOption>
                    <ChartSizeOption
                      onClick={() => setLiquidityChartPeriod(-30)}
                      className={liquidityChartPeriod === -30 ? 'active' : ''}
                    >
                      Month
                    </ChartSizeOption>
                    <ChartSizeOption
                      onClick={() => setLiquidityChartPeriod(-90)}
                      className={liquidityChartPeriod === -90 ? 'active' : ''}
                    >
                      3 Months
                    </ChartSizeOption>
                    <ChartSizeOption
                      onClick={() => setLiquidityChartPeriod(0)}
                      className={liquidityChartPeriod === 0 ? 'active' : ''}
                    >
                      MAX
                    </ChartSizeOption>
                  </ChartSize>
                }
              />
            </ChartWrapper>
          )}
          {isVolumeChart && (
            <ChartWrapper>
              <BarChart
                height={220}
                minHeight={332}
                interval={chartIntervals}
                data={formattedVolumeData}
                color={theme.primary1}
                setValue={setVolumeHover}
                setLabel={setRightLabel}
                value={volumeHover}
                label={rightLabel}
                topLeft={
                  <ChartKeyWrapper>
                    <ChartKeyTitle>Behodler Volume</ChartKeyTitle>
                    <ChartKeyValue>{formatDollarAmount(volumeHover, 2, true)}</ChartKeyValue>
                    <ChartKeyDate>
                      {leftLabel ? <div>{leftLabel}</div> : <div>{dayjs().format('MMM D, YYYY')}</div>}
                    </ChartKeyDate>
                    <ChartKeyButton>
                      <a href="https://app.behodler.io" target="_blank" rel="noreferrer">
                        Swap tokens
                      </a>
                    </ChartKeyButton>
                  </ChartKeyWrapper>
                }
                topRight={
                  <ChartSize>
                    <ChartSizeOption
                      onClick={() => setVolumeChartPeriod(-7)}
                      className={volumeChartPeriod === -7 ? 'active' : ''}
                    >
                      Week
                    </ChartSizeOption>
                    <ChartSizeOption
                      onClick={() => setVolumeChartPeriod(-30)}
                      className={volumeChartPeriod === -30 ? 'active' : ''}
                    >
                      Month
                    </ChartSizeOption>
                    <ChartSizeOption
                      onClick={() => setVolumeChartPeriod(-90)}
                      className={volumeChartPeriod === -90 ? 'active' : ''}
                    >
                      3 Months
                    </ChartSizeOption>
                    <ChartSizeOption
                      onClick={() => setVolumeChartPeriod(0)}
                      className={volumeChartPeriod === 0 ? 'active' : ''}
                    >
                      MAX
                    </ChartSizeOption>
                  </ChartSize>
                }
              />
            </ChartWrapper>
          )}
        </ResponsiveRow>
        <RowBetween>
          <TYPE.main>Top Tokens</TYPE.main>
          <StyledInternalLink to="tokens">Explore</StyledInternalLink>
        </RowBetween>
        <TokenTable tokenDatas={formattedTokens} />
        {/* <RowBetween>
          <TYPE.main>Top Pools</TYPE.main>
          <StyledInternalLink to="pools">Explore</StyledInternalLink>
        </RowBetween>
        <PoolTable poolDatas={poolDatas} /> */}
        {transactions ? (
          <RowBetween>
            <TransactionsListType>
              <TransactionsTypeToggle className={isSwapsChart ? '' : 'active'} onClick={setTableType}>
                Swaps
              </TransactionsTypeToggle>
              <TransactionsTypeToggle className={isSwapsChart ? 'active' : ''} onClick={setTableType}>
                Liquidity
              </TransactionsTypeToggle>
            </TransactionsListType>
          </RowBetween>
        ) : null}
        {/* {transactions ? <TransactionsTable transactions={transactions} color={activeNetwork.primaryColor} /> : null} */}
        {transactions && isSwapsChart ? (
          <LiquiditiesTransactionsTable transactions={transactions} color={activeNetwork.primaryColor} />
        ) : null}
        {transactions && !isSwapsChart ? (
          <SwapsTransactionsTable transactions={transactions} color={activeNetwork.primaryColor} />
        ) : null}
      </AutoColumn>
    </PageWrapper>
  )
}
