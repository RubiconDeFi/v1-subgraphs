import { RubiconMarket } from '../../generated/schema'
import { dataSource, ethereum } from '@graphprotocol/graph-ts'
import { RUBICON_MARKET_ADDRESS, ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getRubiconMarket(block: ethereum.Block): RubiconMarket {
    let rubiconMarket = RubiconMarket.load(RUBICON_MARKET_ADDRESS)

    if (rubiconMarket == null) {
        rubiconMarket = new RubiconMarket(RUBICON_MARKET_ADDRESS)
        rubiconMarket.tokenCount = ZERO_BI
        rubiconMarket.pairCount = ZERO_BI
        rubiconMarket.txCount = ZERO_BI
        rubiconMarket.userCount = ZERO_BI
        rubiconMarket.save()
        return rubiconMarket as RubiconMarket
    }
    return rubiconMarket as RubiconMarket
}