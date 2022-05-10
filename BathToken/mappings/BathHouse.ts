import { AdminWriteBathTokenCall } from "../generated/BathHouse/BathHouse"
import { BathHouse } from "../generated/schema"
import { Pool } from "../generated/schema"
import { BathToken } from "../generated/templates"
import { createPool } from "../utils/entities/Pool"
import { getPoolDayData } from "../utils/entities/PoolDayData"
import { getPoolHourData } from "../utils/entities/PoolHourData"
import { LogNewBathToken } from "../generated/BathHouse/BathHouse"
import { BigInt, Address, BigDecimal, store, log } from '@graphprotocol/graph-ts'
import { RUBICON_MARKET_ADDRESS, ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../utils/constants'

// function to handle the creation of new BathToken contracts and their associated entities
export function handlePoolCreated(event: LogNewBathToken): void {
    log.warning('pool address: {}, underlying token address: {}, timestamp: {}, BathToken creator: {}', [event.params.bathTokenAddress.toHexString(), event.params.underlyingToken.toHexString(), event.params.timestamp.toString(), event.params.bathTokenCreator.toHexString()])
    BathToken.create(event.params.bathTokenAddress)
    
    // create the Pool entity 
    let pool = createPool(event.params.underlyingToken, event.params.bathTokenAddress, event.params.bathTokenCreator, event.block)

    // this is only for migrating the old V0 pools to the V1 structure for Optimism
    //let ethPool = Pool.load(Address.fromString('0x4200000000000000000000000000000000000006').toHexString())
    //if (ethPool == null) {
    //    BathToken.create(Address.fromString('0x5790AedddfB25663f7dd58261De8E96274A82BAd'))
    //    ethPool = createPool(Address.fromString('0x4200000000000000000000000000000000000006'), Address.fromString('0x5790AedddfB25663f7dd58261De8E96274A82BAd'), Address.fromString('0x68B5fBd7CEFEE3076e4101920b13C9Cc1A6cbF0e'), event.block)
    //}
}

//export function handleAdminWriteBathToken(event: LogAdminWriteBathTokenCall): void {
//    log.warning('pool address: {}, underlying token address: {}, timestamp: {}, BathToken creator: {}', [event.params.bathTokenAddress.toHexString(), event.params.underlyingToken.toHexString(), event.params.timestamp.toString(), event.params.bathTokenCreator.toHexString()])
//    BathToken.create(event.params.bathTokenAddress)
//    
//    // create the Pool entity 
//    let pool = createPool(event.params.underlyingToken, event.params.bathTokenAddress, event.params.bathTokenCreator, event.block)
//}