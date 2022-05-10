import { HistoricalAssetPriceUSD } from '../../generated/schema'
import { getToken } from './Token'
import { dataSource, Address, ethereum, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getHistoricalAssetPriceUSD(address: Address, event: ethereum.Event, block: ethereum.Block): HistoricalAssetPriceUSD {
    const token = getToken(address, block)

    let timestamp = block.timestamp.toI32()
    let priceID = token.id
    .concat('#')
    .concat('USD')
    .concat('#')
    .concat(timestamp.toString())
    let assetPriceUSD = HistoricalAssetPriceUSD.load(priceID)
    if ( assetPriceUSD === null ) {
        assetPriceUSD = new HistoricalAssetPriceUSD(priceID)
        assetPriceUSD.timestamp = BigInt.fromI32(timestamp)
        assetPriceUSD.asset = token.id
        assetPriceUSD.assetAmount = ZERO_BI
        assetPriceUSD.usdAmount = ZERO_BI
        assetPriceUSD.historicalAssetPriceUSD = ZERO_BD
        assetPriceUSD.save()
        return assetPriceUSD as HistoricalAssetPriceUSD
    }
    return assetPriceUSD as HistoricalAssetPriceUSD
}

export function safeLoadPriceUSD(priceID: string, address: Address, event: ethereum.Event, block: ethereum.Block): HistoricalAssetPriceUSD {
    const token = getToken(address, block)
    let historicalAssetPriceUSD = HistoricalAssetPriceUSD.load(priceID)
    if ( historicalAssetPriceUSD === null ) {
        historicalAssetPriceUSD = new HistoricalAssetPriceUSD(priceID)
        historicalAssetPriceUSD.asset = token.id
        historicalAssetPriceUSD.assetAmount = ZERO_BI
        historicalAssetPriceUSD.usdAmount = ZERO_BI
        historicalAssetPriceUSD.historicalAssetPriceUSD = ZERO_BD
        historicalAssetPriceUSD.save()
        return historicalAssetPriceUSD as HistoricalAssetPriceUSD
    }
    return historicalAssetPriceUSD as HistoricalAssetPriceUSD
}