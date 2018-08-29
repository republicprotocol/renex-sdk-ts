import Web3 from "web3";

export function getAccounts(web3: Web3): Promise<string[]> {
    return web3.eth.getAccounts();
}

export function getNetwork(web3: Web3): Promise<string> {
    return (web3.eth.net as any).getNetworkType();
}

export function getBalance(web3: Web3, address: string): Promise<number> {
    return web3.eth.getBalance(address);
}
