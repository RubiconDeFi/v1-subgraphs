import { PoolDayData } from '../../generated/schema'
import { getPool } from './Pool'
import { getBathHouse } from './BathHouse'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'
/** TODO: Check on naming conventions and that block.number is correct */
export function getPoolDayData(asset: Address, block: ethereum.Block, event: ethereum.Event): PoolDayData {
    const bathHouse = getBathHouse(block)
    const pool = getPool(asset, block, event)

    let timestamp = block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayDataID = pool.id
        .concat('#')
        .concat(dayID.toString())

    let poolDayData = PoolDayData.load(dayDataID)
    if (poolDayData === null) {
        poolDayData = new PoolDayData(dayDataID)
        poolDayData.date = block.timestamp
        poolDayData.pool = pool.id
        poolDayData.name = ''
        poolDayData.underlyingToken = asset.toHexString()
        poolDayData.startedAtBlockNumber = block.number
        poolDayData.underlyingBalance = ZERO_BI
        poolDayData.outstandingAmount = ZERO_BI
        poolDayData.tokenSupply = ZERO_BI
        poolDayData.tokensMinted = ZERO_BI
        poolDayData.tokensBurned = ZERO_BI
        poolDayData.totalDeposited = ZERO_BI
        poolDayData.totalWithdrawn = ZERO_BI
        poolDayData.price = ZERO_BD
        poolDayData.totalEarned = ZERO_BI
        poolDayData.save()
        return poolDayData as PoolDayData
    }
    return poolDayData as PoolDayData
}