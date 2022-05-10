import { PoolHourData } from '../../generated/schema'
import { getPool } from './Pool'
import { getBathHouse } from './BathHouse'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'
/** TODO: Check on naming conventions and that block.number is correct */
export function getPoolHourData(asset: Address, block: ethereum.Block, event: ethereum.Event): PoolHourData {
    const bathHouse = getBathHouse(block)
    const pool = getPool(asset, block, event)

    let timestamp = block.timestamp.toI32()
    let hourID = timestamp / 3600
    let hourDataID = pool.id
        .concat('#')
        .concat(hourID.toString())

    let poolHourData = PoolHourData.load(hourDataID)
    if (poolHourData === null) {
        poolHourData = new PoolHourData(hourDataID)
        poolHourData.periodStartUnix = block.timestamp
        poolHourData.pool = pool.id
        poolHourData.name = ''
        poolHourData.underlyingToken = asset.toHexString()
        poolHourData.startedAtBlockNumber = block.number
        poolHourData.underlyingBalance = ZERO_BI
        poolHourData.outstandingAmount = ZERO_BI
        poolHourData.tokenSupply = ZERO_BI
        poolHourData.tokensMinted = ZERO_BI
        poolHourData.tokensBurned = ZERO_BI
        poolHourData.totalDeposited = ZERO_BI
        poolHourData.totalWithdrawn = ZERO_BI
        poolHourData.price = ZERO_BD
        poolHourData.totalEarned = ZERO_BI
        poolHourData.save()
        return poolHourData as PoolHourData
    }
    return poolHourData as PoolHourData
}