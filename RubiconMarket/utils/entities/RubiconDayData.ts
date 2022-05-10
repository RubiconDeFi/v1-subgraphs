import { RubiconDayData } from '../../generated/schema'
import { dataSource, ethereum } from '@graphprotocol/graph-ts'
import { RUBICON_MARKET_ADDRESS, ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getRubiconDayData(block: ethereum.Block): RubiconDayData {    
    let timestamp = block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayDataID = RUBICON_MARKET_ADDRESS
        .concat('#')
        .concat(dayID.toString())
    let rubiconDayData = RubiconDayData.load(dayDataID)
    if ( rubiconDayData === null ) {
        rubiconDayData = new RubiconDayData(dayDataID)
        rubiconDayData.date = block.timestamp
        rubiconDayData.txCount = ZERO_BI
        rubiconDayData.newUserCount = ZERO_BI
        rubiconDayData.save()
        return rubiconDayData as RubiconDayData
    }
    return rubiconDayData as RubiconDayData
}