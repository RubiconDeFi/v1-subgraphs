import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const RUBICON_MARKET_ADDRESS = '0x7a512d3609211e719737E82c7bb7271eC05Da70d'
/** TODO: Determine how to programatically assign the correct eth address based upon network deployement
 * flip naming convention so network is first and then address
 */
export const WETH_KOVAN_ADDRESS = Address.fromString('0x4200000000000000000000000000000000000006')

export let KOVAN_STABLE_COINS: Address[] = [
    Address.fromString('0x940578F6D9f9ffD9621F69dbB5B24Fd380799772'), // USDC
    Address.fromString('0x34ED3000Cb9953B83Fb8383f61262EF5B8Cb761F'), // DAI
    Address.fromString('0x655cb52BE3131713638AC812d6cC52256F32a3A5') // USDT
]

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)
