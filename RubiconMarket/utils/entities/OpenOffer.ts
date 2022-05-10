import { OpenOffer } from '../../generated/schema'
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
 * TODO: add in variable data for getAssetPriceETH/USD
*/
export function getOpenOffer(offerIndexed: Bytes, address: Address, pairIndexed: Bytes, token0address: Address, token1address: Address, block: ethereum.Block, event: ethereum.Event): OpenOffer {
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

    //let openOffer = OpenOffer.load(offerIndexed)
    let openOffer = OpenOffer.load(offerIndexed.toHexString())

    if (openOffer == null) {
        openOffer = new OpenOffer(offerIndexed.toHexString())
        openOffer.timestamp = event.block.timestamp
        openOffer.user = user.id
        openOffer.transaction = transaction.id
        openOffer.pair = pair.id
        openOffer.dayPair = dayPair.id
        openOffer.hourPair = hourPair.id
        openOffer.takeAsset = takeAsset.id
        openOffer.makeAsset = makeAsset.id
        openOffer.takeAmount = ZERO_BI
        openOffer.makeAmount = ZERO_BI
        openOffer.priceTakeAssetETH = priceTakeAssetETH.lastPriceETH
        openOffer.priceMakeAssetETH = priceMakeAssetETH.lastPriceETH
        openOffer.priceTakeAssetUSD = priceTakeAssetUSD.lastPriceUSD
        openOffer.priceMakeAssetUSD = priceMakeAssetUSD.lastPriceUSD
        openOffer.receivedTakeAmount = ZERO_BI
        openOffer.partialFillMakeAmount = ZERO_BI
        openOffer.save()
        return openOffer as OpenOffer
    }
    return openOffer as OpenOffer
}