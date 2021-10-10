import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { MenuItem } from './MenuItems'

const MainMenuStyled = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};

  nav {
    width: 100%;
    padding-top: 12px;
  }
  nav a {
    color: ${({ theme }) => theme.white};
    padding: 0.6rem 1rem;
    font-size: 1.05em;
    font-weight: 600;
    display: inline-block;
    transition: all 300ms ease-in-out;
    text-decoration: none;
  }
  nav a:hover {
    color: ${({ theme }) => theme.primary1};
  }
  nav a.menu_outline {
    margin-left: 15px;
    padding: 0.6rem 2rem;
    border: 1px solid ${({ theme }) => theme.primary1};
    border-radius: '4px';
    background: transparent;
    transition: all 300ms ease-in-out;
  }
  nav a.menu_outline:hover {
    color: ${({ theme }) => theme.white};
    background: ${({ theme }) => theme.primary1};
  }
`

const MainMenu = ({ items }: { items: MenuItem[] }) => {
  return (
    <MainMenuStyled>
      <nav>
        {items.map((item: MenuItem) => {
          if (item.type === 'internal') {
            return (
              <NavLink key={item.path} to={item.path} className={item.class}>
                {item.label}
              </NavLink>
            )
          } else {
            return (
              <a key={item.path} href={item.path} className={item.class} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            )
          }
        })}
      </nav>
    </MainMenuStyled>
  )
}
export default MainMenu
