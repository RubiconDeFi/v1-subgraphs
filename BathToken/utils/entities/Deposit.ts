import { Deposit } from '../../generated/schema'
import { getTransaction } from './Transaction'
import { getPool } from './Pool'
import { getLiquidityProvider } from './LiquidityProvider'
import { getPoolDayData } from './PoolDayData'
import { getPoolHourData } from './PoolHourData'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD } from '../constants'

export function getDeposit(asset: Address, user: Address, block: ethereum.Block, event: ethereum.Event): Deposit {
    const transaction = getTransaction(event, block)
    const pool = getPool(asset, block, event)
    const liquidityProvider = getLiquidityProvider(user)
    const poolDayData = getPoolDayData(asset, block, event)
    const poolHourData = getPoolHourData(asset, block, event)

    let depositID = event.transaction.hash.toHexString()
    .concat('#')
    .concat(user.toHexString())
    let deposit = Deposit.load(depositID)
    if (deposit === null) {
        deposit = new Deposit(depositID)
        deposit.timestamp = block.timestamp
        deposit.transaction = transaction.id
        deposit.pool = pool.id
        deposit.depositAmount = ZERO_BI
        deposit.bathTokenAmount = ZERO_BI
        pool.price = ZERO_BD
        deposit.liquidityProvider = liquidityProvider.id
        deposit.poolDayData = poolDayData.id
        deposit.poolHourData = poolHourData.id
        deposit.save()
        return deposit as Deposit
    }
    return deposit as Deposit
}