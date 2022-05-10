import { ERC20 } from '../generated/RubiconMarket/ERC20'
import { BigInt, Address, BigDecimal, bigInt } from '@graphprotocol/graph-ts'
import { ZERO_BD } from './constants'

/** TODO: At some point we will most likely have to implement a static token list similar to Uniswap's approach in utils/token.ts */
export function getTokenDecimals(address: Address): BigInt {
  let contract = ERC20.bind(address)
  let decimalValue = 18
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  return BigInt.fromI64(decimalValue)
}

export function tokenToDecimals(tokenAmount: BigInt, address: Address): BigDecimal {
  /** set denominator value */
  let decimals = getTokenDecimals(address)
  let denominator = 10 ** decimals.toI32()
  //let denominator = BigInt.fromString('10').pow(BigInt.fromString(decimals.toString()))
  return BigDecimal.fromString(tokenAmount.toString()).div(BigDecimal.fromString(denominator.toString()))
}
/** TODO: export function getTokenSymbol(address: Address): string { } */
/** TODO: export function getTokenName(address: Address): string { } */

export function bathTokenToDecimals(tokenAmount: BigInt): BigDecimal {
  /** set denominator value */
  let denominator = 10 ** 18

  // check for zero and return if so 
  if (tokenAmount.equals(BigInt.fromI64(0))) {
    return ZERO_BD
  }
  //let denominator = BigInt.fromString('10').pow(BigInt.fromString(decimals.toString()))
  return BigDecimal.fromString(tokenAmount.toString()).div(BigDecimal.fromString(denominator.toString()))
}