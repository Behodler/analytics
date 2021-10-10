import React, {
  // useMemo,
  useState,
  useEffect,
} from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  useTokenData,
  // usePoolsForToken,
  // useTokenChartData,
  // useTokenPriceData,
  useTokenTransactions,
} from 'state/tokens/hooks'
import styled from 'styled-components'
import { useColor } from 'hooks/useColor'
import ReactGA from 'react-ga'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import {
  shortenAddress,
  getEtherscanLink,
  // currentTimestamp
} from 'utils'
import { AutoColumn, CustomColumn } from 'components/Column'
import { CustomRow, RowBetween, RowFixed, AutoRow, RowFlat } from 'components/Row'
import { TYPE, StyledInternalLink } from 'theme'
import Loader, { LocalLoader } from 'components/Loader'
import { ExternalLink } from 'react-feather'
import { ExternalLink as StyledExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { ButtonPrimary, ButtonGray, SavedIcon } from 'components/Button'
import { DarkGreyCard, LightGreyCard } from 'components/Card'
// import { usePoolDatas } from 'state/pools/hooks'
// import { unixToDate } from 'utils/date'
import LiquiditiesTransactionsTable from 'components/TransactionsProtocolTable/liquidities'
import SwapsTransactionsTable from 'components/TransactionsProtocolTable/swaps'
import { useSavedTokens } from 'state/user/hooks'
// import { ONE_HOUR_SECONDS, TimeWindow } from 'constants/intervals'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { EthereumNetworkInfo } from 'constants/networks'
import { GenericImageWrapper } from 'components/Logo'
// import { SmallOptionButton } from '../../components/Button'
import { useCMCLink } from 'hooks/useCMCLink'
import CMCLogo from '../../assets/images/cmc.png'

const PriceText = styled(TYPE.label)`
  font-size: 36px;
  line-height: 0.8;
`

const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

const StyledCMCLogo = styled.img`
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const TransactionsListType = styled.div`
  text-align: center;
  position: relative;
  margin: 0px auto -16px;
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

// enum ChartView {
//   TVL,
//   VOL,
//   PRICE,
// }

// const DEFAULT_TIME_WINDOW = TimeWindow.WEEK

export default function TokenPage({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) {
  const [activeNetwork] = useActiveNetworkVersion()

  address = address.toLowerCase()
  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()

  // set visible table
  const [isSwapsChart, setIsSwapTable] = useState<boolean>(false)
  const setTableType = () => setIsSwapTable(!isSwapsChart)

  // scroll on page view
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tokenData = useTokenData(address)
  // const poolsForToken = usePoolsForToken(address)
  // const poolDatas = usePoolDatas(poolsForToken ?? [])
  const transactions = useTokenTransactions(address)
  // const chartData = useTokenChartData(address)

  // check for link to CMC
  const cmcLink = useCMCLink(address)

  // format for chart component
  // const formattedTvlData = useMemo(() => {
  //   if (chartData) {
  //     return chartData.map((day) => {
  //       return {
  //         time: unixToDate(day.date),
  //         value: day.totalValueLockedUSD,
  //       }
  //     })
  //   } else {
  //     return []
  //   }
  // }, [chartData])
  // const formattedVolumeData = useMemo(() => {
  //   if (chartData) {
  //     return chartData.map((day) => {
  //       return {
  //         time: unixToDate(day.date),
  //         value: day.dailyVolumeUSD,
  //       }
  //     })
  //   } else {
  //     return []
  //   }
  // }, [chartData])

  // chart labels
  // const [view, setView] = useState(ChartView.PRICE)
  // const [latestValue, setLatestValue] = useState<number | undefined>()
  // const [valueLabel, setValueLabel] = useState<string | undefined>()
  // const [timeWindow] = useState(DEFAULT_TIME_WINDOW)

  // pricing data
  // const priceData = useTokenPriceData(address, ONE_HOUR_SECONDS, timeWindow)
  // const adjustedToCurrent = useMemo(() => {
  //   if (priceData && tokenData && priceData.length > 0) {
  //     const adjusted = Object.assign([], priceData)
  //     adjusted.push({
  //       time: currentTimestamp() / 1000,
  //       open: priceData[priceData.length - 1].close,
  //       close: tokenData?.priceUSD,
  //       high: tokenData?.priceUSD,
  //       low: priceData[priceData.length - 1].close,
  //     })
  //     return adjusted
  //   } else {
  //     return undefined
  //   }
  // }, [priceData, tokenData])

  // watchlist
  const [savedTokens, addSavedToken] = useSavedTokens()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      {tokenData ? (
        !tokenData.exists ? (
          <LightGreyCard style={{ textAlign: 'center' }}>
            No pool has been created with this token yet. Create one
            <StyledExternalLink style={{ marginLeft: '4px' }} href={`https://app.behodler.io/#/add/${address}`}>
              here.
            </StyledExternalLink>
          </LightGreyCard>
        ) : (
          <AutoColumn gap="32px">
            <AutoColumn gap="32px">
              <RowBetween>
                <AutoRow gap="4px">
                  <StyledInternalLink to={networkPrefix(activeNetwork)}>
                    <TYPE.main>{`Home > `}</TYPE.main>
                  </StyledInternalLink>
                  <StyledInternalLink to={networkPrefix(activeNetwork) + 'tokens'}>
                    <TYPE.label>{` Tokens `}</TYPE.label>
                  </StyledInternalLink>
                  <TYPE.main>{` > `}</TYPE.main>
                  <TYPE.label>{` ${tokenData.symbol} `}</TYPE.label>
                  <StyledExternalLink href={getEtherscanLink(1, address, 'address', activeNetwork)}>
                    <TYPE.main>{` (${shortenAddress(address)}) `}</TYPE.main>
                  </StyledExternalLink>
                </AutoRow>
                <RowFixed align="center" justify="center">
                  <SavedIcon fill={savedTokens.includes(address)} onClick={() => addSavedToken(address)} />
                  {cmcLink && (
                    <StyledExternalLink
                      href={cmcLink}
                      style={{ marginLeft: '12px' }}
                      onClickCapture={() => {
                        ReactGA.event({
                          category: 'CMC',
                          action: 'CMC token page click',
                        })
                      }}
                    >
                      <StyledCMCLogo src={CMCLogo} />
                    </StyledExternalLink>
                  )}
                  <StyledExternalLink href={getEtherscanLink(1, address, 'address', activeNetwork)}>
                    <ExternalLink stroke={theme.text2} size={'17px'} style={{ marginLeft: '12px' }} />
                  </StyledExternalLink>
                </RowFixed>
              </RowBetween>
              <ResponsiveRow align="flex-end">
                <AutoColumn gap="md">
                  <RowFixed gap="lg">
                    <CurrencyLogo address={address} />
                    <TYPE.label ml={'10px'} fontSize="20px">
                      {tokenData.name}
                    </TYPE.label>
                    <TYPE.main ml={'6px'} fontSize="20px">
                      ({tokenData.symbol})
                    </TYPE.main>
                    {activeNetwork === EthereumNetworkInfo ? null : (
                      <GenericImageWrapper src={activeNetwork.imageURL} style={{ marginLeft: '8px' }} size={'26px'} />
                    )}
                  </RowFixed>
                  <RowFlat style={{ marginTop: '8px' }}>
                    <PriceText mr="10px"> {formatDollarAmount(tokenData.priceUSD)}</PriceText>
                    {/* (<Percent value={tokenData.priceUSDChange} />) */}
                  </RowFlat>
                </AutoColumn>
                {activeNetwork !== EthereumNetworkInfo ? null : (
                  <RowFixed>
                    <StyledExternalLink href={`https://app.behodler.io/#/swap?inputCurrency=${address}`}>
                      <ButtonPrimary width="100px" bgColor={backgroundColor} style={{ height: '44px' }}>
                        Swap
                      </ButtonPrimary>
                    </StyledExternalLink>
                    <StyledExternalLink href={`https://app.behodler.io/#/add/${address}`}>
                      <ButtonGray width="170px" ml="12px" height={'100%'} style={{ height: '44px' }}>
                        Add Liquidity
                      </ButtonGray>
                    </StyledExternalLink>
                  </RowFixed>
                )}
              </ResponsiveRow>
            </AutoColumn>
            <CustomRow
              gap={35}
              align="stretch"
              justify="center"
              directionMobile="column"
              justifyMobile="center"
              alignMobile="center"
            >
              <CustomColumn grow="grow">
                <DarkGreyCard>
                  <CustomColumn align="center">
                    <TYPE.main fontWeight={400}>Total Liquidity</TYPE.main>
                    <TYPE.label fontSize="32px">{formatDollarAmount(tokenData.totalLiquidityUSD)}</TYPE.label>
                    {/* <Percent value={tokenData.totalLiquidityUSDChange} /> */}
                  </CustomColumn>
                </DarkGreyCard>
              </CustomColumn>
              <CustomColumn grow="grow" align="center">
                <DarkGreyCard>
                  <CustomColumn align="center">
                    <TYPE.main fontWeight={400}>Total Volume</TYPE.main>
                    <TYPE.label fontSize="32px">
                      {tokenData.volume > 0 ? formatAmount(tokenData.volume) : '-'}
                    </TYPE.label>
                  </CustomColumn>
                </DarkGreyCard>
              </CustomColumn>
              <CustomColumn grow="grow" align="center">
                <DarkGreyCard>
                  <CustomColumn align="center">
                    <TYPE.main fontWeight={400}>Total USD Volume</TYPE.main>
                    <TYPE.label fontSize="32px">
                      {tokenData.usdVolume > 0 ? formatDollarAmount(tokenData.usdVolume) : '-'}
                    </TYPE.label>
                  </CustomColumn>
                </DarkGreyCard>
              </CustomColumn>
              <CustomColumn grow="grow" align="center">
                <DarkGreyCard>
                  <CustomColumn align="center">
                    <TYPE.main fontWeight={400}>Total Supply</TYPE.main>
                    <TYPE.label fontSize="32px">
                      {tokenData.totalSupply > 0 ? formatAmount(tokenData.totalSupply) : '-'}
                    </TYPE.label>
                  </CustomColumn>
                </DarkGreyCard>
              </CustomColumn>
            </CustomRow>
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
            ) : (
              <LocalLoader fill={false} />
            )}
            {/* {transactions ? <TransactionsTable transactions={transactions} color={activeNetwork.primaryColor} /> : null} */}
            {transactions && isSwapsChart ? (
              <LiquiditiesTransactionsTable transactions={transactions} color={activeNetwork.primaryColor} />
            ) : null}
            {transactions && !isSwapsChart ? (
              <SwapsTransactionsTable transactions={transactions} color={activeNetwork.primaryColor} />
            ) : null}
          </AutoColumn>
        )
      ) : (
        <Loader />
      )}
    </PageWrapper>
  )
}
