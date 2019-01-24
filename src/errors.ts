// tslint:disable: no-any

import { AxiosResponse } from "axios";

export const responseError = (msg: string, response: AxiosResponse<any>) => {
    const error = new Error(msg);
    (error as any).response = response;
    return error;
};

export const updateError = (msg: string, error: Error) => {
    if (!Array.isArray((error as any).original_message)) {
        (error as any).original_message = [];
    }
    (error as any).original_message.push(error.message);
    error.message = msg;
    return error;
};

export const errors = {
    CouldNotFindSwap: "Couldn't find a swap with matching orderID",
    CouldNotAuthorizeSwapper: "Could not authorize swapper",

    InvalidBuffer: "invalid buffer",
    InvalidHex: "invalid hex",
    UnableToConvertToHexadecimalRepresentation: "Unable to convert to hexadecimal representation",
    UnableToConvertToBase64Representation: "Unable to convert to base64 representation",
    UnableToConvertToBuffer: "Unable to convert to buffer",

    UnableToRetrieveStatus: "Unable to retrieve order status",
    UnableToRetrieveSwaps: "Unable to retrieve swaps",
    UnableToFindMatchingSwap: "Unable to find matching swap",

    UnableToSubmitSwap: "Unable to submit swap",
    UserRejectedSwap: "User rejected the swap",
    InvalidPrice: "Invalid price",
    InvalidVolume: "Invalid volume",
    InvalidMinimumVolume: "Invalid minimum volume",
    EthGasStationError: "Cannot retrieve gas price from Eth Gas Station",
    CouldNotConnectSwapServer: "Could not connect to swap server",
    Unimplemented: "Method not implemented.",
    CanceledByUser: "Transaction canceled",
    SignatureCanceledByUser: "Signature canceled",
    UnsignedTransaction: "Unable to sign transaction",
    InvalidOrderDetails: "Something went wrong while encoding order",
    NumericalPrecision: "Unsupported precision numbers",
    FailedDeposit: "Unable to deposit funds",
    FailedBalanceCheck: "Failed to get the current user balance",
    InsufficientBalance: "Insufficient balance",
    InsufficientFunds: "Insufficient funds - please ensure you have enough ETH for the transaction fees",
    UnsupportedFilterStatus: "Unable to filter by specified status",
    UnknownOrderStatus: "Unknown order status",
    InvalidStoragePath: "Storage path must start with either: '~/', './', or '/'",
};
