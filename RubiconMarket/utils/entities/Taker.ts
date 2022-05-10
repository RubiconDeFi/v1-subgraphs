import { Taker } from '../../generated/schema'
import { Swap } from '../../generated/schema'
import { getUser } from './User'
import { getPair } from './Pair'
import { getDayPair } from './DayPair'
import { getHourPair } from './HourPair'
import { getToken } from './Token'
import { getTransaction } from './Transaction'
import { getAssetPriceETH } from './AssetPriceETH'
import { getAssetPriceUSD } from './AssetPriceUSD'
import { dataSource, Address, ethereum, Bytes } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'
import { getOffer } from './Offer'
/** TODO: check this one - maybe change naming conventions 
 * TODO: add in variable data for getAssetPriceETH/USD
*/
export function getTaker(address: Address, offerIndexed: Bytes, pairIndexed: Bytes, token0address: Address, token1address: Address, block: ethereum.Block, event: ethereum.Event): Taker {
    /** TODO: See if this actually works for handling swap calls to not be duplicated by LogTake down the line */
    /** TODO: see if this is needed here or if it can just be handled from handLogTake event */
    const user = getUser(address, block)
    const transaction = getTransaction(event)
    const pair = getPair(pairIndexed, token0address, token1address, block)
    const takeAsset = getToken(token0address, block)
    const makeAsset = getToken(token1address, block)
    const dayPair = getDayPair(pairIndexed ,token0address, token1address, block)
    const hourPair = getHourPair(pairIndexed ,token0address, token1address, block)
    const priceTakeAssetETH = getAssetPriceETH(token0address, event, block)
    const priceMakeAssetETH = getAssetPriceETH(token1address, event, block)
    const priceTakeAssetUSD = getAssetPriceUSD(token0address, event, block)
    const priceMakeASsetUSD = getAssetPriceUSD(token1address, event, block)
    const offer = getOffer(offerIndexed, address, pairIndexed, token0address, token1address, block, event)

    // event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let taker = Taker.load(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())

    if (taker == null) {
        taker = new Taker(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
        taker.timestamp = event.block.timestamp
        taker.user = user.id
        taker.transaction = transaction.id
        taker.pair = pair.id
        taker.dayPair = dayPair.id
        taker.hourPair = hourPair.id
        taker.takeAsset = takeAsset.id
        taker.makeAsset = makeAsset.id
        taker.takeAmount = ZERO_BI
        taker.makeAmount = ZERO_BI
        taker.priceTakeAssetETH = priceTakeAssetETH.lastPriceETH
        taker.priceMakeAssetETH = priceMakeAssetETH.lastPriceETH
        taker.priceTakeAssetUSD = priceTakeAssetUSD.lastPriceUSD
        taker.priceMakeAssetUSD = priceMakeASsetUSD.lastPriceUSD
        taker.takerFee = ZERO_BI
        taker.maker = offer.id
        taker.save()
        return taker as Taker
    }
    return taker as Taker
}