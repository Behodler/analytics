import styled from 'styled-components'
import { Box } from 'rebass/styled-components'
import { MEDIA_WIDTHS } from 'theme'

const Row = styled(Box)<{
  width?: string
  align?: string
  justify?: string
  padding?: string
  border?: string
  borderRadius?: string
}>`
  width: ${({ width }) => width ?? '100%'};
  display: flex;
  padding: 0;
  align-items: ${({ align }) => align ?? 'center'};
  justify-content: ${({ justify }) => justify ?? 'flex-start'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export const RowBetween = styled(Row)`
  justify-content: space-between;
`

export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
`

export const AutoRow = styled(Row)<{ gap?: string; justify?: string }>`
  flex-wrap: wrap;
  margin: ${({ gap }) => gap && `-${gap}`};
  justify-content: ${({ justify }) => justify && justify};

  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`

export const RowFixed = styled(Row)<{ gap?: string; justify?: string }>`
  width: fit-content;
  margin: ${({ gap }) => gap && `-${gap}`};
`

export const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    row-gap: 1rem;
  `};
`

export const CustomRow = styled.div<{
  width?: string
  align?: string
  justify?: string
  padding?: string
  border?: string
  borderRadius?: string
  wrap?: string
  gap?: number
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | 'initial' | 'inherit'
  directionMobile?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | 'initial' | 'inherit'
  justifyMobile?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  alignMobile?: string
}>`
  width: ${({ width }) => width ?? '100%'};
  display: flex;
  padding: 0;
  align-items: ${({ align }) => align ?? 'center'};
  justify-content: ${({ justify }) => justify ?? 'flex-start'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
  flex-wrap: ${({ wrap }) => (wrap ? wrap : 'nowrap')};
  flex-direction: ${({ direction }) => (direction ? direction : 'row')};
  position: relative;

  > *:first-child {
    padding-left: 0px;
  }
  > *:last-child {
    padding-right: 0px;
  }
  > * {
    padding: ${({ gap }) => (gap ? gap / 2 : 0)}px;
  }

  @media (max-width: ${MEDIA_WIDTHS.upToMedium}px) {
    width: 100%;
    justify-content: ${({ justifyMobile }) => justifyMobile ?? 'center'};
    align-items: ${({ alignMobile }) => alignMobile ?? 'center'};
    flex-direction: ${({ directionMobile }) => (directionMobile ? directionMobile : 'column')};

    ${({ directionMobile }) => {
      if (directionMobile === 'row') {
        return `> * {}`
      } else {
        return `> * {
            padding-left: 0;
            padding-right: 0;
        }`
      }
    }}
  }
`

export default Row
