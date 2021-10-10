import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Logo from '../Logo'
import { useCombinedActiveList } from 'state/lists/hooks'
import useHttpLocations from 'hooks/useHttpLocations'
import { useActiveNetworkVersion } from 'state/application/hooks'
import { OptimismNetworkInfo } from 'constants/networks'
import { EYE, SCX, WEIDAI, WETH10, EYE_DAI, SCX_ETH, SCX_EYE } from '../../constants/index'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import EYELogo from '../../assets/images/tokens/eye-logo.png'
import ScarcityLogo from '../../assets/images/tokens/scarcity-logo.png'
import WeidaiLogo from '../../assets/images/tokens/weidai-logo.png'
import EyedaiLogo from '../../assets/images/lps/eyedai.png'
import ScxethLogo from '../../assets/images/lps/scxeth.png'
import ScxeyeLogo from '../../assets/images/lps/scxeye.png'

export const getTokenLogoURL = (address: string) => {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
}

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.text4};
`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledBehodlerLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export default function CurrencyLogo({
  address,
  size = '24px',
  style,
  ...rest
}: {
  address?: string
  size?: string
  style?: React.CSSProperties
}) {
  // useOptimismList()
  const optimismList = useCombinedActiveList()?.[10]
  const arbitrumList = useCombinedActiveList()?.[42161]

  const [activeNetwork] = useActiveNetworkVersion()

  const checkSummed = isAddress(address)

  const optimismURI = useMemo(() => {
    if (checkSummed && optimismList?.[checkSummed]) {
      return optimismList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, optimismList])
  const uriLocationsOptimism = useHttpLocations(optimismURI)

  const arbitrumURI = useMemo(() => {
    if (checkSummed && arbitrumList?.[checkSummed]) {
      return arbitrumList?.[checkSummed].token.logoURI
    }
    return undefined
  }, [checkSummed, arbitrumList])
  const uriLocationsArbitrum = useHttpLocations(arbitrumURI)

  const srcs: string[] = useMemo(() => {
    const checkSummed = isAddress(address)

    if (checkSummed) {
      return [getTokenLogoURL(checkSummed), ...uriLocationsOptimism, ...uriLocationsArbitrum]
    }
    return []
  }, [address, uriLocationsArbitrum, uriLocationsOptimism])

  if (activeNetwork === OptimismNetworkInfo && address === '0x4200000000000000000000000000000000000006') {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} {...rest} />
  }

  // WETH_ADDRESS, EYE, SCX, WEIDAI, WETH10, EYE_DAI, SCX_ETH, SCX_EYE
  if (address === EYE.address) {
    return <StyledBehodlerLogo src={EYELogo} size={size} style={style} {...rest} />
  }
  if (address === SCX.address) {
    return <StyledBehodlerLogo src={ScarcityLogo} size={size} style={style} {...rest} />
  }
  if (address === WEIDAI.address) {
    return <StyledBehodlerLogo src={WeidaiLogo} size={size} style={style} {...rest} />
  }
  if (address === WETH10.address) {
    return <StyledBehodlerLogo src={EthereumLogo} size={size} style={style} {...rest} />
  }
  if (address === EYE_DAI.address) {
    return <StyledBehodlerLogo src={EyedaiLogo} size={size} style={style} {...rest} />
  }
  if (address === SCX_ETH.address) {
    return <StyledBehodlerLogo src={ScxethLogo} size={size} style={style} {...rest} />
  }
  if (address === SCX_EYE.address) {
    return <StyledBehodlerLogo src={ScxeyeLogo} size={size} style={style} {...rest} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={'token logo'} style={style} {...rest} />
}
