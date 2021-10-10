import React, { Dispatch, SetStateAction, ReactNode } from 'react'
import { BarChart, ResponsiveContainer, XAxis, Tooltip, Bar } from 'recharts'
import styled from 'styled-components'
import Card from 'components/Card'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { MonoSpace } from 'components/shared'
import { formatDollarAmount } from 'utils/numbers'
import useTheme from 'hooks/useTheme'
dayjs.extend(utc)

const DEFAULT_HEIGHT = 380

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  position: relative;
  padding: 2.5rem 1rem 1rem;
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
    top: 12px;
    right: 10px;
  }
`

const ChartKeyBottomLeft = styled.div`
  position: absolute;
  z-index: 9;
  bottom: 15px;
  left: 25px;
  @media (max-width: 1080px) {
    bottom: 12px;
    left: 10px;
  }
`

const ChartKeyBottomRight = styled.div`
  position: absolute;
  z-index: 9;
  bottom: 15px;
  right: 25px;
  @media (max-width: 1080px) {
    bottom: 12px;
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
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of value
  value?: number
  label?: string
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
  interval?: number | undefined
} & React.HTMLAttributes<HTMLDivElement>

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  )
}

const Chart = ({
  data,
  color = '#56B2A4',
  setValue,
  setLabel,
  value,
  label,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  interval,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme()
  // const parsedValue = value

  // Interval to display tick labels and tick reference lines
  let axisInterval = 7
  if (interval) {
    axisInterval = interval
  }

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
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined)
            setValue && setValue(undefined)
          }}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tickFormatter={(time) => {
              let timeFormat = ''
              Array(axisInterval - 1)
                .fill(null)
                .map((value, index) => {
                  if (data[Math.round((data.length / axisInterval) * (index + 1))].time === time) {
                    timeFormat = dayjs(time).format('D MMM')
                  }
                  return null
                })
              return timeFormat
            }}
            interval={0}
          />
          {/* <Tooltip
            cursor={{ fill: theme.bg3 }}
            contentStyle={{ display: 'none' }}
            formatter={(value: number, name: string, props: { payload: { time: string; value: number } }) => {
              if (setValue && parsedValue !== props.payload.value) {
                setValue(props.payload.value)
              }
              const formattedTime = dayjs(props.payload.time).format('MMM D, YYYY')
              if (setLabel && label !== formattedTime) setLabel(formattedTime)
            }}
          /> */}
          <Tooltip cursor={{ fill: theme.bg3 }} content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill={color}
            shape={(props) => {
              return <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <ChartKeyBottomLeft>{bottomLeft ?? null}</ChartKeyBottomLeft>
      <ChartKeyBottomRight>{bottomRight ?? null}</ChartKeyBottomRight>
    </Wrapper>
  )
}

export default Chart
