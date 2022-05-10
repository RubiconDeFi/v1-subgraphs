import { Token } from '../../generated/schema'
import { ERC20 } from '../../generated/RubiconMarket/ERC20'
//import { ERC20 } from '../../generated/RubiconRouter/ERC20'
//import { TokenWithFaucet } from '../../generated/RubiconMarket/TokenWithFaucet'
import { getRubiconMarket } from './RubiconMarket'
import { dataSource, Address, ethereum, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BI, ONE_BI, ZERO_BD, ADDRESS_ZERO } from '../constants'
/** TODO: figure out how to properly pass in token address */
export function getToken(address: Address, block: ethereum.Block): Token {
    const rubiconMarket = getRubiconMarket(block)

    let token = Token.load(address.toHexString())
    
    if (token == null) {
        let contract = ERC20.bind(address)
        //let contract = TokenWithFaucet.bind(address)
        let decimal = 1
        let decimals = contract.try_decimals()
        if (!decimals.reverted) {
            let decimal = decimals.value
        }

        let names = contract.try_name()
        let name = ''
        if (!names.reverted) {
            let name = names.value
            
        }
        let symbols = contract.try_symbol()
        let symbol = ''
        if (!symbols.reverted) {
            let symbol = symbols.value
        }

        token = new Token(address.toHexString())
        token.market = rubiconMarket.id
        token.startAtTimestamp = block.timestamp
        token.startBlockNumber = block.number
        /** TODO: Look further into Uniswaps token naming convention and see if we ant to implement this here */
        token.symbol = symbol
        token.name = name
        // TODO: add in token decimals call here
        token.decimals = decimal
        token.volume = ZERO_BI
        token.txCount = ZERO_BI
        token.tokenFees = ZERO_BI
        token.save()
        
        /** update RubiconMarket entity token count */
        rubiconMarket.tokenCount = rubiconMarket.tokenCount.plus(ONE_BI)
        rubiconMarket.save()

        return token as Token
    }
    return token as Token
}