import { ChartDayData } from '../../types/index'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useActiveNetworkVersion, useClients } from 'state/application/hooks'
import { arbitrumClient } from 'apollo/client'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const GLOBAL_CHART = gql`
  query behodlerDayDatas($startTime: Int!, $skip: Int!) {
    behodlerDayDatas(
      first: 1000
      skip: $skip
      subgraphError: allow
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

interface ChartResults {
  behodlerDayDatas: {
    date: number
    dailyVolumeUSD: string
    totalLiquidityUSD: string
  }[]
}

async function fetchChartData(client: ApolloClient<NormalizedCacheObject>) {
  let data: {
    date: number
    dailyVolumeUSD: string
    totalLiquidityUSD: string
  }[] = []
  const startTimestamp = client === arbitrumClient ? 1630423606 : 1619170975
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const { data: chartResData, error, loading } = await client.query<ChartResults>({
        query: GLOBAL_CHART,
        variables: {
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (!loading) {
        skip += 1000
        if (chartResData.behodlerDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.behodlerDayDatas)
        }
      }
    }
  } catch {
    error = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: ChartDayData }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      accum[roundedDate] = {
        date: dayData.date,
        dailyVolumeUSD: parseFloat(dayData.dailyVolumeUSD),
        totalLiquidityUSD: parseFloat(dayData.totalLiquidityUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestLiquidity = firstEntry?.totalLiquidityUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (
        formattedExisting[currentDayIndex] &&
        +formattedExisting[currentDayIndex].totalLiquidityUSD === 0 &&
        nextDay > firstEntry.date
      ) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          dailyVolumeUSD: 0,
          totalLiquidityUSD: latestLiquidity,
        }
      } else if (formattedExisting[currentDayIndex]) {
        latestLiquidity = formattedExisting[currentDayIndex].totalLiquidityUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => {
      return formattedExisting[parseInt(key)]
    })

    return {
      data: dateMap,
      error: false,
    }
  } else {
    return {
      data: undefined,
      error,
    }
  }
}

/**
 * Fetch historic chart data
 */
export function useFetchGlobalChartData(): {
  error: boolean
  data: ChartDayData[] | undefined
} {
  const [data, setData] = useState<{ [network: string]: ChartDayData[] | undefined }>()
  const [error, setError] = useState(false)
  const { dataClient } = useClients()

  const [activeNetworkVersion] = useActiveNetworkVersion()
  const indexedData = data?.[activeNetworkVersion.id]

  useEffect(() => {
    async function fetch() {
      const { data, error } = await fetchChartData(dataClient)
      if (data && !error) {
        setData({
          [activeNetworkVersion.id]: data,
        })
      } else if (error) {
        setError(true)
      }
    }
    if (!indexedData && !error) {
      fetch()
    }
  }, [data, error, dataClient, indexedData, activeNetworkVersion.id])

  return {
    error,
    data: indexedData,
  }
}
