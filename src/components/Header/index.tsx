import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { darken } from 'polished'
import styled from 'styled-components'
// import LogoDark from '../../assets/svg/logo.svg'
import BehodlerLogo from '../../assets/svg/behodler-logo.svg'
import BehodlerLogoTxt from '../../assets/svg/behodler-logo-txt.svg'
import Menu from '../Menu'
import Row, { RowFixed, RowBetween } from '../Row'
import SearchSmall from 'components/Search'
import NetworkDropdown from 'components/Menu/NetworkDropdown'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { networkPrefix } from 'utils/networkPrefix'
import { AutoColumn } from 'components/Column'

const LogoIcon = styled.div`
  width: 180px;

  @media (max-width: 769px) {
    display: none;
  }
`

const LogoText = styled.div`
  display: none;
  width: 120px;
  margin-top: 20px;

  @media (max-width: 769px) {
    display: block;
  }
`

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 0.5rem 1rem;
  z-index: 2;
  transition: all 300ms ease-in-out;
  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
    padding: 0.5rem 1rem;
    width: calc(100%);
    position: relative;
  }

  &.sticky {
    background-color: ${({ theme }) => theme.bg1};

    ${LogoIcon} {
      width: 120px;
    }
    ${LogoText} {
      width: 94px;
      margin-top: 5px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  @media (max-width: 1080px) {
    display: none;
  }
`

const HeaderRow = styled(RowFixed)`
  @media (max-width: 1080px) {
    width: 100%;
  }
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  @media (max-width: 1080px) {
    padding: 0.5rem;
    justify-content: flex-end;
  } ;
`

const Title = styled(NavLink)`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  width: fit-content;
  margin: 0 6px;
  padding: 8px 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    color: ${({ theme }) => theme.primary1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => theme.primary1};
  }
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const SmallContentGrouping = styled.div`
  display: none;
  width: 100%;
  @media (max-width: 1080px) {
    display: initial;
  }
`

export default function Header() {
  const [activeNewtork] = useActiveNetworkVersion()
  const [scroll, setScroll] = useState(false)
  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScroll(window.scrollY > 50)
    })
  }, [])

  return (
    <HeaderFrame className={scroll ? 'sticky' : ''}>
      <HeaderRow>
        <Title to={networkPrefix(activeNewtork)}>
          <LogoIcon>
            <img src={BehodlerLogo} alt="Behodler Logo" />
          </LogoIcon>
          <LogoText>
            <img src={BehodlerLogoTxt} alt="Behodler Logo" />
          </LogoText>
        </Title>
        <SmallContentGrouping>
          <Menu />
        </SmallContentGrouping>
      </HeaderRow>
      <HeaderControls>
        {/* <NetworkDropdown /> */}
        {/* <SearchSmall /> */}
        <HeaderLinks>
          <StyledNavLink
            id={`pool-nav-link`}
            to={networkPrefix(activeNewtork)}
            isActive={(match, { pathname }) => pathname === '/'}
          >
            Overview
          </StyledNavLink>
          {/* <StyledNavLink id={`stake-nav-link`} to={networkPrefix(activeNewtork) + 'pools'}>
            Limbo
          </StyledNavLink> */}
          <StyledNavLink id={`stake-nav-link`} to={networkPrefix(activeNewtork) + 'tokens'}>
            Tokens
          </StyledNavLink>
        </HeaderLinks>
        <Menu />
      </HeaderControls>
    </HeaderFrame>
  )
}
