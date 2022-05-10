import { Pair } from '../../generated/schema'
import { getFullPair } from './FullPair'
import { getRubiconMarket } from './RubiconMarket'
import { getToken } from './Token'
import { Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD } from '../constants'

export function getPair(pairIndexed: Bytes, payTokenAddress: Address, buyTokenAddress: Address, block: ethereum.Block): Pair {
    const rubiconMarket = getRubiconMarket(block)
    const payToken = getToken(payTokenAddress, block)
    const buyToken = getToken(buyTokenAddress, block)

    let pairID = pairIndexed.toHexString()

    let pair = Pair.load(pairID)
    if (pair === null) {

        let pair = new Pair(pairID)
        pair.market = rubiconMarket.id
        pair.startAtTimestamp = block.timestamp
        pair.startBlockNumber = block.number
        pair.pay_token = payToken.id
        pair.buy_token = buyToken.id
        pair.pricePayToken = ZERO_BD
        pair.priceBuyToken = ZERO_BD
        pair.volumePayToken = ZERO_BI
        pair.volumeBuyToken = ZERO_BI
        pair.txCount = ZERO_BI
        pair.payTokenFees = ZERO_BI
        pair.buyTokenFees = ZERO_BI
        pair.save()

        let fullPair = getFullPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
        return pair as Pair
    }
    return pair as Pair
}
   