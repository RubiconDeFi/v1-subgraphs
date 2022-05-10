import { AssetPriceETH } from '../../generated/schema'
import { getHistoricalAssetPriceETH } from './HistoricalAssetPriceETH'
import { getToken } from './Token'
import { dataSource, Address, ethereum, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'
/** see if historical asset price should use transaction hash instead of block 
 * TODO: this naming does not work, when you cann getAssetPriceETH it will update the historical asset price regardless of whether or not their was a trade
*/
export function getAssetPriceETH(address: Address, event: ethereum.Event, block: ethereum.Block): AssetPriceETH {
    const token = getToken(address, block)
    let priceID = token.id
    .concat('#')
    .concat('ETH')
    let assetPriceETH = AssetPriceETH.load(priceID)
    if ( assetPriceETH === null ) {
        /** this will either load in the historical asset price created in that transaction or a new, empty, historical entity */
        let timestamp = block.timestamp
        let historyID = token.id
        .concat('#')
        .concat('ETH')
        .concat('#')
        .concat(timestamp.toHexString())
        let historicalAssetPriceETH = getHistoricalAssetPriceETH(address, event, block)

        assetPriceETH = new AssetPriceETH(priceID)
        assetPriceETH.timestamp = block.timestamp
        assetPriceETH.asset = token.id
        /** TODO: determine if this is even needed or if lastPriceETH is enough */
        assetPriceETH.assetPriceETH = historicalAssetPriceETH.historicalAssetPriceETH
        /** TODO: Resolve type error thrown here */
        assetPriceETH.lastPriceETH = historicalAssetPriceETH.id

        assetPriceETH.save()
        return assetPriceETH as AssetPriceETH
    }
    return assetPriceETH as AssetPriceETH
}