import { WeekPair } from "../../generated/schema";
import { getRubiconMarket } from './RubiconMarket'
import { getPair } from './Pair'
import { getToken } from './Token'
import { dataSource, Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getWeekPair(pairIndexed: Bytes, payTokenAddress: Address, buyTokenAddress: Address, block: ethereum.Block): WeekPair {
    const rubiconMarket = getRubiconMarket(block)
    const pair = getPair(pairIndexed, payTokenAddress, buyTokenAddress, block)

    let timestamp = block.timestamp.toI32()
    let weekID = timestamp / 604800
    let weekPairID = pair.id
        .concat('#')
        .concat(weekID.toString())

    let weekPair = WeekPair.load(weekPairID)
    if (weekPair === null) {
        let weekPair = new WeekPair(weekPairID)
        weekPair.market = rubiconMarket.id
        weekPair.startAtTimestamp = block.timestamp
        weekPair.startBlockNumber = block.number
        weekPair.pair = pair.id
        weekPair.pay_token = pair.pay_token
        weekPair.buy_token = pair.buy_token
        weekPair.pricePayToken = ZERO_BD
        weekPair.priceBuyToken = ZERO_BD
        weekPair.volumePayToken = ZERO_BI
        weekPair.volumeBuyToken = ZERO_BI
        weekPair.txCount = ZERO_BI
        weekPair.payTokenFees = ZERO_BI
        weekPair.buyTokenFees = ZERO_BI
        weekPair.save()
        return weekPair as WeekPair
    }
    return weekPair as WeekPair
}
