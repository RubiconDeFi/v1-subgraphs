import { AssetPriceUSD } from '../../generated/schema'
import { getHistoricalAssetPriceUSD } from './HistoricalAssetPriceUSD'
import { getToken } from './Token'
import { dataSource, Address, ethereum, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getAssetPriceUSD(address: Address, event: ethereum.Event, block: ethereum.Block): AssetPriceUSD {
    const token = getToken(address, block)
    let timestamp = block.timestamp
    let priceID = token.id
    .concat('#')
    .concat('USD')
    let assetPriceUSD = AssetPriceUSD.load(priceID)
    if ( assetPriceUSD === null ) {
        /** this will either load in the historical asset price created in that transaction or a new, empty, historical entity */
        let historyID = token.id
        .concat('#')
        .concat('ETH')
        .concat('#')
        .concat(timestamp.toHexString())
        let historicalAssetPriceUSD = getHistoricalAssetPriceUSD(address, event, block)

        assetPriceUSD = new AssetPriceUSD(priceID)
        assetPriceUSD.timestamp = block.timestamp
        assetPriceUSD.asset = token.id
        /** TODO: determine if this is even needed or if lastPriceUSD is enough */
        assetPriceUSD.assetPriceUSD = historicalAssetPriceUSD.historicalAssetPriceUSD
        /** TODO: Resolve type error thrown here */
        assetPriceUSD.lastPriceUSD = historicalAssetPriceUSD.id

        assetPriceUSD.save()
        return assetPriceUSD as AssetPriceUSD
    }
    return assetPriceUSD as AssetPriceUSD
}