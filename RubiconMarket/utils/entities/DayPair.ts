import { DayPair } from '../../generated/schema'
import { getRubiconDayData } from './RubiconDayData'
import { getPair } from './Pair'
import { getDayToken } from './DayToken'
import { dataSource, Address, ethereum, Bytes, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getDayPair(pairIndexed: Bytes, payTokenAddress: Address, buyTokenAddress: Address, block: ethereum.Block): DayPair {
    const rubiconDayData = getRubiconDayData(block)
    const pair = getPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
    /** TODO: see if logic can be updated to get token0address from pair */
    const dayPayToken = getDayToken(payTokenAddress, block)
    const dayBuyToken = getDayToken(buyTokenAddress, block)

    let timestamp = block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayPairID = pair.id
        .concat('#')
        .concat(dayID.toString())
    let dayPair = DayPair.load(dayPairID)
    if (dayPair === null) {
        let dayPair = new DayPair(dayPairID)
        dayPair.market = rubiconDayData.id
        dayPair.startAtTimestamp = block.timestamp
        dayPair.startBlockNumber = block.number
        dayPair.pair = pair.id
        dayPair.pay_token = pair.pay_token
        dayPair.buy_token = pair.buy_token
        dayPair.dayPayToken = dayPayToken.id
        dayPair.dayBuyToken = dayBuyToken.id
        dayPair.pricePayToken = ZERO_BD
        dayPair.priceBuyToken = ZERO_BD
        dayPair.volumePayToken = ZERO_BI
        dayPair.volumeBuyToken = ZERO_BI
        dayPair.txCount = ZERO_BI
        dayPair.payTokenFees = ZERO_BI
        dayPair.buyTokenFees = ZERO_BI
        dayPair.save()
        return dayPair as DayPair
    }
    return dayPair as DayPair
}
