import { getHistoricalAssetPriceETH } from './entities/HistoricalAssetPriceETH'
import { getAssetPriceETH } from './entities/AssetPriceETH'
import { getToken } from './entities/Token'
import { getHistoricalAssetPriceUSD } from './entities/HistoricalAssetPriceUSD'
import { getAssetPriceUSD } from './entities/AssetPriceUSD'
import { WETH_KOVAN_ADDRESS, KOVAN_STABLE_COINS} from './constants'
import { BigInt, Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { HistoricalAssetPriceETH } from '../generated/schema'
import { log } from '@graphprotocol/graph-ts'

export function tokenPricedToAsset(tokenAmount: BigInt, tokenAddress: Address, assetAmount: BigInt, assetAddress: Address, block: ethereum.Block): BigDecimal {
  return assetAmount.divDecimal(tokenAmount.toBigDecimal())
}
/** TODO: THIS LOGIC WILL NEED TO BE UPDATED TO ACCOUNT FOR INSTANCES WHERE THE TOKEN HAS NEVER BEEN TRADED IN AN ETH OR STABLE COIN PAIR */
/** pass in both sides of a trade and update price entities accordingly */
export function updatePrice(takeAsset: Address, takeAmount: BigInt, makeAsset: Address, makeAmount: BigInt, event: ethereum.Event, block: ethereum.Block): void {
    // adding to check if this logic is working
    //log.warning('takeAsset: {}, takeAmount: {}, makeAsset: {}, makeAmount: {}', [takeAsset.toHexString(), takeAmount.toString(), makeAsset.toHexString(), makeAmount.toString()])
    /** check if takeAsset is eth and update makeAsset/ETH price accordingly */
    if (takeAsset == WETH_KOVAN_ADDRESS) {
        let historicalAssetPriceETH = getHistoricalAssetPriceETH(makeAsset, event, block)
        let makeAssetPriceETH = tokenPricedToAsset(makeAmount, makeAsset, takeAmount, takeAsset, block)
        historicalAssetPriceETH.assetAmount = makeAmount
        historicalAssetPriceETH.ethAmount = takeAmount
        historicalAssetPriceETH.historicalAssetPriceETH = makeAssetPriceETH
        historicalAssetPriceETH.save()
        let assetPriceETH = getAssetPriceETH(makeAsset, event, block)
        assetPriceETH.assetPriceETH = makeAssetPriceETH
        assetPriceETH.lastPriceETH = historicalAssetPriceETH.id
        assetPriceETH.save()
    } else {
        if (KOVAN_STABLE_COINS.includes(takeAsset)) {
            let historicalAssetPriceUSD = getHistoricalAssetPriceUSD(makeAsset, event, block)
            let makeAssetPriceUSD = tokenPricedToAsset(makeAmount, makeAsset, takeAmount, takeAsset, block)
            let usdAsset = getToken(takeAsset, block)

            // adding to check if this logic is working
            //log.warning('usdAsset.id: {}, usdAsset.symbol: {}', [usdAsset.id, usdAsset.symbol])

            historicalAssetPriceUSD.usdAsset = usdAsset.id
            historicalAssetPriceUSD.assetAmount = makeAmount
            historicalAssetPriceUSD.usdAmount = takeAmount
            historicalAssetPriceUSD.historicalAssetPriceUSD = makeAssetPriceUSD
            historicalAssetPriceUSD.save()
            let assetPriceUSD = getAssetPriceUSD(makeAsset, event, block)
            assetPriceUSD.assetPriceUSD = makeAssetPriceUSD
            assetPriceUSD.lastPriceUSD = historicalAssetPriceUSD.id
            assetPriceUSD.save()
        }
    }
    /** check if makeAsset is eth and update takeAsset/ETH price accordingly */
    if (makeAsset == WETH_KOVAN_ADDRESS) {
        let historicalAssetPriceETH = getHistoricalAssetPriceETH(takeAsset, event, block)
        let takeAssetPriceETH = tokenPricedToAsset(takeAmount, takeAsset, makeAmount, makeAsset, block)
        historicalAssetPriceETH.assetAmount = takeAmount
        historicalAssetPriceETH.ethAmount = makeAmount
        historicalAssetPriceETH.historicalAssetPriceETH = takeAssetPriceETH
        historicalAssetPriceETH.save()
        let assetPriceETH = getAssetPriceETH(takeAsset, event, block)
        assetPriceETH.assetPriceETH = takeAssetPriceETH
        assetPriceETH.lastPriceETH = historicalAssetPriceETH.id
        assetPriceETH.save()
    } else {
        if (KOVAN_STABLE_COINS.includes(makeAsset)) {
            let historicalAssetPriceUSD = getHistoricalAssetPriceUSD(takeAsset, event, block)
            let takeAssetPriceUSD = tokenPricedToAsset(takeAmount, takeAsset, makeAmount, makeAsset, block)
            let usdAsset = getToken(makeAsset, block)

            // adding to check if this logic is working
            //log.warning('usdAsset.id: {}, usdAsset.symbol: {}', [usdAsset.id, usdAsset.symbol])

            historicalAssetPriceUSD.usdAsset = usdAsset.id
            historicalAssetPriceUSD.assetAmount = takeAmount
            historicalAssetPriceUSD.usdAmount = makeAmount
            historicalAssetPriceUSD.historicalAssetPriceUSD = takeAssetPriceUSD
            historicalAssetPriceUSD.save()
            let assetPriceUSD = getAssetPriceUSD(takeAsset, event, block)
            assetPriceUSD.assetPriceUSD = takeAssetPriceUSD
            assetPriceUSD.lastPriceUSD = historicalAssetPriceUSD.id
            assetPriceUSD.save()
        }
    }
}