import Web3 from "web3";
import { Provider } from "web3/types";

class RenExSDK {
    private web3;

    /**
     *Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider) {
        this.web3 = new Web3(provider);
    }
}