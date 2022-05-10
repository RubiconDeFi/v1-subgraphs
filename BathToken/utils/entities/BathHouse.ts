import { BathHouse } from '../../generated/schema'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'

/** TODO: Determine if BathHouse address should be hardcoded or not  */
export function getBathHouse(block: ethereum.Block): BathHouse {
    let bathHouse = BathHouse.load(BATH_HOUSE_ADDRESS)

    if (bathHouse === null) {
        bathHouse = new BathHouse(BATH_HOUSE_ADDRESS)
        bathHouse.save()
        return bathHouse as BathHouse
    }
    return bathHouse as BathHouse
}