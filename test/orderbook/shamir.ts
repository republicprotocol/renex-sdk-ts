import { BN } from "bn.js";
import { randomBytes } from "crypto";
import { List, Map } from "immutable";
import * as shamir from "shamir";
import { expect } from 'chai';
import * as chaiAsPromised from "chai-as-promised";

describe("Shamir's Secret Sharing", () => {
    it("should return the correct number of shares", () => { 
        const n = 100;
        const k = 50;
        const secret = new BN(1234);
        const shares = shamir.split(n, k, secret);
        expect(shares).not.to.be.undefined;
        expect(shares.size).equals(n);
    });

    it("should throw an error when k is greater than n", () => {
        const n = 50;
        const k = 100;
        const secret = new BN(1234);
        expect(() => {
            shamir.split(n, k, secret);
        }).throws();
    });

    it("should throw an error when the secret is greater than the prime", () => {
        const n = 50;
        const k = 100;
        const secret = shamir.PRIME.add(new BN(1));
        expect(() => {
            shamir.split(n, k, secret);
        }).throws();
    });

    it("should return the required secret from the threshold of shares", () => {
        const n = 100;
        const k = 50;
        const secret = new BN(1234);
        const shares = shamir.split(n, k, secret);
        expect(shares).not.to.be.undefined;
        expect(shares.size).equals(n);

        // Attempt to decode the secret with k to n shares.
        for (let i = k; i <= n; i++) {
            // Pick i unique indices in the range [0, i).
            let indices = Map<number, shamir.Share>();
            for (let j = 0; j < i; j++) {
                let index;
                do {
                    index = Math.floor(Math.random() * i);
                    if (indices.get(index) === undefined) {
                        indices = indices.set(index, new shamir.Share(index, new BN(0)));
                        break;
                    }
                } while (indices.get(index) !== undefined);
            }

            // Use i shares to reconstruct the secret.
            let kShares = List<shamir.Share>();
            for (let j = 0; j < indices.size; j++) {
                kShares = kShares.set(j, shares.get(j));
            }
            const decodedSecret = shamir.join(kShares);
            expect(decodedSecret.cmp(secret)).equals(0);
        }
    });

    it("should not return the required secret from less than the threshold of shares", () => {
        const n = 100;
        const k = 50;
        const secret = new BN(1234);
        const shares = shamir.split(n, k, secret);
        expect(shares).not.to.be.undefined;
        expect(shares.size).equals(n);

        // Attempt to decode the secret with less than k shares.
        for (let i = 0; i < k; i++) {
            // Pick i unique indices in the range [0, i).
            let indices = Map<number, shamir.Share>();
            for (let j = 0; j < i; j++) {
                let index;
                do {
                    index = Math.floor(Math.random() * i);
                    if (indices.get(index) === undefined) {
                        indices = indices.set(index, new shamir.Share(index, new BN(0)));
                        break;
                    }
                } while (indices.get(index) !== undefined);
            }

            // Use i shares to reconstruct the secret.
            let kShares = List<shamir.Share>();
            for (let j = 0; j < indices.size; j++) {
                kShares = kShares.set(j, shares.get(j));
            }
            const decodedSecret = shamir.join(kShares);
            expect(decodedSecret.cmp(secret)).not.equal(0);
        }
    });

});



