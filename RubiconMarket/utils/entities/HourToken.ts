import { HourToken } from '../../generated/schema'
import { getRubiconHourData } from './RubiconHourData'
import { getToken } from './Token'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getHourToken(address: Address, block: ethereum.Block): HourToken {
    const rubiconHourData = getRubiconHourData(block)
    const token = getToken(address, block)
    
    let timestamp = block.timestamp.toI32()
    let hourID = timestamp / 3600
    let hourTokenID = token.id
        .concat('#')
        .concat(hourID.toString())
    let hourToken = HourToken.load(hourTokenID)
    if (hourToken === null) {
        hourToken = new HourToken(hourTokenID)
        hourToken.market = rubiconHourData.id
        hourToken.startAtTimestamp = block.timestamp
        hourToken.startBlockNumber = block.number
        hourToken.token = token.id
        hourToken.symbol = token.symbol
        hourToken.name = token.name
        hourToken.decimals = token.decimals
        hourToken.volume = ZERO_BI
        hourToken.txCount = ZERO_BI
        hourToken.hourTokenFees = ZERO_BI
        hourToken.save()
        return hourToken as HourToken
    }
    return hourToken as HourToken
}