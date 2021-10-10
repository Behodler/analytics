import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { MenuItem } from './MenuItems'

const MobileMenuStyled = styled.div<{ open: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.bg1};
  transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(100%)')};
  height: 100vh;
  width: 100%;
  text-align: left;
  padding: 2rem;
  position: fixed;
  z-index: 90;
  top: 0;
  right: 0;
  transition: all 300ms ease-in-out;

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  a {
    font-size: 1.1rem;
    padding: 2rem 0;
    font-weight: bold;
    letter-spacing: 0.2rem;
    color: ${({ theme }) => theme.white};
    text-decoration: none;
    transition: color 0.3s linear;
    line-height: 1.4;
    display: block;
    text-align: center;

    @media (max-width: 767px) {
      font-size: 1.2rem;
    }

    &:hover {
      color: ${({ theme }) => theme.primary1};
    }
  }
`

const MobileMenu = ({ items, open, setOpen }: { items: MenuItem[]; open: boolean; setOpen: any }) => {
  const isHidden = open ? true : false

  return (
    <MobileMenuStyled open={open} aria-label="Mobile menu" aria-hidden={!isHidden}>
      <nav>
        <ul>
          {items.map((item: MenuItem, index) => {
            if (item.type === 'internal') {
              return (
                <li key={index}>
                  <NavLink to={item.path} className={item.class} onClick={() => setOpen(!open)}>
                    {item.label}
                  </NavLink>
                </li>
              )
            } else {
              return (
                <li key={index}>
                  <a href={item.path} className={item.class} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                </li>
              )
            }
          })}
        </ul>
      </nav>
    </MobileMenuStyled>
  )
}

export default MobileMenu
