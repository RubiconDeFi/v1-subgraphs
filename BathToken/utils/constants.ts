import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const RUBICON_MARKET_ADDRESS = '0x7a512d3609211e719737E82c7bb7271eC05Da70d'
export const BATH_HOUSE_ADDRESS = '0xe7eead831A79210BE0C81D20d98bB1e4DD20C71b'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)