import { RubiconHourData } from '../../generated/schema'
import { getRubiconDayData } from './RubiconDayData'
import { dataSource, ethereum } from '@graphprotocol/graph-ts'
import { RUBICON_MARKET_ADDRESS, ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getRubiconHourData(block: ethereum.Block): RubiconHourData {  
    const rubiconDayData = getRubiconDayData(block)
    
    let timestamp = block.timestamp.toI32()
    let hourID = timestamp / 3600
    let hourDataID = RUBICON_MARKET_ADDRESS
        .concat('#')
        .concat(hourID.toString())
    let rubiconHourData = RubiconHourData.load(hourDataID)
    if ( rubiconHourData === null ) {
        rubiconHourData = new RubiconHourData(hourDataID)
        rubiconHourData.date = block.timestamp
        rubiconHourData.market = rubiconDayData.id
        rubiconHourData.txCount = ZERO_BI
        rubiconHourData.newUserCount = ZERO_BI
        rubiconHourData.save()
        return rubiconHourData as RubiconHourData
    }
    return rubiconHourData as RubiconHourData
}