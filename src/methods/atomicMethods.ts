/* Atomic balances */

//     if (sdk === null) {
    //         console.error("Invalid parameters to get balances");
    //         return;
    //     }

    //     if (!settlements.get(OrderSettlement.RenExAtomic)) {
    //         return;
    //     }

    //     // Update atomic balances
    //     let atomicBalances = OrderedMap<Token, BN>();
    //     let atomicAddresses = OrderedMap<Token, string>();
    //     const atomicBalanceResponse = await atomic.getBalances();

    //     for (const entry of atomicBalanceResponse) {
    //         atomicBalances = atomicBalances.set(entry.priorityCode, new BN(entry.amount));
    //         atomicAddresses = atomicAddresses.set(entry.priorityCode, entry.address);
    //     }

    //     // dispatch(updateAtomicBalances({ atomicBalances }));
    //     dispatch(updateAtomicAddresses({ atomicAddresses }));

    //     const oldUsableAtomicBalances = usableAtomicBalances;

    //     atomicBalances.map((value: BN, token: number) => {
    //         usableAtomicBalances = usableAtomicBalances.set(token, value);
    //     });

    //     // Remove balances used for open orders from usable balances.
    //     traderOrders.map((order: TraderOrder) => {
    //         if (
    //             //     (
    //             //     order.status !== OrderStatus.Open &&
    //             //     order.status !== OrderStatus.Unknown &&
    //             //     order.status !== OrderStatus.Confirmed
    //             // ) ||
    //             order.trader !== sdk.address ||
    //             order.orderSettlement !== OrderSettlement.RenExAtomic
    //         ) {
    //             return;
    //         }

    //         const volumeBN = readableToBalance(order.volume.toString(), order.parity === OrderParity.BUY ? order.fstCode : order.sndCode);
    //         const primaryToken = order.parity === OrderParity.BUY ? order.fstCode : order.sndCode;
    //         let usableAtomicBalance = usableAtomicBalances.get(primaryToken);
    //         usableAtomicBalance = usableAtomicBalance.sub(volumeBN);

    //         if (usableAtomicBalance.lt(new BN(0))) {
    //             usableAtomicBalance = new BN(0);
    //         }
    //         usableAtomicBalances = usableAtomicBalances.set(primaryToken, usableAtomicBalance);
    //     });

    //     if (!usableAtomicBalances.equals(oldUsableAtomicBalances)) {
    //         // dispatch(updateUsableAtomicBalance({ usableAtomicBalances }));
    //     }

/* Atomic Order Status */

// if (address === null) {
    //     console.error("Invalid parameters to check order execution");
    //     return;
    // }

    // if (!settlements.get(OrderSettlement.RenExAtomic)) {
    //     return;
    // }

    // // Filter if order is for different network or trader
    // let toCheck = traderOrders.toArray().filter(
    //     defaultOrderFilter(address)
    // );

    // // Only check confirmed orders
    // toCheck = toCheck.filter(
    //     (order => {
    //         // Only check for confirmed orders (and orders from an older orderbook)
    //         // and only for orders submitted to the RenExAtomic darkpool
    //         return (order.status === OrderStatus.Confirmed || order.status === OrderStatus.Migrating) &&
    //             (order.orderSettlement === OrderSettlement.RenExAtomic);
    //     })
    // );

    // for (const order of toCheck) {

    //     const status: AtomicSwapStatus = await getOrderStatus(order.id);
    //     if (order.atomicStatus !== status) {
    //         dispatch(updateAtomicOrder({ orderID: order.id, orderStatus: status }));
    //     }

    //     if (status === AtomicSwapStatus.Redeemed) {
    //         dispatch(setAlert({
    //             alert: new Alert({
    //                 alertType: AlertType.Success,
    //                 // TODO: Replace with execution details
    //                 message: "Your order has successfully been executed",
    //             })
    //         }));
    //         // await syncLocalStorage(dispatch);
    //         dispatch(updateOrderStatus({ orderID: order.id, orderStatus: OrderStatus.Executed }));

    //         const executedOrder = new ExecutedOrder();
    //         dispatch(addExecutedOrder({ executedOrder }));
    //     } else if (status === AtomicSwapStatus.Refunded) {
    //         dispatch(setAlert({
    //             alert: new Alert({
    //                 alertType: AlertType.Warning,
    //                 message: "Your order was refunded by the other trader",
    //             })
    //         }));
    //         // await syncLocalStorage(dispatch);
    //         dispatch(updateOrderStatus({ orderID: order.id, orderStatus: OrderStatus.Failed }));
    //     }
    // }
