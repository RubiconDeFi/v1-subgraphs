import { 
    BathHouse, 
    LiquidityProvider,
    PoolPosition, 
    Pool, 
    PoolDayData, 
    PoolHourData, 
    PoolBuffer, 
    PoolBufferDay, 
    PoolBufferHour, 
    Transaction, 
    Deposit, 
    Withdraw } from "../generated/schema"
import { getBathHouse } from "../utils/entities/BathHouse"
import { getLiquidityProvider } from "../utils/entities/LiquidityProvider"
import { getPoolPosition } from "../utils/entities/PoolPosition"
import { getPool } from "../utils/entities/Pool"
import { getPoolDayData } from "../utils/entities/PoolDayData"
import { getPoolHourData } from "../utils/entities/PoolHourData"
import { getPoolBuffer } from "../utils/entities/PoolBuffer"
import { getPoolBufferDay } from "../utils/entities/PoolBufferDay"
import { getPoolBufferHour } from "../utils/entities/PoolBufferHour"
import { getTransaction } from "../utils/entities/Transaction"
import { getDeposit } from "../utils/entities/Deposit"
import { getWithdraw } from "../utils/entities/Withdraw"
import { getEarnings } from "../utils/bathTokenEarn"
import { 
    LogDeposit,
    LogWithdraw,
    LogRebalance,
    LogPoolOffer,
    LogPoolCancel, 
    LogRemoveFilledTradeAmount
} from "../generated/templates/BathToken/BathToken"
import { tokenToDecimals, bathTokenToDecimals } from "../utils/tokenData"
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../utils/constants'

export function handleDeposit(event: LogDeposit): void {
    // load in the transaction entity
    let transaction = getTransaction(event, event.block)
    
    // load in LiquidityProvider entity
    let liquidityProvider = getLiquidityProvider(event.params.depositor)
    
    // load in PoolPosition entity
    // TODO: make sure that pool address gets added into all low level BathToken event emits
    let poolPosition = getPoolPosition(event.params.depositor, event.params.asset, event.block, event)
    
    // load in all Pool entities
    let pool = getPool(event.params.asset, event.block, event)
    let poolDayData = getPoolDayData(event.params.asset, event.block, event)
    let poolHourData = getPoolHourData(event.params.asset, event.block, event)
    
    // load in deposit entity  
    let deposit = getDeposit(event.params.asset, event.params.depositor, event.block, event)

    // determine price of BathToken
    //let bathTokenPrice = event.params.totalSupply.divDecimal(event.params.underlyingBalance.toBigDecimal())
    let bathTokenPrice = event.params.underlyingBalance.divDecimal(event.params.totalSupply.toBigDecimal())

    // update Pool entities 
    pool.underlyingBalance = event.params.underlyingBalance
    pool.outstandingAmount = event.params.outstandingAmount
    pool.tokenSupply = event.params.totalSupply
    pool.totalDeposited = pool.totalDeposited.plus(event.params.depositedAmt)
    pool.price = bathTokenPrice
    poolDayData.underlyingBalance = event.params.underlyingBalance
    poolDayData.outstandingAmount = event.params.outstandingAmount
    poolDayData.tokenSupply = event.params.totalSupply
    poolDayData.tokensMinted = poolDayData.tokensMinted.plus(event.params.sharesReceived)
    poolDayData.totalDeposited = poolDayData.totalDeposited.plus(event.params.depositedAmt)
    poolDayData.price = bathTokenPrice
    poolHourData.underlyingBalance = event.params.underlyingBalance
    poolHourData.outstandingAmount = event.params.outstandingAmount
    poolHourData.tokenSupply = event.params.totalSupply
    poolHourData.tokensMinted = poolHourData.tokensMinted.plus(event.params.sharesReceived)
    poolHourData.totalDeposited = poolHourData.totalDeposited.plus(event.params.depositedAmt)
    poolHourData.price = bathTokenPrice

    // update deposit entity
    deposit.depositAmount = event.params.depositedAmt
    deposit.bathTokenAmount = event.params.sharesReceived
    deposit.price = bathTokenPrice

    // update PoolPosition entity
    // TODO: make sure that bathTokens are always mapped back to an 18 decimals token
    poolPosition.bathTokenAmount = poolPosition.bathTokenAmount.plus(event.params.sharesReceived)
    poolPosition.totalDeposited = poolPosition.totalDeposited.plus(event.params.depositedAmt)
    
    // save all entities
    transaction.save()
    liquidityProvider.save()
    poolPosition.save()
    pool.save()
    poolDayData.save()
    poolHourData.save()
    deposit.save()

    // update Earnings
    let earnings = getEarnings(event.params.asset, event.block, event)
    pool.totalEarned = earnings
    poolDayData.totalEarned = earnings
    poolHourData.totalEarned = earnings
    pool.save()
    poolDayData.save()
    poolHourData.save()
}

export function handleWithdraw(event: LogWithdraw): void {
    // load in the transaction entity
    let transaction = getTransaction(event, event.block)
    
    // load in LiquidityProvider entity
    let liquidityProvider = getLiquidityProvider(event.params.withdrawer)
    
    // load in PoolPosition entity
    let poolPosition = getPoolPosition(event.params.withdrawer, event.params.asset, event.block, event)
    
    // load in all Pool entities
    let pool = getPool(event.params.asset, event.block, event)
    let poolDayData = getPoolDayData(event.params.asset, event.block, event)
    let poolHourData = getPoolHourData(event.params.asset, event.block, event)
    
    // load in withdraw entity
    let withdraw = getWithdraw(event.params.asset, event.params.withdrawer, event.block, event)

    // determine price of BathToken
    //let bathTokenPrice = event.params.totalSupply.divDecimal(event.params.underlyingBalance.toBigDecimal())
    let bathTokenPrice = event.params.underlyingBalance.divDecimal(event.params.totalSupply.toBigDecimal())

    // update Pool entities
    pool.underlyingBalance = event.params.underlyingBalance
    pool.outstandingAmount = event.params.outstandingAmount
    pool.tokenSupply = event.params.totalSupply
    pool.totalWithdrawn = pool.totalWithdrawn.plus(event.params.amountWithdrawn)
    pool.price = bathTokenPrice
    poolDayData.underlyingBalance = event.params.underlyingBalance
    poolDayData.outstandingAmount = event.params.outstandingAmount
    poolDayData.tokenSupply = event.params.totalSupply
    poolDayData.totalWithdrawn = poolDayData.totalWithdrawn.plus(event.params.amountWithdrawn)
    poolDayData.tokensBurned = poolDayData.tokensBurned.plus(event.params.sharesWithdrawn)
    poolDayData.price = bathTokenPrice
    poolHourData.underlyingBalance = event.params.underlyingBalance
    poolHourData.outstandingAmount = event.params.outstandingAmount
    poolHourData.tokenSupply = event.params.totalSupply
    poolHourData.totalWithdrawn = poolHourData.totalWithdrawn.plus(event.params.amountWithdrawn)
    poolHourData.tokensBurned = poolHourData.tokensBurned.plus(event.params.sharesWithdrawn)
    poolHourData.price = bathTokenPrice

    // update withdraw entity
    withdraw.withdrawAmount = event.params.amountWithdrawn
    withdraw.bathTokenBurned = event.params.sharesWithdrawn
    withdraw.price = bathTokenPrice

    // update PoolPosition entity
    poolPosition.bathTokenAmount = poolPosition.bathTokenAmount.minus(event.params.sharesWithdrawn)
    poolPosition.totalWithdrawn = poolPosition.totalWithdrawn.plus(event.params.amountWithdrawn)

    // save all entities
    transaction.save()
    liquidityProvider.save()
    poolPosition.save()
    pool.save()
    poolDayData.save()
    poolHourData.save()
    withdraw.save()

    // update Earnings
    let earnings = getEarnings(event.params.asset, event.block, event)
    pool.totalEarned = earnings
    poolDayData.totalEarned = earnings
    poolHourData.totalEarned = earnings
    pool.save()
    poolDayData.save()
    poolHourData.save()
}

export function handleRebalance(event: LogRebalance): void { 
    // TODO: Currently this will not track to update the underlying balance of a sister pool that this could rebalance to
    // currently pool id is just the asset address, if it could have an attribute that records the pool address this could be used
    // load in the transaction entity
    let transaction = getTransaction(event, event.block)
    
    // load in all Pool entities
    let pool = getPool(event.params.pool_asset, event.block, event)
    let poolDayData = getPoolDayData(event.params.pool_asset, event.block, event)
    let poolHourData = getPoolHourData(event.params.pool_asset, event.block, event)
    
    // load in PoolBuffer entities
    let poolBuffer = getPoolBuffer(event.params.pool_asset, event.params.transferAsset, event.block, event)
    let poolBufferDayData = getPoolBufferDay(event.params.pool_asset, event.params.transferAsset, event.block, event)
    let poolBufferHourData = getPoolBufferHour(event.params.pool_asset, event.params.transferAsset, event.block, event)

    // determine price of BathToken
    //let bathTokenPrice = event.params.totalSupply.divDecimal(event.params.underlyingBalance.toBigDecimal())
    let bathTokenPrice = event.params.underlyingBalance.divDecimal(event.params.totalSupply.toBigDecimal())

    // update Pool entities
    pool.underlyingBalance = event.params.underlyingBalance
    pool.outstandingAmount = event.params.outstandingAmount
    pool.tokenSupply = event.params.totalSupply
    pool.price = bathTokenPrice
    poolDayData.underlyingBalance = event.params.underlyingBalance
    poolDayData.outstandingAmount = event.params.outstandingAmount
    poolDayData.tokenSupply = event.params.totalSupply
    poolDayData.price = bathTokenPrice
    poolHourData.underlyingBalance = event.params.underlyingBalance
    poolHourData.outstandingAmount = event.params.outstandingAmount
    poolHourData.tokenSupply = event.params.totalSupply
    poolHourData.price = bathTokenPrice

    // update PoolBuffer entities
    poolBuffer.bufferAmount = poolBuffer.bufferAmount.minus(event.params.rebalAmt)
    poolBufferDayData.bufferAmount = poolBufferDayData.bufferAmount.minus(event.params.rebalAmt)
    poolBufferHourData.bufferAmount = poolBufferHourData.bufferAmount.minus(event.params.rebalAmt)

    // save all entities
    transaction.save()
    pool.save()
    poolDayData.save()
    poolHourData.save()
    poolBuffer.save()
    poolBufferDayData.save()
    poolBufferHourData.save()

    // update Earnings
    let earnings = getEarnings(event.params.pool_asset, event.block, event)
    pool.totalEarned = earnings
    poolDayData.totalEarned = earnings
    poolHourData.totalEarned = earnings
    pool.save()
    poolDayData.save()
    poolHourData.save()

}

export function handlePoolCancel(event: LogPoolCancel): void {
    // load in the transaction entity
    let transaction = getTransaction(event, event.block)

    // load in all Pool entities
    let pool = getPool(event.params.pool_asset, event.block, event)
    let poolDayData = getPoolDayData(event.params.pool_asset, event.block, event)
    let poolHourData = getPoolHourData(event.params.pool_asset, event.block, event)

    // determine price of BathToken
    //let bathTokenPrice = event.params.totalSupply.divDecimal(event.params.underlyingBalance.toBigDecimal())
    let bathTokenPrice = event.params.underlyingBalance.divDecimal(event.params.totalSupply.toBigDecimal())

    // update Pool entities
    pool.underlyingBalance = event.params.underlyingBalance
    pool.outstandingAmount = event.params.outstandingAmount
    pool.tokenSupply = event.params.totalSupply
    pool.price = bathTokenPrice
    poolDayData.underlyingBalance = event.params.underlyingBalance
    poolDayData.outstandingAmount = event.params.outstandingAmount
    poolDayData.tokenSupply = event.params.totalSupply
    poolDayData.price = bathTokenPrice
    poolHourData.underlyingBalance = event.params.underlyingBalance
    poolHourData.outstandingAmount = event.params.outstandingAmount
    poolHourData.tokenSupply = event.params.totalSupply
    poolHourData.price = bathTokenPrice

    // save all entities
    transaction.save()
    pool.save()
    poolDayData.save()
    poolHourData.save()

    // update Earnings
    let earnings = getEarnings(event.params.pool_asset, event.block, event)
    pool.totalEarned = earnings
    poolDayData.totalEarned = earnings
    poolHourData.totalEarned = earnings
    pool.save()
    poolDayData.save()
    poolHourData.save()

}

export function handlePoolOffer(event: LogPoolOffer): void {
    // load in the transaction entity
    let transaction = getTransaction(event, event.block)

    // load in all Pool entities
    let pool = getPool(event.params.pool_asset, event.block, event)
    let poolDayData = getPoolDayData(event.params.pool_asset, event.block, event)
    let poolHourData = getPoolHourData(event.params.pool_asset, event.block, event)

    // determine price of BathToken
    //let bathTokenPrice = event.params.totalSupply.divDecimal(event.params.underlyingBalance.toBigDecimal())
    let bathTokenPrice = event.params.underlyingBalance.divDecimal(event.params.totalSupply.toBigDecimal())

    // update Pool entities
    pool.underlyingBalance = event.params.underlyingBalance
    pool.outstandingAmount = event.params.outstandingAmount
    pool.tokenSupply = event.params.totalSupply
    pool.price = bathTokenPrice
    poolDayData.underlyingBalance = event.params.underlyingBalance
    poolDayData.outstandingAmount = event.params.outstandingAmount
    poolDayData.tokenSupply = event.params.totalSupply
    poolDayData.price = bathTokenPrice
    poolHourData.underlyingBalance = event.params.underlyingBalance
    poolHourData.outstandingAmount = event.params.outstandingAmount
    poolHourData.tokenSupply = event.params.totalSupply
    poolHourData.price = bathTokenPrice

    // save all entities
    transaction.save()
    pool.save()
    poolDayData.save()
    poolHourData.save()

    // update Earnings
    let earnings = getEarnings(event.params.pool_asset, event.block, event)
    pool.totalEarned = earnings
    poolDayData.totalEarned = earnings
    poolHourData.totalEarned = earnings
    pool.save()
    poolDayData.save()
    poolHourData.save()
}

export function handleLogRemoveFilledTradeAmount(event: LogRemoveFilledTradeAmount): void {
    // load in the transaction entity
    let transaction = getTransaction(event, event.block)

    // load in Pool entities
    let pool = getPool(event.params.pool_asset, event.block, event)
    let poolDayData = getPoolDayData(event.params.pool_asset, event.block, event)
    let poolHourData = getPoolHourData(event.params.pool_asset, event.block, event)

    // update Pool entities
    pool.underlyingBalance = event.params.underlyingBalance
    pool.outstandingAmount = event.params.outstandingAmount
    pool.tokenSupply = event.params.totalSupply
    poolDayData.underlyingBalance = event.params.underlyingBalance
    poolDayData.outstandingAmount = event.params.outstandingAmount
    poolDayData.tokenSupply = event.params.totalSupply
    poolHourData.underlyingBalance = event.params.underlyingBalance
    poolHourData.outstandingAmount = event.params.outstandingAmount
    poolHourData.tokenSupply = event.params.totalSupply

    // save all entities
    transaction.save()
    pool.save()
    poolDayData.save()
    poolHourData.save()
}