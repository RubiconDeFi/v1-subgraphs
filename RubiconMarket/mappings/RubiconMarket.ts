
import {
    LogSetOwner,
    LogMake,
    LogTake,
    LogKill,
    FeeTake,
    OfferDeleted,
    LogMatch } from '../generated/RubiconMarket/RubiconMarket'

import {
    LogSwap } from '../generated/RubiconRouter/RubiconRouter'

import {
    RubiconMarket,
    RubiconDayData,
    RubiconHourData,
    Transaction,
    Token,
    DayToken,
    HourToken,
    Pair,
    MonthPair,
    WeekPair,
    DayPair,
    HourPair,
    User,
    Offer,
    OpenOffer,
    Trade,
    Swap,
    AssetPriceETH,
    AssetPriceUSD, 
    HistoricalAssetPriceETH,
    HistoricalAssetPriceUSD,
    Taker} from '../generated/schema'

import { safeLoadPriceETH } from '../utils/entities/HistoricalAssetPriceETH'
import { safeLoadPriceUSD } from '../utils/entities/HistoricalAssetPriceUSD'
import { getAssetPriceETH } from '../utils/entities/AssetPriceETH'
import { getAssetPriceUSD } from '../utils/entities/AssetPriceUSD'
import { getPair } from '../utils/entities/Pair'
import { getMonthPair } from '../utils/entities/MonthPair'
import { getWeekPair } from '../utils/entities/WeekPair'
import { getDayPair } from '../utils/entities/DayPair'
import { getHourPair } from '../utils/entities/HourPair'
import { getToken } from '../utils/entities/Token'
import { getDayToken } from '../utils/entities/DayToken'
import { getHourToken } from '../utils/entities/HourToken'
import { getRubiconMarket } from '../utils/entities/RubiconMarket'
import { getRubiconDayData } from '../utils/entities/RubiconDayData'
import { getRubiconHourData } from '../utils/entities/RubiconHourData'
import { getUser } from '../utils/entities/User'
import { getOffer } from '../utils/entities/Offer'
import { getOpenOffer } from '../utils/entities/OpenOffer'
import { getTrade } from '../utils/entities/Trade'
import { getSwap } from '../utils/entities/Swap'
import { getTaker } from '../utils/entities/Taker'
import { getTransaction } from '../utils/entities/Transaction'
import { updatePrice, tokenPricedToAsset } from '../utils/pricing'
import { tokenToDecimals } from '../utils/tokenData'
import { Bytes, store, log } from '@graphprotocol/graph-ts'
import { ONE_BI } from '../utils/constants'

export function handleLogSetOwner(event: LogSetOwner): void {
    // load in, or create, all rubicon market entities 
    let rubiconMarket = getRubiconMarket(event.block)
    let rubiconDayData = getRubiconDayData(event.block)
    let rubiconHourData = getRubiconHourData(event.block)
}  

export function handleLogMake(event: LogMake): void {
    // TODO: There are most likely redundancy calls for entity loading/creation that can be removed
     // for example, when calling getOffer() we load in multiple entities (ie. Pair, Token, etc.) that are also loaded in during handleLogMake
     // see what we can remove from this function
     
    // create transaction entity - this will log transaction count on RubiconMarket entities 
    let transaction = getTransaction(event)

    // create maker user entity 
    let makerUser = getUser(event.params.maker, event.block)

    // load in, or create, all rubicon market entities 
    let rubiconMarket = getRubiconMarket(event.block)
    let rubiconDayData = getRubiconDayData(event.block)
    let rubiconHourData = getRubiconHourData(event.block)
    
    // load in, or create, all token entities for pay_gem - the asset address the taker/buyer of the order is using 
    let payToken = getToken(event.params.pay_gem, event.block)
    let payTokenDay = getDayToken(event.params.pay_gem, event.block)
    let payTokenHour = getHourToken(event.params.pay_gem, event.block)
    
    // load in, or create, all token entities for buy_gem - the asset the taker/buyer is taking from the maker/seller selling this asset 
    let buyToken = getToken(event.params.buy_gem, event.block)
    let buyTokenDay = getDayToken(event.params.buy_gem, event.block)
    let buyTokenHour = getHourToken(event.params.buy_gem, event.block)

    // load in all pair entities       
    let pair = getPair(event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block)
    let monthPair = getMonthPair(event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block)
    let weekPair = getWeekPair(event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block)
    let dayPair = getDayPair(event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block)
    let hourPair = getHourPair(event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block)

    // create offer and openOffer entities and populate with data 
    // pay_gem is always the taker of the offer and maps to token0address, buy_gem is always the maker of the offer and maps to token1address
    let offer = getOffer(event.params.id, event.params.maker, event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block, event) 
    let openOffer = getOpenOffer(event.params.id, event.params.maker, event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block, event)
    offer.takeAmount = event.params.pay_amt
    offer.makeAmount = event.params.buy_amt
    openOffer.takeAmount = event.params.pay_amt
    openOffer.makeAmount = event.params.buy_amt
    
    // save entities 
    transaction.save()
    makerUser.save()
    rubiconMarket.save()
    rubiconDayData.save()
    rubiconHourData.save()
    payToken.save()
    payTokenDay.save()
    payTokenHour.save()
    buyToken.save()
    buyTokenDay.save()
    buyTokenHour.save()
    pair.save()
    monthPair.save()
    weekPair.save()
    dayPair.save()
    hourPair.save()
    offer.save()
    openOffer.save()
}  

export function handleLogTake(event: LogTake): void {
    
    // update either ETH price or USD price if one of the tokens in trade is ETH or a stablecoin 
    // take_amt is amount of pay_gem, give_amt is amount of buy_gem 
    updatePrice(event.params.pay_gem, event.params.take_amt, event.params.buy_gem, event.params.give_amt, event, event.block)

    // load in all entities that will be modified by LogTake 
    let rubiconMarket = getRubiconMarket(event.block)
    let rubiconDayData = getRubiconDayData(event.block)
    let rubiconHourData = getRubiconHourData(event.block)
    
    // load in all token entities for pay_gem - the asset address the taker/buyer of the order is using 
    let payToken = getToken(event.params.pay_gem, event.block)
    let payTokenDay = getDayToken(event.params.pay_gem, event.block)
    let payTokenHour = getHourToken(event.params.pay_gem, event.block)
    
    // load in all token entities for buy_gem - the asset the taker/buyer is taking from the maker/seller selling this asset 
    let buyToken = getToken(event.params.buy_gem, event.block)
    let buyTokenDay = getDayToken(event.params.buy_gem, event.block)
    let buyTokenHour = getHourToken(event.params.buy_gem, event.block)
    
    // TODO: finalize naming convention for LogTake 
    // load in all pair entities  
    let pair = getPair(event.params.pair ,event.params.pay_gem, event.params.buy_gem, event.block)
    let monthPair = getMonthPair(event.params.pair ,event.params.pay_gem, event.params.buy_gem, event.block)
    let weekPair = getWeekPair(event.params.pair ,event.params.pay_gem, event.params.buy_gem, event.block)
    let dayPair = getDayPair(event.params.pair ,event.params.pay_gem, event.params.buy_gem, event.block)
    let hourPair = getHourPair(event.params.pair ,event.params.pay_gem, event.params.buy_gem, event.block)
    
    // load in all user entities 
    // TODO: See if these are even utilized later 
    let makerUser = getUser(event.params.maker, event.block)
    let takerUser = getUser(event.params.taker, event.block) 
    
    // load in all offer entities 
    let offer = getOffer(event.params.id, event.params.maker, event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block, event)
    let openOffer = getOpenOffer(event.params.id, event.params.maker, event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block, event)
    
    // load in all trade entities 
    
    //let trade = getTrade(event.params.maker, event.params.id, event.params.pair, event.params.buy_gem, event.params.give_amt, event.params.pay_gem, event.params.take_amt,event.block, event)
    
    // load in transaction entity 
    let transaction = getTransaction(event)

    // increment transaction count for pair and token entities 
    pair.txCount = pair.txCount.plus(ONE_BI)
    monthPair.txCount = monthPair.txCount.plus(ONE_BI)
    weekPair.txCount = weekPair.txCount.plus(ONE_BI)
    dayPair.txCount = dayPair.txCount.plus(ONE_BI)
    hourPair.txCount = hourPair.txCount.plus(ONE_BI)
    payToken.txCount = payToken.txCount.plus(ONE_BI)
    payTokenDay.txCount = payTokenDay.txCount.plus(ONE_BI)
    payTokenHour.txCount = payTokenHour.txCount.plus(ONE_BI)
    buyToken.txCount = buyToken.txCount.plus(ONE_BI)
    buyTokenDay.txCount = buyTokenDay.txCount.plus(ONE_BI)
    buyTokenHour.txCount = buyTokenHour.txCount.plus(ONE_BI)

    // set takeAsset price to ETH and makeAsset price to ETH 
    let ethPriceTake = getAssetPriceETH(event.params.pay_gem, event, event.block)
    let ethPriceMake = getAssetPriceETH(event.params.buy_gem, event, event.block)
    let takeAssetPriceETH = safeLoadPriceETH(ethPriceTake.lastPriceETH.toString(), event.params.pay_gem, event, event.block)
    let makeAssetPriceETH = safeLoadPriceETH(ethPriceMake.lastPriceETH.toString(), event.params.buy_gem, event, event.block)

    // set takeAsset price to USD and makeAsset price to USD 
    let usdPriceTake = getAssetPriceUSD(event.params.pay_gem, event, event.block)
    let usdPriceMake = getAssetPriceUSD(event.params.buy_gem, event, event.block)
    let takeAssetPriceUSD = safeLoadPriceUSD(usdPriceTake.lastPriceUSD.toString(), event.params.pay_gem, event, event.block)
    let makeAssetPriceUSD = safeLoadPriceUSD(usdPriceMake.lastPriceUSD.toString(), event.params.buy_gem, event, event.block)

    // update transaction count for pair and token entities 
    pair.txCount = pair.txCount.plus(ONE_BI)
    monthPair.txCount = monthPair.txCount.plus(ONE_BI)
    weekPair.txCount = weekPair.txCount.plus(ONE_BI)
    dayPair.txCount = dayPair.txCount.plus(ONE_BI)
    hourPair.txCount = hourPair.txCount.plus(ONE_BI)
    payToken.txCount = payToken.txCount.plus(ONE_BI)
    payTokenDay.txCount = payTokenDay.txCount.plus(ONE_BI)
    payTokenHour.txCount = payTokenHour.txCount.plus(ONE_BI)
    buyToken.txCount = buyToken.txCount.plus(ONE_BI)
    buyTokenDay.txCount = buyTokenDay.txCount.plus(ONE_BI)
    buyTokenHour.txCount = buyTokenHour.txCount.plus(ONE_BI)

    // update fill amount for offer and openOffer entities 
    // TODO: Check that this logic is correct for updating partial fills 
    offer.receivedTakeAmount = offer.receivedTakeAmount.plus(event.params.take_amt)
    offer.partialFillMakeAmount = offer.partialFillMakeAmount.plus(event.params.give_amt)
    openOffer.receivedTakeAmount = openOffer.receivedTakeAmount.plus(event.params.take_amt)
    openOffer.partialFillMakeAmount = openOffer.partialFillMakeAmount.plus(event.params.give_amt)

    // update token volume 
    payToken.volume = payToken.volume.plus(event.params.take_amt)
    payTokenDay.volume = payTokenDay.volume.plus(event.params.take_amt)
    payTokenHour.volume = payTokenHour.volume.plus(event.params.take_amt)
    buyToken.volume = buyToken.volume.plus(event.params.give_amt)
    buyTokenDay.volume = buyTokenDay.volume.plus(event.params.give_amt)
    buyTokenHour.volume = buyTokenHour.volume.plus(event.params.give_amt)

    // update pair token price values and token volume 
    let pricePayToken = tokenPricedToAsset(event.params.take_amt, event.params.pay_gem, event.params.give_amt, event.params.buy_gem, event.block)
    let priceBuyToken = tokenPricedToAsset(event.params.give_amt, event.params.buy_gem, event.params.take_amt, event.params.pay_gem, event.block)
    
    if (pair.pay_token === event.params.pay_gem.toHexString()) {
        pair.volumePayToken = pair.volumePayToken.plus(event.params.take_amt)
        pair.volumeBuyToken = pair.volumeBuyToken.plus(event.params.give_amt)
        monthPair.volumePayToken = monthPair.volumePayToken.plus(event.params.take_amt)
        monthPair.volumeBuyToken = monthPair.volumeBuyToken.plus(event.params.give_amt)
        weekPair.volumePayToken = weekPair.volumePayToken.plus(event.params.take_amt)
        weekPair.volumeBuyToken = weekPair.volumeBuyToken.plus(event.params.give_amt)
        dayPair.volumePayToken = dayPair.volumePayToken.plus(event.params.take_amt)
        dayPair.volumeBuyToken = dayPair.volumeBuyToken.plus(event.params.give_amt)
        hourPair.volumePayToken = hourPair.volumePayToken.plus(event.params.take_amt)
        hourPair.volumeBuyToken = hourPair.volumeBuyToken.plus(event.params.give_amt)
        pair.pricePayToken = pricePayToken
        pair.priceBuyToken = priceBuyToken
        monthPair.pricePayToken = pricePayToken
        monthPair.priceBuyToken = priceBuyToken
        weekPair.pricePayToken = pricePayToken
        weekPair.priceBuyToken = priceBuyToken
        dayPair.pricePayToken = pricePayToken
        dayPair.priceBuyToken = priceBuyToken
        hourPair.pricePayToken = pricePayToken
        hourPair.priceBuyToken = priceBuyToken
    } else {
        pair.volumePayToken = pair.volumePayToken.plus(event.params.give_amt)
        pair.volumeBuyToken = pair.volumeBuyToken.plus(event.params.take_amt)
        monthPair.volumePayToken = monthPair.volumePayToken.plus(event.params.give_amt)
        monthPair.volumeBuyToken = monthPair.volumeBuyToken.plus(event.params.take_amt)
        weekPair.volumePayToken = weekPair.volumePayToken.plus(event.params.give_amt)
        weekPair.volumeBuyToken = weekPair.volumeBuyToken.plus(event.params.take_amt)
        dayPair.volumePayToken = dayPair.volumePayToken.plus(event.params.give_amt)
        dayPair.volumeBuyToken = dayPair.volumeBuyToken.plus(event.params.take_amt)
        hourPair.volumePayToken = hourPair.volumePayToken.plus(event.params.give_amt)
        hourPair.volumeBuyToken = hourPair.volumeBuyToken.plus(event.params.take_amt)
        pair.pricePayToken = priceBuyToken
        pair.priceBuyToken = pricePayToken
        monthPair.pricePayToken = priceBuyToken
        monthPair.priceBuyToken = pricePayToken
        weekPair.pricePayToken = priceBuyToken
        weekPair.priceBuyToken = pricePayToken
        dayPair.pricePayToken = priceBuyToken
        dayPair.priceBuyToken = pricePayToken
        hourPair.pricePayToken = priceBuyToken
        hourPair.priceBuyToken = pricePayToken
    }

    // updating to make sure logTakes that occur during a swap are recorded correctly
    // updating to remove swap check so every trade is recorded
    // TODO: make sure that event.params.id is the offer id the trade is taking 
    let swap = Swap.load(event.transaction.hash.toHexString())
    if (swap === null) {
        // update taker entity 
        // TODO: See if this is the correct order to pass in token addresses 
        // let taker = getTaker(event.params.taker, event.params.id, event.params.pair, event.params.buy_gem, event.params.pay_gem, event.block, event)
        let trade = getTrade(event.params.maker, event.params.id, event.params.pair, event.params.buy_gem, event.params.give_amt, event.params.pay_gem, event.params.take_amt,event.block, event)
        trade.save()

        // check that token entities are in correct order before updating 
        //if (taker.takeAsset === event.params.pay_gem.toHexString()) {
        //    taker.takeAmount = event.params.take_amt
        //    taker.makeAmount = event.params.give_amt
        //    taker.save()
        // TODO: make sure that fee take logs the same transaction has as the trade 
        //} else {
        //    taker.takeAmount = event.params.give_amt
        //    taker.makeAmount = event.params.take_amt
        //    taker.save()
        //}
        
    }
    // update the taker
    let taker = getTaker(event.params.taker, event.params.id, event.params.pair, event.params.buy_gem, event.params.pay_gem, event.block, event)
    // check that token entities are in correct order before updating 
    if (taker.takeAsset === event.params.pay_gem.toHexString()) {
        taker.takeAmount = event.params.take_amt
        taker.makeAmount = event.params.give_amt
        taker.save()
    } else {
        taker.takeAmount = event.params.give_amt
        taker.makeAmount = event.params.take_amt
        taker.save()
    }

    // this is a check for if the offer is filled 
    // TODO: this should not be how we settle this, but for now it is the fix we will attempt to use 
        // currently the store.remove function only accepts a string parameter for the id
        // the graph is working to resolve this and we should deprecate this logic as Bytes IDs are accepted 
    
    // this is currently not being deleted, see if its order matters
    openOffer.save()
    if (offer.takeAmount == offer.receivedTakeAmount) {
        log.warning('the offer is being filled on the second check: {}', [offer.id])
        offer.filled = true
        offer.timeRemoved = event.block.timestamp
        store.remove('OpenOffer', openOffer.id)
    }
    //offer.partialFillMakeAmount = offer.partialFillMakeAmount.plus(event.params.give_amt)
    //openOffer.receivedTakeAmount = openOffer.receivedTakeAmount.plus(event.params.take_amt)
    //openOffer.partialFillMakeAmount = openOffer.partialFillMakeAmount.plus(event.params.give_amt)

    // save all entities 
    rubiconMarket.save()
    rubiconDayData.save()
    rubiconHourData.save()
    pair.save()
    monthPair.save()
    weekPair.save()
    dayPair.save()
    hourPair.save()
    payToken.save()
    payTokenDay.save()
    payTokenHour.save()
    buyToken.save()
    buyTokenDay.save()
    buyTokenHour.save()
    makerUser.save()
    takerUser.save()
    offer.save()
    //openOffer.save()
    //trade.save()
    transaction.save()
    takeAssetPriceETH.save()
    takeAssetPriceUSD.save()
    makeAssetPriceETH.save()
    makeAssetPriceUSD.save()
}  

export function handleLogKill(event: LogKill): void {
    let offer = getOffer(event.params.id, event.params.maker, event.params.pair, event.params.pay_gem, event.params.buy_gem, event.block, event)
    offer.killed = true
    offer.timeRemoved = event.block.timestamp
    offer.save()
    log.warning('offer being deleted offer.id: {}', [event.params.id.toString()])
    store.remove('OpenOffer', offer.id.toString())
}  

export function handleFeeTake(event: FeeTake): void {
    // load in all entities that will be modified by LogTake 
    let rubiconMarket = getRubiconMarket(event.block)
    let rubiconDayData = getRubiconDayData(event.block)
    let rubiconHourData = getRubiconHourData(event.block)
    // load in all token entities for asset - the asset address that the fee is being issued in 
    let token = getToken(event.params.asset, event.block)
    let tokenDay = getDayToken(event.params.asset, event.block)
    let tokenHour = getHourToken(event.params.asset, event.block)
    // TODO: finalize naming convention for LogTake 
    // load in all pair entities  
    let pair = Pair.load(event.params.pair.toHexString())
    let monthPair = MonthPair.load(event.params.pair.toHexString())
    let weekPair = WeekPair.load(event.params.pair.toHexString())
    let dayPair = DayPair.load(event.params.pair.toHexString())
    let hourPair = HourPair.load(event.params.pair.toHexString())
        
    token.tokenFees = token.tokenFees.plus(event.params.feeAmt)
    tokenDay.dayTokenFees = tokenDay.dayTokenFees.plus(event.params.feeAmt)
    tokenHour.hourTokenFees = tokenHour.hourTokenFees.plus(event.params.feeAmt)

    if (pair !== null) {
        if (pair.pay_token === token.id) {
            pair.payTokenFees = pair.payTokenFees.plus(event.params.feeAmt)
            if (monthPair !== null) {
                monthPair.payTokenFees = monthPair.payTokenFees.plus(event.params.feeAmt)
                monthPair.save()
            }
            if (weekPair !== null) {
                weekPair.payTokenFees = weekPair.payTokenFees.plus(event.params.feeAmt)
                weekPair.save()
            }
            if (dayPair !== null) {
                dayPair.payTokenFees = dayPair.payTokenFees.plus(event.params.feeAmt)
                dayPair.save()
            }
            if (hourPair !== null) {
                hourPair.payTokenFees = hourPair.payTokenFees.plus(event.params.feeAmt)
                hourPair.save()
            }
            pair.save()
        } else {
            pair.buyTokenFees = pair.buyTokenFees.plus(event.params.feeAmt)
            if (monthPair !== null) {
                monthPair.buyTokenFees = monthPair.buyTokenFees.plus(event.params.feeAmt)
                monthPair.save()
            }
            if (weekPair !== null) {
                weekPair.buyTokenFees = weekPair.buyTokenFees.plus(event.params.feeAmt)
                weekPair.save()
            }
            if (dayPair !== null) {
                dayPair.buyTokenFees = dayPair.buyTokenFees.plus(event.params.feeAmt)
                dayPair.save()
            }
            if (hourPair !== null) {
                hourPair.buyTokenFees = hourPair.buyTokenFees.plus(event.params.feeAmt)
                hourPair.save()
            }
        }
    }
    let taker = Taker.load(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
    if (taker !== null) {
        taker.takerFee = taker.takerFee.plus(event.params.feeAmt)
        taker.save()
    } else {
        let swap = Swap.load(event.transaction.hash.toHexString())
        if (swap !== null) {
            swap.takerFee = swap.takerFee.plus(event.params.feeAmt)
            swap.save()
        }
    }

    // save all entities 
    rubiconMarket.save()
    rubiconDayData.save()
    rubiconHourData.save()
    token.save()
    tokenDay.save()
    tokenHour.save()
}  

function padString(len: number, str: string): string {
    while (str.length < len) {
        str = '0' + str
    }
    str = '0x' + str
    return str
}

export function handleOfferDeleted(event: OfferDeleted): void {
    //let offerID = padString(64, event.params.id.toString())
    log.warning('hexstring offer.id: {}', [event.params.id.toHexString()])
    //log.warning('string being passed to padString function: {}', [event.params.id.toString()])
    //log.warning('pad function offer.id: {}', [offerID])

    //let offer = Offer.load(Bytes.fromByteArray(Bytes.fromBigInt(event.params.id)))
    //if (offer !== null) {
    //    offer.filled = true
    //    offer.timeRemoved = event.block.timestamp
    //    offer.save()
    //}
    //store.remove('OpenOffer', Bytes.fromByteArray(offerID).toHexString())
    //store.remove('OpenOffer', event.params.id.toString())
}  


export function handleLogMatch(event: LogMatch): void {
    let trade = Trade.load(event.transaction.hash.toHexString())
    if (trade !== null) {
        trade.tradeMatched = true
        trade.save()
    }
}  

// these are RubiconRouter functions 
export function handleSwap(event: LogSwap): void {
    let swap = getSwap(event.params.recipient, event.params.pair, event.params.inputERC20, event.params.targetERC20, event.block, event)

    swap.takeAmount = event.params.inputAmount
    swap.makeAmount = event.params.realizedFill

    swap.save()

    let trade = getTrade(event.params.recipient, event.params.pair, event.params.pair, event.params.inputERC20, event.params.inputAmount, event.params.targetERC20, event.params.realizedFill, event.block, event)
    trade.save()
}  
/**/

