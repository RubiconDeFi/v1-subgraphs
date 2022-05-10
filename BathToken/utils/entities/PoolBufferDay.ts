import { PoolBufferDay } from '../../generated/schema'
import { getPoolDayData } from './PoolDayData'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'
/** TODO: Determine if asset should be to string or hex string */
export function getPoolBufferDay(poolAsset: Address, asset: Address, block: ethereum.Block, event: ethereum.Event): PoolBufferDay {
    const poolDayData = getPoolDayData(poolAsset, block, event)

    let timestamp = block.timestamp.toI32()
    let dayID = timestamp / 86400
    let bufferID = poolDayData.id
    .concat('#')
    .concat(asset.toHexString())
    .concat('#')
    .concat(dayID.toString())
    let poolBufferDay = PoolBufferDay.load(bufferID)
    if (poolBufferDay === null) {
        poolBufferDay = new PoolBufferDay(bufferID)
        poolBufferDay.date = block.timestamp
        poolBufferDay.poolDayData = poolDayData.id
        poolBufferDay.token = asset.toHexString()
        poolBufferDay.name = ''
        poolBufferDay.bufferAmount = ZERO_BI
        poolBufferDay.save()
        return poolBufferDay as PoolBufferDay
    }
    return poolBufferDay as PoolBufferDay
}