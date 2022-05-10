import { Trade } from '../../generated/schema'
import { getUser } from './User'
import { getPair } from './Pair'
import { safeLoadFullPair } from './FullPair'
import { getMonthPair } from './MonthPair'
import { getWeekPair } from './WeekPair'
import { getDayPair } from './DayPair'
import { getHourPair } from './HourPair'
import { getToken } from './Token'
import { getTransaction } from './Transaction'
import { getAssetPriceETH } from './AssetPriceETH'
import { getAssetPriceUSD } from './AssetPriceUSD'
import { dataSource, Address, ethereum, Bytes, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'
import { getOffer } from './Offer'
/** TODO: check this one - maybe change naming conventions 
 * TODO: add in variable data for getAssetPriceETH/USD
*/
export function getTrade(address: Address, offerIndexed: Bytes, pairIndexed: Bytes, payTokenAddress: Address, payamt: BigInt, buyTokenAddress: Address, buyamt: BigInt, block: ethereum.Block, event: ethereum.Event): Trade {
    const transaction = getTransaction(event)
    const pair = getPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
    const fullPair = safeLoadFullPair(payTokenAddress, buyTokenAddress, block)
    const token0 = getToken(payTokenAddress, block)
    const token1 = getToken(buyTokenAddress, block)
    const monthPair = getMonthPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
    const weekPair = getWeekPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
    const dayPair = getDayPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
    const hourPair = getHourPair(pairIndexed, payTokenAddress, buyTokenAddress, block)
    const pricePayTokenETH = getAssetPriceETH(payTokenAddress, event, block)
    const priceBuyTokenETH = getAssetPriceETH(buyTokenAddress, event, block)
    const pricePayTokenUSD = getAssetPriceUSD(payTokenAddress, event, block)
    const priceBuyTokenUSD = getAssetPriceUSD(buyTokenAddress, event, block)

    let trade = Trade.load(event.transaction.hash.toHexString())

    if (trade == null) {
        trade = new Trade(event.transaction.hash.toHexString())
        trade.timestamp = event.block.timestamp
        trade.transaction = transaction.id
        trade.fullPair = fullPair.id
        trade.pair = pair.id
        trade.monthPair = monthPair.id
        trade.weekPair = weekPair.id
        trade.dayPair = dayPair.id
        trade.hourPair = hourPair.id
        trade.takeAsset = token0.id
        trade.makeAsset = token1.id
        trade.takeAmount = payamt
        trade.makeAmount = buyamt
        trade.priceTakeAssetETH = pricePayTokenETH.lastPriceETH
        trade.priceMakeAssetETH = priceBuyTokenETH.lastPriceETH
        trade.priceTakeAssetUSD = pricePayTokenUSD.lastPriceUSD
        trade.priceMakeAssetUSD = priceBuyTokenUSD.lastPriceUSD
        trade.tradeMatched = false
        trade.save()

        // update last trade for fullPair
        fullPair.lastTrade = trade.id
        fullPair.save()
        
        return trade as Trade
    }
    return trade as Trade
}