import { Pool } from "../generated/schema"
import { PoolBuffer } from "../generated/schema"
import { PoolBufferDay } from "../generated/schema"
import { PoolBufferHour } from "../generated/schema"
import { getPoolBuffer } from "../utils/entities/PoolBuffer"
import { getPoolBufferDay } from "../utils/entities/PoolBufferDay"
import { getPoolBufferHour } from "../utils/entities/PoolBufferHour"
import { LogTake } from "../generated/RubiconMarket/RubiconMarket"
import { tokenToDecimals } from "../utils/tokenData"
import { BigInt, Address, BigDecimal, store } from '@graphprotocol/graph-ts'
import { RUBICON_MARKET_ADDRESS, ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../utils/constants'

export function handleLogTake(event: LogTake): void {
    
    let pool = Pool.load(event.params.maker.toHexString())
    if (pool !== null) {
        // load in pool buffer entities 
        let poolBuffer = getPoolBuffer(event.params.buy_gem, event.params.pay_gem, event.block, event)
        let poolBufferDay = getPoolBufferDay(event.params.buy_gem, event.params.pay_gem, event.block, event)
        let poolBufferHour = getPoolBufferHour(event.params.buy_gem, event.params.pay_gem, event.block, event)

        // update pool buffer entities
        poolBuffer.bufferAmount = poolBuffer.bufferAmount.plus(event.params.take_amt)
        poolBufferDay.bufferAmount = poolBufferDay.bufferAmount.plus(event.params.take_amt)
        poolBufferHour.bufferAmount = poolBufferHour.bufferAmount.plus(event.params.take_amt)

        // save pool buffer entities
        poolBuffer.save()
        poolBufferDay.save()
        poolBufferHour.save()
    }
    // TODO: add logic to handle logTake(s) by the pool itself
}