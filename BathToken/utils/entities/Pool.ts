import { Pool } from '../../generated/schema'
import { getBathHouse } from './BathHouse'
import { dataSource, Address, ethereum, log } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'
/** TODO: Check on naming conventions and that block.number is correct */
export function getPool(asset: Address, block: ethereum.Block, event: ethereum.Event): Pool {
    const bathHouse = getBathHouse(block)

    let pool = Pool.load(asset.toHexString())
    if (pool === null) {
        log.warning('creating pool from the following: {}, at the following time: {}, and block: {}', [asset.toHexString(), block.timestamp.toString(), block.number.toString()])
        pool = new Pool(asset.toHexString())
        pool.bathHouse = bathHouse.id
        pool.address = ''
        pool.name = ''
        pool.underlyingToken = asset.toHexString()
        pool.createdAtTimestamp = block.timestamp
        pool.createdAtBlockNumber = block.number
        pool.bathTokenCreator = ''
        pool.underlyingBalance = ZERO_BI
        pool.outstandingAmount = ZERO_BI
        pool.tokenSupply = ZERO_BI
        pool.totalDeposited = ZERO_BI
        pool.totalWithdrawn = ZERO_BI
        pool.price = ZERO_BD
        pool.totalEarned = ZERO_BI
        pool.save()
        return pool as Pool
    }
    return pool as Pool
}

export function createPool(asset: Address, poolAddress: Address, creator: Address, block: ethereum.Block): Pool {
    const bathHouse = getBathHouse(block)

    let pool = Pool.load(asset.toHexString())
    if (pool === null) {
        log.warning('creating pool from the following: {}, at the following time: {}, and block: {}', [asset.toHexString(), block.timestamp.toString(), block.number.toString()])
        pool = new Pool(asset.toHexString())
        pool.bathHouse = bathHouse.id
        pool.address = poolAddress.toHexString()
        pool.name = ''
        pool.underlyingToken = asset.toHexString()
        pool.createdAtTimestamp = block.timestamp
        pool.createdAtBlockNumber = block.number
        pool.bathTokenCreator = creator.toHexString()
        pool.underlyingBalance = ZERO_BI
        pool.outstandingAmount = ZERO_BI
        pool.tokenSupply = ZERO_BI
        pool.totalDeposited = ZERO_BI
        pool.totalWithdrawn = ZERO_BI
        pool.price = ZERO_BD
        pool.totalEarned = ZERO_BI
        pool.save()
        return pool as Pool
    }
    return pool as Pool   
}