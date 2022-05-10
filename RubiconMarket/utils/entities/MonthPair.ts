import { MonthPair } from '../../generated/schema'
import { getRubiconMarket } from './RubiconMarket'
import { getPair } from './Pair'
import { getToken } from './Token'
import { dataSource, Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getMonthPair(pairIndexed: Bytes, payTokenAddress: Address, buyTokenAddress: Address, block: ethereum.Block): MonthPair {
    const rubiconMarket = getRubiconMarket(block)
    const pair = getPair(pairIndexed, payTokenAddress, buyTokenAddress, block)

    let timestamp = block.timestamp.toI32()
    let monthID = timestamp / 2629743
    let monthPairID = pair.id
        .concat('#')
        .concat(monthID.toString())

    let monthPair = MonthPair.load(monthPairID)
    if (monthPair === null) {
        let monthPair = new MonthPair(monthPairID)
        monthPair.market = rubiconMarket.id
        monthPair.startAtTimestamp = block.timestamp
        monthPair.startBlockNumber = block.number
        monthPair.pair = pair.id
        monthPair.pay_token = pair.pay_token
        monthPair.buy_token = pair.buy_token
        monthPair.pricePayToken = ZERO_BD
        monthPair.priceBuyToken = ZERO_BD
        monthPair.volumePayToken = ZERO_BI
        monthPair.volumeBuyToken = ZERO_BI
        monthPair.txCount = ZERO_BI
        monthPair.payTokenFees = ZERO_BI
        monthPair.buyTokenFees = ZERO_BI
        monthPair.save()
        return monthPair as MonthPair
    }
    return monthPair as MonthPair
}

