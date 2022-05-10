import { Offer } from '../../generated/schema'
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
/** TODO: check this one - maybe change naming conventions 
 * TODO: see if speed is improved if consts are only called if offer === null
 * TODO: change offerID to be the offerID from the event
*/
export function getOffer(offerIndexed: Bytes, address: Address, pairIndexed: Bytes, token0address: Address, token1address: Address, block: ethereum.Block, event: ethereum.Event): Offer {
    const user = getUser(address, block)
    const transaction = getTransaction(event)
    const pair = getPair(pairIndexed, token0address, token1address, block)
    const takeAsset = getToken(token0address, block)
    const makeAsset = getToken(token1address, block)
    const dayPair = getDayPair(pairIndexed, token0address, token1address, block)
    const hourPair = getHourPair(pairIndexed, token0address, token1address, block)
    const priceTakeAssetETH = getAssetPriceETH(token0address, event, block)
    const priceMakeAssetETH = getAssetPriceETH(token1address, event, block)
    const priceTakeAssetUSD = getAssetPriceUSD(token0address, event, block)
    const priceMakeAssetUSD = getAssetPriceUSD(token1address, event, block)

    //let offer = Offer.load(offerIndexed)
    let offer = Offer.load(offerIndexed.toHexString())
    
    if (offer == null) {
        offer = new Offer(offerIndexed.toHexString())
        offer.timestamp = event.block.timestamp
        offer.user = user.id
        offer.transaction = transaction.id
        offer.pair = pair.id
        offer.dayPair = dayPair.id
        offer.hourPair = hourPair.id
        offer.takeAsset = takeAsset.id
        offer.makeAsset = makeAsset.id
        offer.takeAmount = ZERO_BI
        offer.makeAmount = ZERO_BI
        offer.priceTakeAssetETH = priceTakeAssetETH.lastPriceETH
        offer.priceMakeAssetETH = priceMakeAssetETH.lastPriceETH
        offer.priceTakeAssetUSD = priceTakeAssetUSD.lastPriceUSD
        offer.priceMakeAssetUSD = priceMakeAssetUSD.lastPriceUSD
        offer.receivedTakeAmount = ZERO_BI
        offer.partialFillMakeAmount = ZERO_BI
        offer.killed = false
        offer.filled = false
        offer.timeRemoved = ZERO_BI
        offer.save()
        return offer as Offer
    }
    return offer as Offer
}
