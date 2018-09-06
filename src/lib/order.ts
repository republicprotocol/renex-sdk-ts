import BigNumber from "bignumber.js";
import { BN } from "bn.js";

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
    if (price.gt(10.0)) {
        const prev = priceFloatToCoExp(price.div(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp + 1,
        });
    } else if (price.lt(0.005)) {
        const prev = priceFloatToCoExp(price.times(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp - 1,
        });
    } else {
        if (price.eq(0)) {
            return new CoExp({
                co: 0,
                exp: 0,
            });
        }
        if (price.lt(1)) {
            const prev = priceFloatToCoExp(price.times(10));
            return new CoExp({
                co: prev.co,
                exp: prev.exp - 1,
            });
        }
    }
    const _try = price.div(0.005).integerValue();
    return new CoExp({
        co: _try.toNumber(),
        exp: 38,
    });
}

export function volumeFloatToCoExp(volume: BigNumber): CoExp {
    if (volume.gt(10)) {
        const prev = volumeFloatToCoExp(volume.div(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp + 1,
        });
    } else if (volume.lt(0.2)) {
        const prev = volumeFloatToCoExp(volume.times(10));
        return new CoExp({
            co: prev.co,
            exp: prev.exp - 1,
        });
    } else {
        if (volume.eq(0)) {
            return new CoExp({
                co: 0,
                exp: 0,
            });
        }
        if (volume.lt(1)) {
            const prev = volumeFloatToCoExp(volume.times(10));
            return new CoExp({
                co: prev.co,
                exp: prev.exp - 1,
            });
        }
    }
    const _try = volume.div(0.2).integerValue();
    return new CoExp({
        co: _try.toNumber(),
        exp: 12,
    });
}

export function orderbookStateToOrderStatus(state: number): OrderStatus {
    switch (state) {
        case 0:
            return OrderStatus.NOT_SUBMITTED;
        case 1:
            return OrderStatus.OPEN;
        case 2:
            return OrderStatus.CONFIRMED;
        default:
            throw new Error(ErrUnknownOrderStatus);
    }
}

export function settlementStatusToOrderStatus(status: number): OrderStatus {
    switch (status) {
        case 0:
            // Order has not yet been submitted to settlement
            return OrderStatus.CONFIRMED;
        case 1:
            // Order info has been staged for settlement but has not settled
            return OrderStatus.CONFIRMED;
        case 2:
            return OrderStatus.SETTLED;
        case 3:
            return OrderStatus.SLASHED;
        default:
            throw new Error(ErrUnknownOrderStatus);
    }
}
