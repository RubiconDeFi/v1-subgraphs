import { PoolPosition } from '../../generated/schema'
import { getLiquidityProvider } from './LiquidityProvider'
import { getPool } from './Pool'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'

export function getPoolPosition(user: Address, asset: Address, block: ethereum.Block, event: ethereum.Event): PoolPosition {
    const liquidityProvider = getLiquidityProvider(user)
    const pool = getPool(asset, block, event)

    let positionID = liquidityProvider.id
    .concat('#')
    .concat(pool.id)
    let poolPosition = PoolPosition.load(positionID)
    if (poolPosition === null) {
        poolPosition = new PoolPosition(positionID)
        poolPosition.liquidityProvider = liquidityProvider.id
        poolPosition.pool = pool.id
        poolPosition.bathTokenAmount = ZERO_BI
        poolPosition.totalDeposited = ZERO_BI
        poolPosition.totalWithdrawn = ZERO_BI
        poolPosition.save()
        return poolPosition as PoolPosition
    }
    return poolPosition as PoolPosition
}