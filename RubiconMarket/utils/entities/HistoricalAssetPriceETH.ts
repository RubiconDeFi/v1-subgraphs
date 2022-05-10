import { HistoricalAssetPriceETH } from '../../generated/schema'
import { getToken } from './Token'
import { dataSource, Address, ethereum, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'
/** TO DEV: Note that anytime this function is called it will create a new entity, this should only be called within update price function */
export function getHistoricalAssetPriceETH(address: Address, event: ethereum.Event, block: ethereum.Block): HistoricalAssetPriceETH {
    const token = getToken(address, block)
    /** TODO: seee if this should be transaction timestamp instead of block */
    let timestamp = block.timestamp.toI32()
    let priceID = token.id
    .concat('#')
    .concat('ETH')
    .concat('#')
    .concat(timestamp.toString())
    let assetPriceETH = HistoricalAssetPriceETH.load(priceID)
    if ( assetPriceETH === null ) {
        assetPriceETH = new HistoricalAssetPriceETH(priceID)
        assetPriceETH.timestamp = BigInt.fromI32(timestamp)
        assetPriceETH.asset = token.id
        assetPriceETH.assetAmount = ZERO_BI
        assetPriceETH.ethAmount = ZERO_BI
        assetPriceETH.historicalAssetPriceETH = ZERO_BD
        assetPriceETH.save()
        return assetPriceETH as HistoricalAssetPriceETH
    }
    return assetPriceETH as HistoricalAssetPriceETH
}

export function safeLoadPriceETH(priceID: string, address: Address, event: ethereum.Event, block: ethereum.Block): HistoricalAssetPriceETH {
    const token = getToken(address, block)
    let historicalAssetPriceETH = HistoricalAssetPriceETH.load(priceID)
    if ( historicalAssetPriceETH === null ) {
        historicalAssetPriceETH = new HistoricalAssetPriceETH(priceID)
        historicalAssetPriceETH.asset = token.id
        historicalAssetPriceETH.assetAmount = ZERO_BI
        historicalAssetPriceETH.ethAmount = ZERO_BI
        historicalAssetPriceETH.historicalAssetPriceETH = ZERO_BD
        historicalAssetPriceETH.save()
        return historicalAssetPriceETH as HistoricalAssetPriceETH
    }
    return historicalAssetPriceETH as HistoricalAssetPriceETH
}