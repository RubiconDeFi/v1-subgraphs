import { FullPair } from '../../generated/schema'
import { getRubiconMarket } from './RubiconMarket'
import { getPair } from './Pair'
import { Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD } from '../constants'

export function getFullPair(pairIndexed: Bytes, payTokenAddress: Address, buyTokenAddress: Address, block: ethereum.Block): FullPair {
    const rubiconMarket = getRubiconMarket(block)
    let pair = getPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
    let pairID = payTokenAddress.toHexString().concat('#').concat(buyTokenAddress.toHexString())
    let fullPair = FullPair.load(pairID)
    if (fullPair === null) {
        let pairID = buyTokenAddress.toHexString().concat('#').concat(payTokenAddress.toHexString())
        let fullPair = FullPair.load(pairID)
        if (fullPair === null) {
            let pairID = payTokenAddress.toHexString().concat('#').concat(buyTokenAddress.toHexString())
            fullPair = new FullPair(pairID)
            fullPair.pair0 = pair.id
            fullPair.save()

            /** update RubiconMarket entity pair count */
            rubiconMarket.pairCount = rubiconMarket.pairCount.plus(ONE_BI)
            rubiconMarket.save()

            return fullPair as FullPair
        } else {
            fullPair.pair1 = pair.id
            fullPair.save()
            return fullPair as FullPair
        }
    }
    return fullPair as FullPair
}

export function safeLoadFullPair(token0Address: Address, token1Address: Address, block: ethereum.Block): FullPair {
    const rubiconMarket = getRubiconMarket(block)
    let pairID = token1Address.toHexString().concat('#').concat(token0Address.toHexString())
    let fullPair = FullPair.load(pairID)
    if (fullPair === null) {
        let pairID = token0Address.toHexString().concat('#').concat(token1Address.toHexString())
        let fullPair = FullPair.load(pairID)
        if (fullPair === null) {
            fullPair = new FullPair(pairID)
            fullPair.save()

            // update RubiconMarket entity pair count 
            rubiconMarket.pairCount = rubiconMarket.pairCount.plus(ONE_BI)
            rubiconMarket.save()
            return fullPair as FullPair
        }
        return fullPair as FullPair
    }
    return fullPair as FullPair
}