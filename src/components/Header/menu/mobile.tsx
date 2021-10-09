import React from 'react'
import styled from 'styled-components'

export const MobileStyled = styled.div<{ open: boolean }>`
  position: absolute;
  top: 40px;
  right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: 40px;
  height: 20px;
  padding: 10px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  box-sizing: initial;
  z-index: 10;
  border: 1px solid ${({ theme }) => theme.primary1};
  border-radius: 100%;
  transform: translate(0, -74%);

  ${({ theme }) => theme.mediaMinWidth.upToSmall`
    display: none;
  `};

  &:focus {
    outline: none;
  }

  span {
    width: 60%;
    height: 2px;
    background: ${({ theme }) => theme.white};
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;

    :first-child {
      width: ${({ open }) => (open ? '70%' : '32%')};
      transform: ${({ open }) => (open ? 'rotate(45deg) translate(1px, -5px)' : 'rotate(0)')};
    }

    :nth-child(2) {
      width: 60%;
      opacity: ${({ open }) => (open ? '0' : '1')};
      transform: ${({ open }) => (open ? 'translateX(20px)' : 'translateX(0)')};
    }

    :nth-child(3) {
      width: ${({ open }) => (open ? '70%' : '32%')};
      transform: ${({ open }) => (open ? 'rotate(-45deg) translate(2px, 4px)' : 'rotate(0)')};
    }
  }
`

const Mobile = ({ open, setOpen, ...props }: { open: boolean; setOpen: any }) => {
  const isExpanded = open ? true : false

  return (
    <MobileStyled
      aria-label="Toggle menu"
      aria-expanded={isExpanded}
      open={open}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <span />
      <span />
      <span />
    </MobileStyled>
  )
}

export default Mobile
