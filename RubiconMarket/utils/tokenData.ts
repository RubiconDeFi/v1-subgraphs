import { ERC20 } from '../generated/RubiconMarket/ERC20'
import { BigInt, Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { getToken } from './entities/Token'

/** TODO: At some point we will most likely have to implement a static token list similar to Uniswap's approach in utils/token.ts */
export function getTokenDecimals(address: Address): BigInt {
  let contract = ERC20.bind(address)
  let decimalValue = 18
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  return BigInt.fromI64(decimalValue)
  //return decimalValue
}

export function tokenToDecimals(tokenAmount: BigInt, address: Address, block: ethereum.Block): BigDecimal {
  /** set denominator value */
  //let token = getToken(address, block)
  //let decimals = token.decimals
  //let u8Decimals = u8(decimals.toI32())
  //let denominator = BigInt.fromI32(10).pow(decimals as u8).toBigDecimal()
  //let denominator = 10 ** decimals.toI32()
  let decimals = getTokenDecimals(address)
  let denominator = 10 ** decimals.toI32()
  return BigDecimal.fromString(tokenAmount.toString()).div(BigDecimal.fromString(denominator.toString()))
  //return tokenAmount.divDecimal(denominator)
}
/** TODO: export function getTokenSymbol(address: Address): string { } */
/** TODO: export function getTokenName(address: Address): string { } */