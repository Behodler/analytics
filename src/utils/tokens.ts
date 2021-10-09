import { Token } from '@uniswap/sdk-core'
import { WETH_ADDRESS, WETH10, EYE_DAI, SCX_ETH, SCX_EYE } from '../constants/index'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export function formatTokenSymbol(address: string, symbol: string) {
  if (address === WETH_ADDRESS) {
    return 'ETH'
  }
  if (address === WETH10.address) {
    return WETH10.symbol
  }
  if (address === EYE_DAI.address) {
    return EYE_DAI.symbol
  }
  if (address === SCX_EYE.address) {
    return SCX_EYE.symbol
  }
  if (address === SCX_ETH.address) {
    return SCX_ETH.symbol
  }
  return symbol
}

export function formatTokenName(address: string, name: string) {
  if (address === WETH_ADDRESS) {
    return 'Ether'
  }
  if (address === WETH10.address) {
    return WETH10.name
  }
  if (address === EYE_DAI.address) {
    return EYE_DAI.name
  }
  if (address === SCX_EYE.address) {
    return SCX_EYE.name
  }
  if (address === SCX_ETH.address) {
    return SCX_ETH.name
  }
  return name
}
