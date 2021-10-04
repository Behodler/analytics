import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { DarkGreyCard } from 'components/Card'
import Loader from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { shortenAddress, getEtherscanLink } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { TransactionType, TransactionsProtocol, TransactionLiquidities } from 'types'
import { formatTime } from 'utils/date'
import { RowFixed } from 'components/Row'
import { ExternalLink, TYPE } from 'theme'
import { PageButtons, Arrow, Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import HoverInlineText from 'components/HoverInlineText'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { OptimismNetworkInfo } from 'constants/networks'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 1.5fr repeat(5, 1fr);

  @media screen and (max-width: 940px) {
    grid-template-columns: 1.5fr repeat(4, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1.5fr repeat(2, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1.5fr repeat(1, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }
`

const SortText = styled.button<{ active: boolean }>`
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  margin-right: 0.75rem !important;
  border: none;
  background-color: transparent;
  font-size: 1rem;
  padding: 0px;
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text3)};
  outline: none;
  @media screen and (max-width: 600px) {
    font-size: 14px;
  }
`

const SORT_FIELD = {
  amount: 'amount',
  value: 'value',
  totalLiquidity: 'totalLiquidity',
  scx: 'scx',
  timestamp: 'timestamp',
}

const DataRow = ({ transaction, color }: { transaction: TransactionLiquidities; color?: string }) => {
  const abs0 = Math.abs(transaction.amount)
  const abs1 = Math.abs(transaction.totalLiquidity)
  const abs2 = Math.abs(transaction.scx)
  const [activeNetwork] = useActiveNetworkVersion()
  const theme = useTheme()

  // amount: 'amount',
  // value: 'value',
  // totalLiquidity: 'totalLiquidity',
  // scx: 'scx',
  // timestamp: 'timestamp',

  return (
    <ResponsiveGrid>
      <ExternalLink href={getEtherscanLink(1, transaction.hash, 'transaction', activeNetwork)}>
        <Label color={color ?? theme.blue1} fontWeight={400}>
          {transaction.direction === TransactionType.MINT
            ? `Add ${transaction.token0Symbol}`
            : `Remove ${transaction.token0Symbol}`}
        </Label>
      </ExternalLink>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs0)} ${transaction.token0Symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        {formatDollarAmount(transaction.value)}
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs1)} ${transaction.token0Symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs2)} SCX`} maxCharacters={16} />
      </Label>
      <Label end={1} fontWeight={400}>
        {formatTime(transaction.timestamp, activeNetwork === OptimismNetworkInfo ? 8 : 0)}
      </Label>
    </ResponsiveGrid>
  )
}

export default function LiquiditiesTransactionsTable({
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
  const liquidities = transactions.liquidities

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.timestamp)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  useEffect(() => {
    let extraPages = 1
    if (liquidities.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(liquidities.length / maxItems) + extraPages)
  }, [maxItems, liquidities])

  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(undefined)

  const sortedTransactions = useMemo(() => {
    return liquidities
      ? liquidities
          .slice()
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof TransactionLiquidities] > b[sortField as keyof TransactionLiquidities]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [liquidities, maxItems, page, sortField, sortDirection, txFilter])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )

  if (!liquidities) {
    return <Loader />
  }

  return (
    <Wrapper>
      <AutoColumn gap="16px">
        <ResponsiveGrid>
          <RowFixed>Action</RowFixed>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.amount)}>
            Amount {arrow(SORT_FIELD.amount)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.value)}>
            Value {arrow(SORT_FIELD.value)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.totalLiquidity)}>
            Total Liquidity {arrow(SORT_FIELD.totalLiquidity)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.scx)}>
            SCX {arrow(SORT_FIELD.scx)}
          </ClickableText>
          <ClickableText color={theme.text2} end={1} onClick={() => handleSort(SORT_FIELD.timestamp)}>
            Time {arrow(SORT_FIELD.timestamp)}
          </ClickableText>
        </ResponsiveGrid>
        <Break />

        {sortedTransactions.map((t, i) => {
          if (t) {
            return (
              <React.Fragment key={i}>
                <DataRow transaction={t} color={color} />
                <Break />
              </React.Fragment>
            )
          }
          return null
        })}
        {sortedTransactions.length === 0 ? <TYPE.main>No Transactions</TYPE.main> : undefined}
        <PageButtons>
          <div
            onClick={() => {
              setPage(page === 1 ? page : page - 1)
            }}
          >
            <Arrow faded={page === 1 ? true : false}>←</Arrow>
          </div>
          <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
          <div
            onClick={() => {
              setPage(page === maxPage ? page : page + 1)
            }}
          >
            <Arrow faded={page === maxPage ? true : false}>→</Arrow>
          </div>
        </PageButtons>
      </AutoColumn>
    </Wrapper>
  )
}
