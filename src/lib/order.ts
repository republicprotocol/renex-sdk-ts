import BigNumber from "bignumber.js";
import BN from "bn.js";

import { OrderStatus } from "../index";
import { ErrUnknownOrderStatus } from "./errors";
import { Record } from "./record";

export class CoExp extends Record({
    co: 0,
    exp: 0,
}) { }

export function priceToCoExp(price: BN): CoExp {
    const priceF = (new BigNumber(price.toString())).div(new BigNumber("1e12"));
    return priceFloatToCoExp(priceF);
}

export function volumeToCoExp(volume: BN): CoExp {
    const volumeF = (new BigNumber(volume.toString())).div(new BigNumber("1e12"));
    return volumeFloatToCoExp(volumeF);
}

export function priceFloatToCoExp(price: BigNumber): CoExp {
    if (price.gte(10.0)) {
        const prev = priceFloatToCoExp(price.div(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp + 1,
        });
    } else if (price.gte(1)) {
        const _try = price.div(0.005).integerValue(BigNumber.ROUND_FLOOR);
        return new CoExp({
            co: _try.toNumber(),
            exp: 38,
        });
    } else if (price.gt(0)) {
        const prev = priceFloatToCoExp(price.times(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp - 1,
        });
    } else {
        return new CoExp({
            co: 0,
            exp: 0,
        });
    }
}

export function volumeFloatToCoExp(volume: BigNumber): CoExp {
    if (volume.gte(10)) {
        const prev = volumeFloatToCoExp(volume.div(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp + 1,
        });
    } else if (volume.gte(1)) {
        const _try = volume.div(0.2).integerValue(BigNumber.ROUND_FLOOR);
        return new CoExp({
            co: _try.toNumber(),
            exp: 12,
        });
    } else if (volume.gt(0)) {
        const prev = volumeFloatToCoExp(volume.times(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp - 1,
        });
    }
    return new CoExp({
        co: 0,
        exp: 0,
    });
}

/**
 * Convert order state returned from the Orderbook contract into an OrderStatus enum.
 *
 * The state returned by the Orderbook does not provide settlement status information.
 * A separate call to the RenExSettlement contract is needed to determine the order status
 * during settlement.
 *
 * @throws {ErrUnknownOrderStatus} Will throw when the state is neither 0, 1, or 2.
 * @param {number} state The state of the order returned from the Orderbook.
 * @returns {OrderStatus} The order status.
 */
export function orderbookStateToOrderStatus(state: number): OrderStatus {
    switch (state) {
        case 0:
            return OrderStatus.NOT_SUBMITTED;
        case 1:
            return OrderStatus.OPEN;
        case 2:
            return OrderStatus.CONFIRMED;
        case 3:
            return OrderStatus.CANCELED;
        default:
            throw new Error(`${ErrUnknownOrderStatus}: ${state}`);
    }
}

/**
 * Convert settlement status returned from the RenExSettlement contract into an OrderStatus enum.
 *
 * The RenExSettlement contract can return 4 different values: 0, 1, 2, and 3.
 * Status 0 means that the order has not yet been submitted for settlement.
 * Status 1 means that the order has been submitted for settlement but has not yet been settled.
 * Status 2 means the order has been settled.
 * Status 3 means the order has been slashed.
 *
 * @throws {ErrUnknownOrderStatus} Will throw when the state is neither 0, 1, 2, or 3.
 * @param {number} status The status of the order returned from the RenExSettlement contract.
 * @returns {OrderStatus} The order status.
 */
export function settlementStatusToOrderStatus(status: number): OrderStatus {
    switch (status) {
        case 0:
            return OrderStatus.CONFIRMED;
        case 1:
            return OrderStatus.CONFIRMED;
        case 2:
            return OrderStatus.SETTLED;
        case 3:
            return OrderStatus.SLASHED;
        default:
            throw new Error(`${ErrUnknownOrderStatus}: ${status}`);
    }
}
