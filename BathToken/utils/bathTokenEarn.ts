import { getPool } from './entities/Pool'
import { dataSource, Address, ethereum, BigInt } from '@graphprotocol/graph-ts'

export function getEarnings(asset: Address, block: ethereum.Block, event: ethereum.Event): BigInt {
    let pool = getPool(asset, block, event)
    let earnings = pool.underlyingBalance.minus(pool.totalDeposited.minus(pool.totalWithdrawn))
    return earnings
}