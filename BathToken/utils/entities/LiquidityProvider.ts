import { LiquidityProvider } from '../../generated/schema'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, BATH_HOUSE_ADDRESS } from '../constants'

export function getLiquidityProvider(address: Address): LiquidityProvider {
    let liquidityProvider = LiquidityProvider.load(address.toHexString())

    if (liquidityProvider === null) {
        liquidityProvider = new LiquidityProvider(address.toHexString())
        liquidityProvider.save()
        return liquidityProvider as LiquidityProvider
    }
    return liquidityProvider as LiquidityProvider
}