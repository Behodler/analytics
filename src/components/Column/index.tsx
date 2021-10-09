import styled from 'styled-components'
import { MEDIA_WIDTHS } from 'theme'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`

export const CustomColumn = styled.div<{
  width?: string
  align?: string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  grow?: 'grow' | 0
  justifyMobile?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  alignMobile?: string
  widthMobile?: string
}>`
  width: ${({ width }) => (width ? width : 'initial')};
  display: flex;
  flex-direction: column;
  justify-items: ${({ justify }) => justify && justify};
  align-items: ${({ align }) => align && align};
  flex-grow: ${({ grow }) => (grow === 'grow' ? 1 : 0)};
  flex-basis: ${({ grow }) => (grow === 'grow' ? 0 : 1)};

  @media (max-width: ${MEDIA_WIDTHS.upToMedium}px) {
    width: ${({ widthMobile }) => (widthMobile ? widthMobile : '100%')};
    justify-items: ${({ justifyMobile }) => justifyMobile && justifyMobile};
    align-items: ${({ alignMobile }) => alignMobile && alignMobile};
  }
`

export default Column
