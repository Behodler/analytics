import React, { Dispatch, SetStateAction, ReactNode } from 'react'
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, ReferenceLine } from 'recharts'
import styled from 'styled-components'
import Card from 'components/Card'
import { RowBetween } from 'components/Row'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useTheme from 'hooks/useTheme'
import { MonoSpace } from 'components/shared'
import { formatDollarAmount } from 'utils/numbers'
import { darken } from 'polished'
dayjs.extend(utc)

const DEFAULT_HEIGHT = 380

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  position: relative;
  padding: 2.5rem 0rem 1rem;
  display: flex;
  background-color: ${({ theme }) => theme.bg0}
  flex-direction: column;
  > * {
    font-size: 1rem;
  }

  .recharts-cartesian-axis-ticks text {
    fill: #fff !important;
    font-weight: 500;
  }
`

const ChartKeyTopLeft = styled.div`
  position: absolute;
  z-index: 9;
  top: 15px;
  left: 25px;
  @media (max-width: 1080px) {
    top: 40px;
    left: 10px;
  }
`

const ChartKeyTopRight = styled.div`
  position: absolute;
  z-index: 9;
  top: 15px;
  right: 25px;
  @media (max-width: 1080px) {
    top: 40px;
    right: 10px;
  }
`

const ChartKeyBottomLeft = styled.div`
  position: absolute;
  z-index: 9;
  bottom: 15px;
  left: 25px;
  @media (max-width: 1080px) {
    bottom: 40px;
    left: 10px;
  }
`

const ChartKeyBottomRight = styled.div`
  position: absolute;
  z-index: 9;
  bottom: 15px;
  right: 25px;
  @media (max-width: 1080px) {
    bottom: 40px;
    right: 10px;
  }
`

const ChartTooltip = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
  text-align: center;
  background: ${({ theme }) => theme.bg0};
  border-radius: 6px;

  .value {
    color: ${({ theme }) => theme.white};
    font-weight: 600;
    padding: 0;
    line-height: 1.2;
    margin: 0 0 3px;
  }

  .date {
    color: ${({ theme }) => theme.primaryText1};
    font-weight: 600;
    padding: 0;
    line-height: 1;
    margin: 0;
    font-size: 11px;
  }
`

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const Chart = ({
  data,
  color = '#56B2A4',
  value,
  label,
  setValue,
  setLabel,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme()
  const parsedValue = value

  // Interval to display tick labels and tick reference lines
  const interval = 7

  const CustomTooltip = ({ active, payload }: any): any => {
    if (active && payload && payload.length) {
      // if (setValue && parsedValue !== payload[0].payload.value) {
      //   setValue(payload[0].payload.value)
      // }
      // const formattedTime = format(new Date(payload[0].payload.time), 'MMM d, yyyy')
      // if (setLabel && label !== formattedTime) setLabel(formattedTime)
      return (
        <ChartTooltip>
          <p className="value">
            <MonoSpace>{formatDollarAmount(payload[0].payload.value, 2)}</MonoSpace>
          </p>
          <p className="date">{dayjs(new Date(payload[0].payload.time)).format('MMM D, YYYY')}</p>
        </ChartTooltip>
      )
    }
    return null
  }

  return (
    <Wrapper minHeight={minHeight} {...rest}>
      <ChartKeyTopLeft>{topLeft ?? null}</ChartKeyTopLeft>
      <ChartKeyTopRight>{topRight ?? null}</ChartKeyTopRight>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={380}
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined)
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis type="number" domain={['auto', 'auto']} hide={true} />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tickFormatter={(time) => {
              let timeFormat = ''
              Array(interval - 1)
                .fill(null)
                .map((value, index) => {
                  if (data[Math.round((data.length / interval) * (index + 1))].time === time) {
                    // Add fix for last reference line on weekly view
                    if (data.length === 7 && index === interval - 2) {
                      return null
                    }
                    timeFormat = dayjs(time).format('D MMM')
                  }
                  return null
                })
              return timeFormat
            }}
            interval={0}
          />
          {Array(interval - 1)
            .fill(null)
            .map((value, index) => {
              // Add fix for last reference line on weekly view
              if (data.length === 7 && index === interval - 2) {
                return null
              }
              return (
                <ReferenceLine
                  key={index}
                  x={data[Math.round((data.length / interval) * (index + 1))].time}
                  stroke="#332670"
                />
              )
            })}
          <Tooltip content={<CustomTooltip />} />
          <Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      <ChartKeyBottomLeft>{bottomLeft ?? null}</ChartKeyBottomLeft>
      <ChartKeyBottomRight>{bottomRight ?? null}</ChartKeyBottomRight>
    </Wrapper>
  )
}

export default Chart
