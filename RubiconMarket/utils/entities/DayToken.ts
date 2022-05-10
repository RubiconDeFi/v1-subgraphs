import { DayToken } from '../../generated/schema'
import { getRubiconDayData } from './RubiconDayData'
import { getToken } from './Token'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'

export function getDayToken(address: Address, block: ethereum.Block): DayToken {
    const rubiconDayData = getRubiconDayData(block)
    const token = getToken(address, block)

    let timestamp = block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayTokenID = token.id
        .concat('#')
        .concat(dayID.toString())
    let dayToken = DayToken.load(dayTokenID)
    if (dayToken === null) {
        dayToken = new DayToken(dayTokenID)
        dayToken.market = rubiconDayData.id
        dayToken.startAtTimestamp = block.timestamp
        dayToken.startBlockNumber = block.number
        dayToken.token = token.id
        dayToken.symbol = token.symbol
        dayToken.name = token.name
        dayToken.decimals = token.decimals
        dayToken.volume = ZERO_BI
        dayToken.txCount = ZERO_BI
        dayToken.dayTokenFees = ZERO_BI
        dayToken.save()
        return dayToken as DayToken
    }
    return dayToken as DayToken
}