import { User } from "../../generated/schema"
import { getRubiconMarket } from "./RubiconMarket"
import { getRubiconDayData } from "./RubiconDayData"
import { getRubiconHourData } from "./RubiconHourData"
import { dataSource, Address, ethereum } from "@graphprotocol/graph-ts"
import { ONE_BI } from '../constants'

export function getUser(userAddress: Address, block: ethereum.Block): User { 
    let rubiconMarket = getRubiconMarket(block)
    let rubiconDayData = getRubiconDayData(block)
    let rubiconHourData = getRubiconHourData(block)

    let user = User.load(userAddress.toHexString())
    if (user == null) {
        user = new User(userAddress.toHexString())

        /** increment RubiconMarket entity to include new user */
        rubiconMarket.userCount = rubiconMarket.userCount.plus(ONE_BI)
        rubiconMarket.save()

        /** increment RubiconDayData entity to include new user */
        rubiconDayData.newUserCount = rubiconDayData.newUserCount.plus(ONE_BI)
        rubiconDayData.save()

        /** increment RubiconHourData entity to include new user */
        rubiconHourData.newUserCount = rubiconHourData.newUserCount.plus(ONE_BI)
        rubiconHourData.save()

        user.save()
        return user as User;
    }
    return user as User
}