import { PoolBuffer } from '../../generated/schema'
import { getPool } from './Pool'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'
/** TODO: Determine if asset should be to string or hex string */
export function getPoolBuffer(poolAsset: Address, asset: Address, block: ethereum.Block, event: ethereum.Event): PoolBuffer {
    //const pool = getPool(asset, block, event)
    const pool = getPool(poolAsset, block, event)

    let bufferID = pool.id
    .concat('#')
    .concat(asset.toHexString())
    let poolBuffer = PoolBuffer.load(bufferID)
    if (poolBuffer === null) {
        poolBuffer = new PoolBuffer(bufferID)
        poolBuffer.pool = pool.id
        poolBuffer.token = 'TODO'
        poolBuffer.name = 'TODO'
        poolBuffer.bufferAmount = ZERO_BI
        poolBuffer.save()
        return poolBuffer as PoolBuffer
    }
    return poolBuffer as PoolBuffer
}