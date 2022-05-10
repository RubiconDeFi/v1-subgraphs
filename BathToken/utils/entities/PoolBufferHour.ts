import { PoolBufferHour } from '../../generated/schema'
import { getPoolHourData } from './PoolHourData'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'
/** TODO: Determine if asset should be to string or hex string */
export function getPoolBufferHour(poolAsset: Address, asset: Address, block: ethereum.Block, event: ethereum.Event): PoolBufferHour {
    const poolHourData = getPoolHourData(poolAsset, block, event)

    let timestamp = block.timestamp.toI32()
    let hourID = timestamp / 86400
    let bufferID = poolHourData.id
    .concat('#')
    .concat(asset.toHexString())
    .concat('#')
    .concat(hourID.toString())
    let poolBufferHour = PoolBufferHour.load(bufferID)
    if (poolBufferHour === null) {
        poolBufferHour = new PoolBufferHour(bufferID)
        poolBufferHour.date = block.timestamp
        poolBufferHour.poolHourData = poolHourData.id
        poolBufferHour.token = asset.toHexString()
        poolBufferHour.name = ''
        poolBufferHour.bufferAmount = ZERO_BI
        poolBufferHour.save()
        return poolBufferHour as PoolBufferHour
    }
    return poolBufferHour as PoolBufferHour
}