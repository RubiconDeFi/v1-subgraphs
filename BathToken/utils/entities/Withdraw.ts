import { Withdraw } from '../../generated/schema'
import { getTransaction } from './Transaction'
import { getPool } from './Pool'
import { getLiquidityProvider } from './LiquidityProvider'
import { getPoolDayData } from './PoolDayData'
import { getPoolHourData } from './PoolHourData'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD } from '../constants'

export function getWithdraw(asset: Address, user: Address, block: ethereum.Block, event: ethereum.Event): Withdraw {
    const transaction = getTransaction(event, block)
    const pool = getPool(asset, block, event)
    const liquidityProvider = getLiquidityProvider(user)
    const poolDayData = getPoolDayData(asset, block, event)
    const poolHourData = getPoolHourData(asset, block, event)

    let withdrawID = event.transaction.hash.toHexString()
    .concat('#')
    .concat(user.toHexString())
    let withdraw = Withdraw.load(withdrawID)
    if (withdraw === null) {
        withdraw = new Withdraw(withdrawID)
        withdraw.timestamp = block.timestamp
        withdraw.transaction = transaction.id
        withdraw.pool = pool.id
        withdraw.withdrawAmount = ZERO_BI
        withdraw.bathTokenBurned = ZERO_BI
        pool.price = ZERO_BD
        withdraw.liquidityProvider = liquidityProvider.id
        withdraw.poolDayData = poolDayData.id
        withdraw.poolHourData = poolHourData.id
        withdraw.save()
        return withdraw as Withdraw
    }
    return withdraw as Withdraw
}