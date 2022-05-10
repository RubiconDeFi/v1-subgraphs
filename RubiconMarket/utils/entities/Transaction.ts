import { Transaction } from '../../generated/schema'
import { getRubiconMarket } from './RubiconMarket'
import { getRubiconDayData } from './RubiconDayData'
import { getRubiconHourData } from './RubiconHourData'
import { dataSource, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'
/** TODO: see if even.block is a functional substitue for ethereum.Block */
export function getTransaction(event: ethereum.Event): Transaction {
    let rubiconMarket = getRubiconMarket(event.block)
    let rubiconDayData = getRubiconDayData(event.block)
    let rubiconHourData = getRubiconHourData(event.block)
    let transaction = Transaction.load(event.transaction.hash.toHexString())
    
    if (transaction == null) {
        transaction = new Transaction(event.transaction.hash.toHexString())
        transaction.blockNumber = event.block.number
        transaction.timestamp = event.block.timestamp
        /** TODO: Determine if gasUsed is depreciated and what replacement */
        transaction.gasUsed = event.transaction.gasLimit
        transaction.gasPrice = event.transaction.gasPrice

        /** increment RubiconMarket entity to include new transaction */
        rubiconMarket.txCount = rubiconMarket.txCount.plus(ONE_BI)
        rubiconMarket.save()

        /** increment RubiconDayData entity to include new transaction */
        rubiconDayData.txCount = rubiconDayData.txCount.plus(ONE_BI)
        rubiconDayData.save()

        /** increment RubiconHourData entity to include new transaction */
        rubiconHourData.txCount = rubiconHourData.txCount.plus(ONE_BI)
        rubiconHourData.save()

        transaction.save()
        return transaction as Transaction
    }
    return transaction as Transaction
}
