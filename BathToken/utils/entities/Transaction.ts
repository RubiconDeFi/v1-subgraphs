import { Transaction } from '../../generated/schema'
import { dataSource, Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD } from '../constants'

export function getTransaction(event: ethereum.Event, block: ethereum.Block): Transaction {
    let transaction = Transaction.load(event.transaction.hash.toHexString())
    
    if (transaction == null) {
        transaction = new Transaction(event.transaction.hash.toHexString())
        transaction.blockNumber = event.block.number
        transaction.timestamp = event.block.timestamp
        /** TODO: Determine if gasUsed is depreciated and what replacement */
        transaction.gasUsed = event.transaction.gasLimit
        transaction.gasPrice = event.transaction.gasPrice
        transaction.save()
        return transaction as Transaction
    }
    return transaction as Transaction
}