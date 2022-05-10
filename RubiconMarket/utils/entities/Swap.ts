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
/** TODO: check this one - maybe change naming conventions 
 * TODO: determine how to add in the offerID
*/
export function getSwap(address: Address, pairIndexed: Bytes, token0address: Address, token1address: Address, block: ethereum.Block, event: ethereum.Event): Swap {
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
    const priceMakeASsetUSD = getAssetPriceUSD(token1address, event, block)

    let swap = Swap.load(event.transaction.hash.toHexString())

    if (swap == null) {
        swap = new Swap(event.transaction.hash.toHexString())
        swap.timestamp = event.block.timestamp
        swap.user = user.id
        swap.transaction = transaction.id
        swap.pair = pair.id
        swap.dayPair = dayPair.id
        swap.hourPair = hourPair.id
        swap.takeAsset = takeAsset.id
        swap.makeAsset = makeAsset.id
        swap.takeAmount = ZERO_BI
        swap.makeAmount = ZERO_BI
        swap.priceTakeAssetETH = priceTakeAssetETH.lastPriceETH
        swap.priceMakeAssetETH = priceMakeAssetETH.lastPriceETH
        swap.priceTakeAssetUSD = priceTakeAssetUSD.lastPriceUSD
        swap.priceMakeAssetUSD = priceMakeASsetUSD.lastPriceUSD
        swap.takerFee = ZERO_BI
        swap.save()
        return swap as Swap
    }
    return swap as Swap
}