import { HourPair } from '../../generated/schema'
import { getRubiconHourData } from './RubiconHourData'
import { getPair } from './Pair'
import { getToken } from './Token'
import { getHourToken } from './HourToken'
import { dataSource, Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getHourPair(pairIndexed: Bytes, payTokenAddress: Address, buyTokenAddress: Address, block: ethereum.Block): HourPair {
    const rubiconHourData = getRubiconHourData(block)
    const pair = getPair(pairIndexed, payTokenAddress, buyTokenAddress, block)

    /** TODO: see if logic can be updated to get token0address from pair */
    const hourPayToken = getHourToken(payTokenAddress, block)
    const hourBuyToken = getHourToken(buyTokenAddress, block)

    let timestamp = block.timestamp.toI32()
    let hourID = timestamp / 3600
    let hourPairID = pair.id
        .concat('#')
        .concat(hourID.toString())
    let hourPair = HourPair.load(hourPairID)
    if (hourPair === null) {
        hourPair = new HourPair(hourPairID)
        hourPair.market = rubiconHourData.id
        hourPair.startAtTimestamp = block.timestamp
        hourPair.startBlockNumber = block.number
        hourPair.pair = pair.id
        hourPair.pay_token = pair.pay_token
        hourPair.buy_token = pair.buy_token
        hourPair.hourPayToken = hourPayToken.id
        hourPair.hourBuyToken = hourBuyToken.id
        hourPair.pricePayToken = ZERO_BD
        hourPair.priceBuyToken = ZERO_BD
        hourPair.volumePayToken = ZERO_BI
        hourPair.volumeBuyToken = ZERO_BI
        hourPair.txCount = ZERO_BI
        hourPair.payTokenFees = ZERO_BI
        hourPair.buyTokenFees = ZERO_BI
        hourPair.save()
        return hourPair as HourPair
    }
    return hourPair as HourPair
}