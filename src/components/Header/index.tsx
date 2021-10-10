import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
// import LogoDark from '../../assets/svg/logo.svg'
import BehodlerLogo from '../../assets/svg/behodler-logo.svg'
import BehodlerLogoTxt from '../../assets/svg/behodler-logo-txt.svg'
import { CustomRow } from '../Row'
import { CustomColumn } from 'components/Column'
import { MainMenu, Mobile, MenuItems } from './Menu'
import { MobileStyled } from './Menu/Mobile'

const LogoIcon = styled.div`
  width: 180px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:none;
  `};
`

const LogoText = styled.div`
  display: none;
  width: 120px;
  margin-top: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:block;
  `};
`

const HeaderStyled = styled.div<{ open: boolean }>`
  max-width: 100%;
  padding: 15px 2.5%;
  margin: 0 auto;
  position: ${({ open }) => (open ? 'sticky' : 'relative')};
  width: 100%;
  top: 0;
  z-index: 99;
  position: fixed;
  transition: all 300ms ease-in-out;

  &.sticky {
    background-color: ${({ theme }) => theme.bg1};

    & nav {
      padding-top: 0 !important;
    }

    ${MobileStyled} {
      top: 21px;
    }

    ${LogoIcon} {
      width: 120px;
    }
    ${LogoText} {
      width: 94px;
      margin-top: 5px;
    }
  }
`

const Header = ({ open, setOpen }: { open: boolean; setOpen: any }) => {
  const [scroll, setScroll] = useState(false)
  useEffect(() => {
    let componentMounted = true
    if (componentMounted) {
      window.addEventListener('scroll', () => {
        setScroll(window.scrollY > 50)
      })
    }
    return () => {
      window.removeEventListener('scroll', () => {
        setScroll(window.scrollY > 50)
      })
      componentMounted = false
    }
  }, [])

  return (
    <HeaderStyled open={open} className={scroll ? 'sticky' : ''}>
      <CustomRow justify="space-between" justifyMobile="center" alignMobile="center" directionMobile="column">
        <CustomColumn justifyMobile="center" alignMobile="center">
          <LogoIcon>
            <a href="/">
              <img src={BehodlerLogo} alt="Behodler Logo" />
            </a>
          </LogoIcon>
          <LogoText>
            <a href="/">
              <img src={BehodlerLogoTxt} alt="Behodler Logo" />
            </a>
          </LogoText>
        </CustomColumn>
        <CustomColumn justifyMobile="center" alignMobile="center">
          <MainMenu items={MenuItems} />
          <Mobile open={open} setOpen={setOpen} />
        </CustomColumn>
      </CustomRow>
    </HeaderStyled>
  )
}

export default Header
