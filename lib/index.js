module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/contracts/ABIs/DarknodeRegistry.json":
/*!**************************************************!*\
  !*** ./src/contracts/ABIs/DarknodeRegistry.json ***!
  \**************************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, default */
/***/ (function(module) {

module.exports = [{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isPendingRegistration","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numDarknodesNextEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_darknodeID","type":"address"},{"name":"_publicKey","type":"bytes"},{"name":"_bond","type":"uint256"}],"name":"register","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_nextMinimumBond","type":"uint256"}],"name":"updateMinimumBond","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"numDarknodes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"getDarknodeOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nextSlasher","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isPendingDeregistration","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_start","type":"address"},{"name":"_count","type":"uint256"}],"name":"getPreviousDarknodes","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nextMinimumEpochInterval","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumEpochInterval","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_prover","type":"address"},{"name":"_challenger1","type":"address"},{"name":"_challenger2","type":"address"}],"name":"slash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isRefundable","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"previousEpoch","outputs":[{"name":"epochhash","type":"uint256"},{"name":"blocknumber","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nextMinimumBond","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nextMinimumEpochInterval","type":"uint256"}],"name":"updateMinimumEpochInterval","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nextMinimumPodSize","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"numDarknodesPreviousEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"currentEpoch","outputs":[{"name":"epochhash","type":"uint256"},{"name":"blocknumber","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isRegisteredInPreviousEpoch","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isDeregistered","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_nextMinimumPodSize","type":"uint256"}],"name":"updateMinimumPodSize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"deregister","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"getDarknodePublicKey","outputs":[{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ren","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"epoch","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"store","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumBond","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"slasher","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_slasher","type":"address"}],"name":"updateSlasher","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"getDarknodeBond","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferStoreOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isRegistered","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumPodSize","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isDeregisterable","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_start","type":"address"},{"name":"_count","type":"uint256"}],"name":"getDarknodes","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"VERSION","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_darknodeID","type":"address"}],"name":"isRefunded","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_VERSION","type":"string"},{"name":"_renAddress","type":"address"},{"name":"_storeAddress","type":"address"},{"name":"_minimumBond","type":"uint256"},{"name":"_minimumPodSize","type":"uint256"},{"name":"_minimumEpochInterval","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_darknodeID","type":"address"},{"indexed":false,"name":"_bond","type":"uint256"}],"name":"LogDarknodeRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_darknodeID","type":"address"}],"name":"LogDarknodeDeregistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"LogDarknodeOwnerRefunded","type":"event"},{"anonymous":false,"inputs":[],"name":"LogNewEpoch","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousMinimumBond","type":"uint256"},{"indexed":false,"name":"nextMinimumBond","type":"uint256"}],"name":"LogMinimumBondUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousMinimumPodSize","type":"uint256"},{"indexed":false,"name":"nextMinimumPodSize","type":"uint256"}],"name":"LogMinimumPodSizeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousMinimumEpochInterval","type":"uint256"},{"indexed":false,"name":"nextMinimumEpochInterval","type":"uint256"}],"name":"LogMinimumEpochIntervalUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousSlasher","type":"address"},{"indexed":false,"name":"nextSlasher","type":"address"}],"name":"LogSlasherUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

/***/ }),

/***/ "./src/contracts/ABIs/ERC20.json":
/*!***************************************!*\
  !*** ./src/contracts/ABIs/ERC20.json ***!
  \***************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, default */
/***/ (function(module) {

module.exports = [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}];

/***/ }),

/***/ "./src/contracts/ABIs/Orderbook.json":
/*!*******************************************!*\
  !*** ./src/contracts/ABIs/Orderbook.json ***!
  \*******************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, default */
/***/ (function(module) {

module.exports = [{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"orderConfirmer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_orderID","type":"bytes32"},{"name":"_matchedOrderID","type":"bytes32"}],"name":"confirmOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ordersCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"cancelOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"orderBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ren","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_offset","type":"uint256"},{"name":"_limit","type":"uint256"}],"name":"getOrders","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"address[]"},{"name":"","type":"uint8[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"orders","outputs":[{"name":"state","type":"uint8"},{"name":"trader","type":"address"},{"name":"confirmer","type":"address"},{"name":"settlementID","type":"uint64"},{"name":"priority","type":"uint256"},{"name":"blockNumber","type":"uint256"},{"name":"matchedOrder","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"darknodeRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"orderDepth","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_settlementID","type":"uint64"},{"name":"_signature","type":"bytes"},{"name":"_orderID","type":"bytes32"}],"name":"openOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"orderState","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newDarknodeRegistry","type":"address"}],"name":"updateDarknodeRegistry","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"orderMatch","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"orderTrader","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"orderPriority","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"settlementRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"VERSION","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_VERSION","type":"string"},{"name":"_renAddress","type":"address"},{"name":"_darknodeRegistry","type":"address"},{"name":"_settlementRegistry","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousFee","type":"uint256"},{"indexed":false,"name":"nextFee","type":"uint256"}],"name":"LogFeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousDarknodeRegistry","type":"address"},{"indexed":false,"name":"nextDarknodeRegistry","type":"address"}],"name":"LogDarknodeRegistryUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

/***/ }),

/***/ "./src/contracts/ABIs/RenExBalances.json":
/*!***********************************************!*\
  !*** ./src/contracts/ABIs/RenExBalances.json ***!
  \***********************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, default */
/***/ (function(module) {

module.exports = [{"constant":true,"inputs":[],"name":"brokerVerifierContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newSettlementContract","type":"address"}],"name":"updateRenExSettlementContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"rewardVaultContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_value","type":"uint256"},{"name":"_signature","type":"bytes"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_traderFrom","type":"address"},{"name":"_traderTo","type":"address"},{"name":"_token","type":"address"},{"name":"_value","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_feePayee","type":"address"}],"name":"transferBalanceWithFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_value","type":"uint256"}],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_newBrokerVerifierContract","type":"address"}],"name":"updateBrokerVerifierContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"}],"name":"signalBackupWithdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"traderBalances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"SIGNAL_DELAY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newRewardVaultContract","type":"address"}],"name":"updateRewardVaultContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"settlementContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ETHEREUM","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"traderWithdrawalSignals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"VERSION","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_VERSION","type":"string"},{"name":"_rewardVaultContract","type":"address"},{"name":"_brokerVerifierContract","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"trader","type":"address"},{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogBalanceDecreased","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"trader","type":"address"},{"indexed":false,"name":"token","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogBalanceIncreased","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousRenExSettlementContract","type":"address"},{"indexed":false,"name":"newRenExSettlementContract","type":"address"}],"name":"LogRenExSettlementContractUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousRewardVaultContract","type":"address"},{"indexed":false,"name":"newRewardVaultContract","type":"address"}],"name":"LogRewardVaultContractUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousBrokerVerifierContract","type":"address"},{"indexed":false,"name":"newBrokerVerifierContract","type":"address"}],"name":"LogBrokerVerifierContractUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

/***/ }),

/***/ "./src/contracts/ABIs/RenExSettlement.json":
/*!*************************************************!*\
  !*** ./src/contracts/ABIs/RenExSettlement.json ***!
  \*************************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, default */
/***/ (function(module) {

module.exports = [{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"orderStatus","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newRenExTokensContract","type":"address"}],"name":"updateRenExTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"renExTokensContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"submissionGasPriceLimit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_orderID","type":"bytes32"}],"name":"getMatchDetails","outputs":[{"name":"settled","type":"bool"},{"name":"orderIsBuy","type":"bool"},{"name":"matchedID","type":"bytes32"},{"name":"priorityVolume","type":"uint256"},{"name":"secondaryVolume","type":"uint256"},{"name":"priorityFee","type":"uint256"},{"name":"secondaryFee","type":"uint256"},{"name":"priorityToken","type":"uint32"},{"name":"secondaryToken","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOrderbookContract","type":"address"}],"name":"updateOrderbook","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newSubmissionGasPriceLimit","type":"uint256"}],"name":"updateSubmissionGasPriceLimit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"DARKNODE_FEES_DENOMINATOR","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"orderSubmitter","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"RENEX_ATOMIC_SETTLEMENT_ID","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"orderDetails","outputs":[{"name":"settlementID","type":"uint64"},{"name":"tokens","type":"uint64"},{"name":"price","type":"uint256"},{"name":"volume","type":"uint256"},{"name":"minimumVolume","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes32"}],"name":"matchTimestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DARKNODE_FEES_NUMERATOR","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newSlasherAddress","type":"address"}],"name":"updateSlasher","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_prefix","type":"bytes"},{"name":"_settlementID","type":"uint64"},{"name":"_tokens","type":"uint64"},{"name":"_price","type":"uint256"},{"name":"_volume","type":"uint256"},{"name":"_minimumVolume","type":"uint256"}],"name":"submitOrder","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"orderbookContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_prefix","type":"bytes"},{"name":"_settlementID","type":"uint64"},{"name":"_tokens","type":"uint64"},{"name":"_price","type":"uint256"},{"name":"_volume","type":"uint256"},{"name":"_minimumVolume","type":"uint256"}],"name":"hashOrder","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"RENEX_SETTLEMENT_ID","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_buyID","type":"bytes32"},{"name":"_sellID","type":"bytes32"}],"name":"settle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"slasherAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"renExBalancesContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newRenExBalancesContract","type":"address"}],"name":"updateRenExBalances","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_guiltyOrderID","type":"bytes32"}],"name":"slash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"VERSION","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_VERSION","type":"string"},{"name":"_orderbookContract","type":"address"},{"name":"_renExTokensContract","type":"address"},{"name":"_renExBalancesContract","type":"address"},{"name":"_slasherAddress","type":"address"},{"name":"_submissionGasPriceLimit","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousOrderbook","type":"address"},{"indexed":false,"name":"nextOrderbook","type":"address"}],"name":"LogOrderbookUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousRenExTokens","type":"address"},{"indexed":false,"name":"nextRenExTokens","type":"address"}],"name":"LogRenExTokensUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousRenExBalances","type":"address"},{"indexed":false,"name":"nextRenExBalances","type":"address"}],"name":"LogRenExBalancesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousSubmissionGasPriceLimit","type":"uint256"},{"indexed":false,"name":"nextSubmissionGasPriceLimit","type":"uint256"}],"name":"LogSubmissionGasPriceLimitUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"previousSlasher","type":"address"},{"indexed":false,"name":"nextSlasher","type":"address"}],"name":"LogSlasherUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

/***/ }),

/***/ "./src/contracts/ABIs/RenExTokens.json":
/*!*********************************************!*\
  !*** ./src/contracts/ABIs/RenExTokens.json ***!
  \*********************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, default */
/***/ (function(module) {

module.exports = [{"constant":false,"inputs":[{"name":"_tokenCode","type":"uint32"}],"name":"deregisterToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenCode","type":"uint32"},{"name":"_tokenAddress","type":"address"},{"name":"_tokenDecimals","type":"uint8"}],"name":"registerToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint32"}],"name":"tokens","outputs":[{"name":"addr","type":"address"},{"name":"decimals","type":"uint8"},{"name":"registered","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"VERSION","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_VERSION","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenCode","type":"uint32"},{"indexed":false,"name":"tokenAddress","type":"address"},{"indexed":false,"name":"tokenDecimals","type":"uint8"}],"name":"LogTokenRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"tokenCode","type":"uint32"}],"name":"LogTokenDeregistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];

/***/ }),

/***/ "./src/contracts/ABIs/Wyre.json":
/*!**************************************!*\
  !*** ./src/contracts/ABIs/Wyre.json ***!
  \**************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, default */
/***/ (function(module) {

module.exports = [{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_approved","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"takeOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"approvedFor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"tokensOf","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

/***/ }),

/***/ "./src/contracts/contracts.ts":
/*!************************************!*\
  !*** ./src/contracts/contracts.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const contract = __webpack_require__(/*! ./truffle-contract/index.js */ "./src/contracts/truffle-contract/index.js"); // ABIs


const DarknodeRegistry_json_1 = __importDefault(__webpack_require__(/*! ./ABIs/DarknodeRegistry.json */ "./src/contracts/ABIs/DarknodeRegistry.json"));

const ERC20_json_1 = __importDefault(__webpack_require__(/*! ./ABIs/ERC20.json */ "./src/contracts/ABIs/ERC20.json"));

const Orderbook_json_1 = __importDefault(__webpack_require__(/*! ./ABIs/Orderbook.json */ "./src/contracts/ABIs/Orderbook.json"));

const RenExBalances_json_1 = __importDefault(__webpack_require__(/*! ./ABIs/RenExBalances.json */ "./src/contracts/ABIs/RenExBalances.json"));

const RenExSettlement_json_1 = __importDefault(__webpack_require__(/*! ./ABIs/RenExSettlement.json */ "./src/contracts/ABIs/RenExSettlement.json"));

const RenExTokens_json_1 = __importDefault(__webpack_require__(/*! ./ABIs/RenExTokens.json */ "./src/contracts/ABIs/RenExTokens.json"));

const Wyre_json_1 = __importDefault(__webpack_require__(/*! ./ABIs/Wyre.json */ "./src/contracts/ABIs/Wyre.json"));

exports.ETH_CODE = 1;

exports.withProvider = (provider, artifact) => {
  artifact.setProvider(provider);
  return artifact;
};

exports.ERC20 = contract({
  abi: ERC20_json_1.default
});
exports.DarknodeRegistry = contract({
  abi: DarknodeRegistry_json_1.default
});
exports.Orderbook = contract({
  abi: Orderbook_json_1.default
});
exports.RenExSettlement = contract({
  abi: RenExSettlement_json_1.default
});
exports.RenExBalances = contract({
  abi: RenExBalances_json_1.default
});
exports.RenExTokens = contract({
  abi: RenExTokens_json_1.default
});
exports.Wyre = contract({
  abi: Wyre_json_1.default
});

/***/ }),

/***/ "./src/contracts/truffle-contract/index.js":
/*!*************************************************!*\
  !*** ./src/contracts/truffle-contract/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Schema = __webpack_require__(/*! truffle-contract-schema */ "truffle-contract-schema");
var Contract = __webpack_require__(/*! ./lib/contract.js */ "./src/contracts/truffle-contract/lib/contract.js");

var contract = function(options) {
  var binary = Schema.normalize(options || {});

  // Note we don't use `new` here at all. This will cause the class to
  // "mutate" instead of instantiate an instance.
  return Contract.clone(binary);
};

module.exports = contract;

if (typeof window !== "undefined") {
  window.TruffleContract = contract;
}


/***/ }),

/***/ "./src/contracts/truffle-contract/lib/contract.js":
/*!********************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/contract.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var BlockchainUtils = __webpack_require__(/*! truffle-blockchain-utils */ "truffle-blockchain-utils");
var Web3 = __webpack_require__(/*! web3 */ "web3");
var Web3PromiEvent = __webpack_require__(/*! web3-core-promievent */ "web3-core-promievent");
var webUtils = __webpack_require__(/*! web3-utils */ "web3-utils");
var StatusError = __webpack_require__(/*! ./statuserror */ "./src/contracts/truffle-contract/lib/statuserror.js");
var utils = __webpack_require__(/*! ./utils */ "./src/contracts/truffle-contract/lib/utils.js");
var execute = __webpack_require__(/*! ./execute */ "./src/contracts/truffle-contract/lib/execute.js");
var handle = __webpack_require__(/*! ./handlers */ "./src/contracts/truffle-contract/lib/handlers.js");

// For browserified version. If browserify gave us an empty version,
// look for the one provided by the user.
if (typeof Web3 == "object" && Object.keys(Web3).length == 0) {
  Web3 = global.Web3;
}

var contract = (function(module) {
  // Accepts a contract object created with web3.eth.Contract or an address.
  function Contract(contract) {
    var instance = this;
    var constructor = instance.constructor;

    // Disambiguate between .at() and .new()
    if (typeof contract == "string") {
      var web3Instance = new constructor.web3.eth.Contract(constructor.abi);
      web3Instance.options.address = contract;
      contract = web3Instance;
    }

    // Core:
    instance.methods = {};
    instance.abi = constructor.abi;
    instance.address = contract.options.address;
    instance.transactionHash = contract.transactionHash;
    instance.contract = contract;

    // User defined methods, overloaded methods, events
    instance.abi.forEach(function(item){

      switch(item.type) {
        case "function":
          var isConstant =
            ["pure", "view"].includes(item.stateMutability) ||  // new form
            item.constant;  // deprecated case

          var signature = webUtils._jsonInterfaceMethodToString(item);

          var method = function(constant, web3Method){
            var fn;

            (constant)
              ? fn = execute.call.call(constructor, web3Method, item, instance.address)
              : fn = execute.send.call(constructor, web3Method, instance.address);

            fn.call = execute.call.call(constructor, web3Method, item, instance.address);
            fn.sendTransaction = execute.send.call(constructor, web3Method, instance.address);
            fn.estimateGas = execute.estimate.call(constructor, web3Method, instance.address);
            fn.request = execute.request.call(constructor, web3Method, instance.address);

            return fn;
          }

          // Only define methods once. Any overloaded methods will have all their
          // accessors available by ABI signature available on the `methods` key below.
          if(instance[item.name] === undefined ){
            instance[item.name] = method(isConstant, contract.methods[item.name]);
          }

          // Overloaded methods should be invoked via the .methods property
          instance.methods[signature] = method(isConstant, contract.methods[signature]);
          break;

        case "event":
          instance[item.name] = execute.event.call(constructor, contract.events[item.name]);
          break;
      }
    })

    // sendTransaction / send
    instance.sendTransaction = execute.send.call(constructor, null, instance.address);

    // Prefer user defined `send`
    if (!instance.send){
      instance.send = (value, txParams={}) => {
        const packet = Object.assign({value: value}, txParams);
        return instance.sendTransaction(packet)
      };
    }

    // Other events
    instance.allEvents = execute.allEvents.call(constructor, contract);
    instance.getPastEvents = execute.getPastEvents.call(constructor, contract);
  };

  Contract._constructorMethods = {
    setProvider: function(provider) {
      if (!provider) {
        throw new Error("Invalid provider passed to setProvider(); provider is " + provider);
      }

      this.web3.setProvider(provider);
      this.currentProvider = provider;
    },

    new: function() {
      var constructor = this;
      var promiEvent = new Web3PromiEvent();

      if (!constructor.currentProvider) {
        var err = constructor.contractName + " error: Please call setProvider() first before calling new()."
        throw new Error(err);
      }

      if (!constructor.bytecode) {
        var err = constructor.contractName + " error: contract binary not set. Can't deploy new instance.";
        throw new Error(err);
      }

      var args = Array.prototype.slice.call(arguments);

      // Promievent and flag that allows instance to resolve (rather than just receipt)
      var context = {
        contract: constructor,
        promiEvent: promiEvent,
        onlyEmitReceipt: true
      }

      constructor.detectNetwork().then(network => {
        utils.checkLibraries.apply(constructor);
        return execute.deploy.call(constructor, args, context, network.blockLimit);
      }).catch(promiEvent.reject)

      return promiEvent.eventEmitter;
    },

    at: function(address) {
      var constructor = this;

      return new Promise(function(accept, reject){
        if (address == null || typeof address != "string" || address.length != 42) {
          var err = "Invalid address passed to " + constructor.contractName + ".at(): " + address;
          reject(new Error(err));
        }

        return constructor.detectNetwork().then(function(network_id) {
          var instance = new constructor(address);

          return constructor.web3.eth.getCode(address).then(function(code){

            if (!code || code.replace("0x", "").replace(/0/g, "") === '') {
              var err = "Cannot create instance of " + constructor.contractName +
                        "; no code at address " + address;
              reject(new Error(err));
            }

            accept(instance);
          });
        });
      })
    },

    deployed: function() {
      var constructor = this;
      return constructor.detectNetwork().then(function() {
        // We don't have a network config for the one we found
        if (constructor._json.networks[constructor.network_id] == null) {
          var error = constructor.contractName +
                      " has not been deployed to detected network" +
                      " (network/artifact mismatch)"
          throw new Error(error);
        }

        // If we found the network but it's not deployed
        if (!constructor.isDeployed()) {
          var error = constructor.contractName +
                      " has not been deployed to detected network (" +
                      constructor.network_id + ")";

          throw new Error(error);
        }

        return new constructor(constructor.address);
      });
    },

    defaults: function(class_defaults) {
      if (this.class_defaults == null) {
        this.class_defaults = {};
      }

      if (class_defaults == null) {
        class_defaults = {};
      }

      var constructor = this;
      Object.keys(class_defaults).forEach(function(key) {
        var value = class_defaults[key];
        constructor.class_defaults[key] = value;
      });

      return this.class_defaults;
    },

    hasNetwork: function(network_id) {
      return this._json.networks[network_id + ""] != null;
    },

    isDeployed: function() {
      if (this.network_id == null) {
        return false;
      }

      if (this._json.networks[this.network_id] == null) {
        return false;
      }

      return !!this.network.address;
    },

    detectNetwork: function() {
      var constructor = this;

      return new Promise(function(accept, reject) {
        // Try to get the current blockLimit
        constructor.web3.eth.getBlock('latest').then(function(block){
          // Fallback to 7 million gas
          const blockLimit = block && block.gasLimit ? block.gasLimit : 7000000;

          // Try to detect the network we have artifacts for.
          if (constructor.network_id) {
            // We have a network id and a configuration, let's go with it.
            if (constructor.networks[constructor.network_id] != null) {
              return accept({id: constructor.network_id, blockLimit});
            }
          }

          constructor.web3.eth.net.getId().then(function(network_id){
            // If we found the network via a number, let's use that.
            if (constructor.hasNetwork(network_id)) {

              constructor.setNetwork(network_id);
              return accept({id: constructor.network_id, blockLimit});
            }

            // Otherwise, go through all the networks that are listed as
            // blockchain uris and see if they match.
            var uris = Object.keys(constructor._json.networks).filter(function(network) {
              return network.indexOf("blockchain://") == 0;
            });

            var matches = uris.map(function(uri) {
              return BlockchainUtils.matches.bind(BlockchainUtils, uri, constructor.web3.currentProvider);
            });

            utils.parallel(matches, function(err, results) {
              if (err) return reject(err);

              for (var i = 0; i < results.length; i++) {
                if (results[i]) {
                  constructor.setNetwork(uris[i]);
                  return accept({id: constructor.network_id, blockLimit});
                }
              }

              // We found nothing. Set the network id to whatever the provider states.
              constructor.setNetwork(network_id);
              return accept({id: constructor.network_id, blockLimit});
            });

          }).catch(reject);
        }).catch(reject);
      });
    },

    setNetwork: function(network_id) {
      if (!network_id) return;
      this.network_id = network_id + "";
    },

    setWallet: function(wallet) {
      this.web3.eth.accounts.wallet = wallet;
    },

    // Overrides the deployed address to null.
    // You must call this explicitly so you don't inadvertently do this otherwise.
    resetAddress: function() {
      delete this.network.address;
    },

    link: function(name, address) {
      var constructor = this;

      // Case: Contract.link(instance)
      if (typeof name == "function") {
        var contract = name;

        if (contract.isDeployed() == false) {
          throw new Error("Cannot link contract without an address.");
        }

        this.link(contract.contractName, contract.address);

        // Merge events so this contract knows about library's events
        Object.keys(contract.events).forEach(function(topic) {
          constructor.network.events[topic] = contract.events[topic];
        });

        return;
      }

      // Case: Contract.link({<libraryName>: <address>, ... })
      if (typeof name == "object") {
        var obj = name;
        Object.keys(obj).forEach(function(name) {
          var a = obj[name];
          constructor.link(name, a);
        });
        return;
      }

      // Case: Contract.link(<libraryName>, <address>)
      if (this._json.networks[this.network_id] == null) {
        this._json.networks[this.network_id] = {
          events: {},
          links: {}
        };
      }

      this.network.links[name] = address;
    },

    // Note, this function can be called with two input types:
    // 1. Object with a bunch of data; this data will be merged with the json data of contract being cloned.
    // 2. network id; this will clone the contract and set a specific network id upon cloning.
    clone: function(json) {
      var constructor = this;

      json = json || {};

      var temp = function TruffleContract() {
        this.constructor = temp;
        return Contract.apply(this, arguments);
      };

      temp.prototype = Object.create(constructor.prototype);

      var network_id;

      // If we have a network id passed
      if (typeof json != "object") {
        network_id = json;
        json = constructor._json;
      }

      json = utils.merge({}, constructor._json || {}, json);

      temp._constructorMethods = this._constructorMethods;
      temp._properties = this._properties;

      temp._property_values = {};
      temp._json = json;

      bootstrap(temp);

      temp.web3 = new Web3();
      temp.class_defaults = temp.prototype.defaults || {};

      if (network_id) {
        temp.setNetwork(network_id);
      }

      // Copy over custom key/values to the contract class
      Object.keys(json).forEach(function(key) {
        if (key.indexOf("x-") != 0) return;
        temp[key] = json[key];
      });

      return temp;
    },

    addProp: function(key, fn) {
      var constructor = this;

      var getter = function() {
        if (fn.get != null) {
          return fn.get.call(constructor);
        }

        return constructor._property_values[key] || fn.call(constructor);
      }
      var setter = function(val) {
        if (fn.set != null) {
          fn.set.call(constructor, val);
          return;
        }

        // If there's not a setter, then the property is immutable.
        throw new Error(key + " property is immutable");
      };

      var definition = {};
      definition.enumerable = false;
      definition.configurable = false;
      definition.get = getter;
      definition.set = setter;

      Object.defineProperty(this, key, definition);
    },

    toJSON: function() {
      return this._json;
    },
  };


  // Getter functions are scoped to Contract object.
  Contract._properties = {
    contract_name: {
      get: function() {
        return this.contractName;
      },
      set: function(val) {
        this.contractName = val;
      }
    },
    contractName: {
      get: function() {
        return this._json.contractName || "Contract";
      },
      set: function(val) {
        this._json.contractName = val;
      }
    },

    gasMultiplier: {
      get: function() {
        if (this._json.gasMultiplier === undefined){
          this._json.gasMultiplier = 1.25;
        }
        return this._json.gasMultiplier;
      },
      set: function(val) {
        this._json.gasMultiplier = val;
      }
    },
    timeoutBlocks: {
      get: function() {
        return this._json.timeoutBlocks;
      },
      set: function(val) {
        this._json.timeoutBlocks = val;
      }
    },
    autoGas: {
      get: function() {
        if (this._json.autoGas === undefined){
          this._json.autoGas = true;
        }
        return this._json.autoGas;
      },
      set: function(val) {
        this._json.autoGas = val;
      }
    },
    numberFormat: {
      get: function() {
        if (this._json.numberFormat === undefined){
          this._json.numberFormat = 'BN';
        }
        return this._json.numberFormat;
      },
      set: function(val) {
        const allowedFormats = [
          'BigNumber',
          'BN',
          'String'
        ];

        const msg = `Invalid number format setting: "${val}": ` +
                    `valid formats are: ${JSON.stringify(allowedFormats)}.`;

        if (!allowedFormats.includes(val)) throw new Error(msg);

        this._json.numberFormat = val;
      }
    },
    abi: {
      get: function() {
        return this._json.abi;
      },
      set: function(val) {
        this._json.abi = val;
      }
    },
    network: function() {
      var network_id = this.network_id;

      if (network_id == null) {
        var error = this.contractName + " has no network id set, cannot lookup artifact data." +
                    " Either set the network manually using " + this.contractName +
                    ".setNetwork(), run " + this.contractName + ".detectNetwork(), or use new()," +
                    " at() or deployed() as a thenable which will detect the network automatically.";

        throw new Error(error);
      }

      // TODO: this might be bad; setting a value on a get.
      if (this._json.networks[network_id] == null) {
        var error = this.contractName + " has no network configuration" +
                    " for its current network id (" + network_id + ").";

        throw new Error(error);
      }

      var returnVal = this._json.networks[network_id];

      // Normalize output
      if (returnVal.links == null) {
        returnVal.links = {};
      }

      if (returnVal.events == null) {
        returnVal.events = {};
      }

      return returnVal;
    },
    networks: function() {
      return this._json.networks;
    },
    address: {
      get: function() {
        var address = this.network.address;

        if (address == null) {
          var error = "Cannot find deployed address: " +
                      this.contractName + " not deployed or address not set."
          throw new Error(error);
        }

        return address;
      },
      set: function(val) {
        if (val == null) {
          throw new Error("Cannot set deployed address; malformed value: " + val);
        }

        var network_id = this.network_id;

        if (network_id == null) {
          var error = this.contractName + " has no network id set, cannot lookup artifact data." +
                      " Either set the network manually using " + this.contractName +
                      ".setNetwork(), run " + this.contractName + ".detectNetwork()," +
                      " or use new(), at() or deployed() as a thenable which will" +
                      " detect the network automatically.";

          throw new Error(error)
        }

        // Create a network if we don't have one.
        if (this._json.networks[network_id] == null) {
          this._json.networks[network_id] = {
            events: {},
            links: {}
          };
        }

        // Finally, set the address.
        this.network.address = val;
      }
    },
    transactionHash: {
      get: function() {
        return this.network.transactionHash;
      },
      set: function(val) {
        this.network.transactionHash = val;
      }
    },
    links: function() {
      if (!this.network_id) {
        var error = this.contractName + " has no network id set, cannot lookup artifact data." +
                    " Either set the network manually using " + this.contractName + ".setNetwork()," +
                    " run " + this.contractName + ".detectNetwork(), or use new(), at()" +
                    " or deployed() as a thenable which will detect the network automatically.";

        throw new Error(error)
      }

      if (this._json.networks[this.network_id] == null) {
        return {};
      }

      return this.network.links || {};
    },
    events: function() {
      // helper web3; not used for provider
      var web3 = new Web3();

      var events;

      if (this._json.networks[this.network_id] == null) {
        events = {};
      } else {
        events = this.network.events || {};
      }

      // Merge abi events with whatever's returned.
      var abi = this.abi;

      abi.forEach(function(item) {
        if (item.type != "event") return;

        var signature = item.name + "(";

        item.inputs.forEach(function(input, index) {
          signature += input.type;

          if (index < item.inputs.length - 1) {
            signature += ",";
          }
        });

        signature += ")";

        var topic = web3.utils.keccak256(signature);

        events[topic] = item;
      });

      return events;
    },
    binary: function() {
      return utils.linkBytecode(this.bytecode, this.links);
    },
    deployedBinary: function() {
      return utils.linkBytecode(this.deployedBytecode, this.links);
    },

    // deprecated; use bytecode
    unlinked_binary: {
      get: function() {
        return this.bytecode;
      },
      set: function(val) {
        this.bytecode = val;
      }
    },
    // alias for unlinked_binary; unlinked_binary will eventually be deprecated
    bytecode: {
      get: function() {
        return this._json.bytecode;
      },
      set: function(val) {
        this._json.bytecode = val;
      }
    },
    deployedBytecode: {
      get: function() {
        var code = this._json.deployedBytecode;

        if (code.indexOf("0x") != 0) {
          code = "0x" + code;
        }

        return code;
      },
      set: function(val) {
        var code = val;

        if (val.indexOf("0x") != 0) {
          code = "0x" + code;
        }

        this._json.deployedBytecode = code;
      }
    },
    sourceMap: {
      get: function() {
        return this._json.sourceMap;
      },
      set: function(val) {
        this._json.sourceMap = val;
      }
    },
    deployedSourceMap: {
      get: function() {
        return this._json.deployedSourceMap;
      },
      set: function(val) {
        this._json.deployedSourceMap = val;
      }
    },
    source: {
      get: function() {
        return this._json.source;
      },
      set: function(val) {
        this._json.source = val;
      }
    },
    sourcePath: {
      get: function() {
        return this._json.sourcePath;
      },
      set: function(val) {
        this._json.sourcePath = val;
      }
    },
    legacyAST: {
      get: function() {
        return this._json.legacyAST;
      },
      set: function(val) {
        this._json.legacyAST = val;
      }
    },
    ast: {
      get: function() {
        return this._json.ast;
      },
      set: function(val) {
        this._json.ast = val;
      }
    },
    compiler: {
      get: function() {
        return this._json.compiler;
      },
      set: function(val) {
        this._json.compiler = val;
      }
    },
    // Deprecated
    schema_version: function() {
      return this.schemaVersion;
    },
    schemaVersion: function() {
      return this._json.schemaVersion;
    },
    // deprecated
    updated_at: function() {
      return this.updatedAt;
    },
    updatedAt: function() {
      try {
        return this.network.updatedAt || this._json.updatedAt;
      } catch (e) {
        return this._json.updatedAt;
      }
    }
  };

  function bootstrap(fn) {
    // Add our static methods
    // Add something here about excluding send, privately defined methods
    Object.keys(fn._constructorMethods).forEach(function(key) {
      fn[key] = fn._constructorMethods[key].bind(fn);
    });

    // Add our properties.
    Object.keys(fn._properties).forEach(function(key) {
      fn.addProp(key, fn._properties[key]);
    });

    // estimateGas as sub-property of new
    fn['new'].estimateGas = execute.estimateDeployment.bind(fn);

    return fn;
  };

  bootstrap(Contract);
  module.exports = Contract;

  return Contract;
})(module || {});

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./src/contracts/truffle-contract/lib/execute.js":
/*!*******************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/execute.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Web3PromiEvent = __webpack_require__(/*! web3-core-promievent */ "web3-core-promievent");
var EventEmitter = __webpack_require__(/*! events */ "events");
var utils = __webpack_require__(/*! ./utils */ "./src/contracts/truffle-contract/lib/utils.js");
var StatusError = __webpack_require__(/*! ./statuserror */ "./src/contracts/truffle-contract/lib/statuserror.js");
var Reason = __webpack_require__(/*! ./reason */ "./src/contracts/truffle-contract/lib/reason.js");
var handlers = __webpack_require__(/*! ./handlers */ "./src/contracts/truffle-contract/lib/handlers.js");
var override = __webpack_require__(/*! ./override */ "./src/contracts/truffle-contract/lib/override.js");
var reformat = __webpack_require__(/*! ./reformat */ "./src/contracts/truffle-contract/lib/reformat.js");

var util = __webpack_require__(/*! util */ "util");
var execute = {

  // -----------------------------------  Helpers --------------------------------------------------
  /**
   * Retrieves gas estimate multiplied by the set gas multiplier for a `sendTransaction` call.
   * @param  {Object} params     `sendTransaction` parameters
   * @param  {Number} blockLimit  most recent network block.blockLimit
   * @return {Number}             gas estimate
   */
  getGasEstimate: function (params, blockLimit) {
    var constructor = this;
    var web3 = this.web3;

    return new Promise(function (accept, reject) {
      // Always prefer specified gas - this includes gas set by class_defaults
      if (params.gas) return accept(params.gas);
      if (!constructor.autoGas) return accept();

      web3.eth
        .estimateGas(params)
        .then(gas => {
          var bestEstimate = Math.floor(constructor.gasMultiplier * gas);

          // Don't go over blockLimit
          (bestEstimate >= blockLimit) ?
          accept(blockLimit - 1): accept(bestEstimate);

          // We need to let txs that revert through.
          // Often that's exactly what you are testing.
        }).catch(err => accept());
    })
  },

  /**
   * Prepares simple wrapped calls by checking network and organizing the method inputs into
   * objects web3 can consume.
   * @param  {Object} constructor   TruffleContract constructor
   * @param  {Array}  _arguments    Arguments passed to method invocation
   * @return {Promise}              Resolves object w/ tx params disambiguated from arguments
   */
  prepareCall: function (constructor, _arguments) {
    var args = Array.prototype.slice.call(_arguments);
    var params = utils.getTxParams.call(constructor, args);

    return constructor
      .detectNetwork()
      .then(() => {
        return {
          args: args,
          params: params
        }
      });
  },

  /**
   * Disambiguates between transaction parameter objects and BN / BigNumber objects
   * @param  {Any}  arg
   * @return {Boolean}
   */
  hasTxParams: function (arg) {
    return utils.is_object(arg) && !utils.is_big_number(arg);
  },

  /**
   * Parses function arguments to discover if the terminal argument specifies the `defaultBlock`
   * to execute a call at.
   * @param  {Array}  args      `arguments` that were passed to method
   * @param  {Any}    lastArg    terminal argument passed to method
   * @param  {Array}  inputs     ABI segment defining method arguments
   * @return {Boolean}           true if final argument is `defaultBlock`
   */
  hasDefaultBlock: function (args, lastArg, inputs) {
    var hasDefaultBlock = !execute.hasTxParams(lastArg) && (args.length > inputs.length);
    var hasDefaultBlockWithParams = execute.hasTxParams(lastArg) && (args.length - 1 > inputs.length);
    return hasDefaultBlock || hasDefaultBlockWithParams;
  },

  // -----------------------------------  Methods --------------------------------------------------

  /**
   * Executes method as .call and processes optional `defaultBlock` argument.
   * @param  {Function} fn         method
   * @param  {Object}   methodABI  function ABI segment w/ inputs & outputs keys.
   * @return {Promise}             Return value of the call.
   */
  call: function (fn, methodABI, address) {
    var constructor = this;

    return function () {
      var params = {};
      var defaultBlock = 'latest';
      var args = Array.prototype.slice.call(arguments);
      var lastArg = args[args.length - 1];

      // Extract defaultBlock parameter
      if (execute.hasDefaultBlock(args, lastArg, methodABI.inputs)) {
        defaultBlock = args.pop();
      }

      // Extract tx params
      if (execute.hasTxParams(lastArg)) {
        params = args.pop();
      }

      params.to = address;
      params = utils.merge(constructor.class_defaults, params);

      return new Promise(async (resolve, reject) => {
        let result;
        try {

          await constructor.detectNetwork();
          result = await fn(...args).call(params, defaultBlock);
          result = reformat.numbers.call(constructor, result, methodABI.outputs);
          resolve(result);

        } catch (err) {
          reject(err);
        }
      });
    };
  },


  /**
   * Executes method as .send
   * @param  {Function}   fn       Method to invoke
   * @param  {String}     address  Deployed address of the targeted instance
   * @return {PromiEvent}          Resolves a transaction receipt (via the receipt handler)
   */
  send: function (fn, address) {
    var constructor = this;
    var web3 = constructor.web3;

    return function () {
      var deferred;
      var args = Array.prototype.slice.call(arguments);
      var params = utils.getTxParams.call(constructor, args);
      var promiEvent = new Web3PromiEvent();

      var context = {
        contract: constructor, // Can't name this field `constructor` or `_constructor`
        promiEvent: promiEvent,
        params: params
      }

      constructor.detectNetwork().then(network => {
        params.to = address;
        params.data = fn ? fn(...args).encodeABI() : undefined;

        execute
          .getGasEstimate
          .call(constructor, params, network.blockLimit)
          .then(gas => {
            params.gas = gas
            deferred = web3.eth.sendTransaction(params);
            deferred.catch(override.start.bind(constructor, context));
            handlers.setup(deferred, context);
          })
          .catch(promiEvent.reject)
      }).catch(promiEvent.reject)

      return promiEvent.eventEmitter;
    };
  },

  /**
   * Deploys an instance. Network detection for `.new` happens before invocation at `contract.js`
   * where we check the libraries.
   * @param  {Object} args        Deployment options;
   * @param  {Object} context     Context object that exposes execution state to event handlers.
   * @param  {Number} blockLimit  `block.gasLimit`
   * @return {PromiEvent}         Resolves a TruffleContract instance
   */
  deploy: function (args, context, blockLimit) {
    var constructor = this;
    var abi = constructor.abi;
    var web3 = constructor.web3;
    var params = utils.getTxParams.call(constructor, args);
    var deferred;

    var options = {
      data: constructor.binary,
      arguments: args
    };

    var contract = new web3.eth.Contract(abi);
    params.data = contract.deploy(options).encodeABI();

    execute
      .getGasEstimate
      .call(constructor, params, blockLimit)
      .then(gas => {
        params.gas = gas;
        context.params = params;
        deferred = web3.eth.sendTransaction(params);
        handlers.setup(deferred, context);

        deferred.then(async (receipt) => {
          if (!receipt.status) {
            var reason = await Reason.get(params, web3);

            var error = new StatusError(
              params,
              context.transactionHash,
              receipt,
              reason
            );

            return context.promiEvent.reject(error)
          }

          var web3Instance = new web3.eth.Contract(abi, receipt.contractAddress);
          web3Instance.transactionHash = context.transactionHash;

          context.promiEvent.resolve(new constructor(web3Instance));

          // Manage web3's 50 blocks' timeout error.
          // Web3's own subscriptions go dead here.
        }).catch(override.start.bind(constructor, context))
      }).catch(context.promiEvent.reject);
  },

  /**
   * Begins listening for an event OR manages the event callback
   * @param  {Function} fn  Solidity event method
   * @return {Emitter}      Event emitter
   */
  event: function (fn) {
    var constructor = this;
    var decode = utils.decodeLogs;
    var currentLogID = null;

    // Someone upstream is firing duplicates :/
    function dedupe(id) {
      return (id === currentLogID) ?
        false :
        currentLogID = id;
    }

    return function (params, callback) {
      if (typeof params == "function") {
        callback = params;
        params = {};
      }

      // As callback
      if (callback !== undefined) {
        var intermediary = function (err, e) {
          if (err) callback(err);
          var event = dedupe(e.id) && decode.call(constructor, e, true)[0];
          callback(null, event);
        }

        return constructor.detectNetwork()
          .then(() => fn.call(constructor.events, params, intermediary));
      }

      // As EventEmitter
      var emitter = new EventEmitter();

      constructor.detectNetwork().then(() => {
        var event = fn(params);

        event.on('data', e => dedupe(e.id) && emitter.emit('data', decode.call(constructor, e, true)[0]));
        event.on('changed', e => dedupe(e.id) && emitter.emit('changed', decode.call(constructor, e, true)[0]));
        event.on('error', e => emitter.emit('error', e));
      });

      return emitter;
    };
  },

  /**
   * Wraps web3 `allEvents`, with additional log decoding
   * @return {PromiEvent}  EventEmitter
   */
  allEvents: function (web3Instance) {
    var constructor = this;
    var decode = utils.decodeLogs;
    var currentLogID = null;

    // Someone upstream is firing duplicates :/
    function dedupe(id) {
      return (id === currentLogID) ?
        false :
        currentLogID = id;
    }

    return function (params) {
      var emitter = new EventEmitter();

      constructor.detectNetwork().then(() => {
        var event = web3Instance.events.allEvents(params);

        event.on('data', e => dedupe(e.id) && emitter.emit('data', decode.call(constructor, e, true)[0]));
        event.on('changed', e => dedupe(e.id) && emitter.emit('changed', decode.call(constructor, e, true)[0]));
        event.on('error', e => emitter.emit('error', e));
      });

      return emitter;
    };
  },

  /**
   * Wraps web3 `getPastEvents`, with additional log decoding
   * @return {Promise}  Resolves array of event objects
   */
  getPastEvents: function (web3Instance) {
    var constructor = this;
    var decode = utils.decodeLogs;

    return function (event, options) {
      return web3Instance
        .getPastEvents(event, options)
        .then(events => decode.call(constructor, events, false))
    }
  },

  /**
   * Estimates gas cost of a method invocation
   * @param  {Function} fn  Method to target
   * @return {Promise}
   */
  estimate: function (fn) {
    var constructor = this;
    return function () {

      return execute
        .prepareCall(constructor, arguments)
        .then(res => fn(...res.args).estimateGas(res.params));
    };
  },

  request: function (fn) {
    var constructor = this;
    return function () {

      return execute
        .prepareCall(constructor, arguments)
        .then(res => fn(...res.args).request(res.params));
    };
  },

  // This gets attached to `.new` (declared as a static_method in `contract`)
  // during bootstrapping as `estimate`
  estimateDeployment: function () {
    var constructor = this;
    return execute
      .prepareCall(constructor, arguments)
      .then(res => {
        var options = {
          data: constructor.binary,
          arguments: res.args
        };

        delete res.params['data']; // Is this necessary?

        var instance = new constructor.web3.eth.Contract(constructor.abi, res.params);
        return instance.deploy(options).estimateGas(res.params);
      });
  },
};

module.exports = execute;

/***/ }),

/***/ "./src/contracts/truffle-contract/lib/handlers.js":
/*!********************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/handlers.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var StatusError = __webpack_require__(/*! ./statuserror */ "./src/contracts/truffle-contract/lib/statuserror.js");
var Utils = __webpack_require__(/*! ./utils */ "./src/contracts/truffle-contract/lib/utils.js");
var Reason = __webpack_require__(/*! ./reason */ "./src/contracts/truffle-contract/lib/reason.js");

/*
  Handlers for events emitted by `send` / `call` etc.
 */
var handlers = {

  // ----------------------------------- Constants -------------------------------------------------

  maxConfirmations: 24, // Maximum number of confirmation web3 emits
  defaultTimeoutBlocks: 50, // Maximum number of blocks web3 will wait before abandoning tx
  timeoutMessage: '50 blocks', // Substring of web3 timeout error.

  // -----------------------------------  Helpers --------------------------------------------------

  /**
   * Parses error message and determines if we should squash block timeout errors at user's request.
   * @param  {Object} context execution state
   * @param  {Object} error   error
   * @return {Boolean}
   */
  ignoreTimeoutError: function (context, error) {
    var timedOut = error.message && error.message.includes(handlers.timeoutMessage);

    var shouldWait = context.contract &&
      context.contract.timeoutBlocks &&
      context.contract.timeoutBlocks > handlers.defaultTimeoutBlocks;

    return timedOut && shouldWait;
  },

  /**
   * Attaches Truffle specific handlers to all of the events emitted by a web3 method.
   * @param {Object}       context  execution state
   * @param {PromiEvent}   emitter  promiEvent returned by a web3 method call
   */
  setup: function (emitter, context) {
    emitter.on('error', handlers.error.bind(emitter, context))
    emitter.on('transactionHash', handlers.hash.bind(emitter, context))
    emitter.on('confirmation', handlers.confirmation.bind(emitter, context))
    emitter.on('receipt', handlers.receipt.bind(emitter, context));
  },

  // -----------------------------------  Handlers -------------------------------------------------
  /**
   * Error event handler. Emits error unless error is block timeout and user has
   * specified we should wait longer
   * @param  {Object} context   execution state
   * @param  {Object} error     error
   */
  error: function (context, error) {
    if (!handlers.ignoreTimeoutError(context, error)) {
      context.promiEvent.eventEmitter.emit('error', error);
      this.removeListener('error', handlers.error);
    }
  },

  /**
   * Transaction hash event handler. Attaches the hash to the context object
   * so it can be attached to the contract instance after a deployment resolves.
   * @param  {Object} context   execution state
   * @param  {String} hash      transaction hash
   */
  hash: function (context, hash) {
    context.transactionHash = hash;
    context.promiEvent.eventEmitter.emit('transactionHash', hash);
    this.removeListener('transactionHash', handlers.hash);
  },

  confirmation: function (context, number, receipt) {
    context.promiEvent.eventEmitter.emit('confirmation', number, receipt)

    // Per web3: initial confirmation index is 0
    if (number === handlers.maxConfirmations + 1) {
      this.removeListener('confirmation', handlers.confirmation);
    }
  },

  /**
   * Receipt event handler. This handler decodes the event logs, re-emits the receipt,
   * and (for method calls only) resolves/rejects the promiEvent with the receipt.
   * @param  {Object} context   execution state
   * @param  {Object} receipt   transaction receipt
   */
  receipt: async function (context, receipt) {
    // Decode logs
    var logs;

    if (!receipt.transactionHash) {
      receipt.transactionHash = context.transactionHash;
      receipt.status = 1;
    }

    (receipt.logs) ?
    logs = Utils.decodeLogs.call(context.contract, receipt.logs): logs = [];

    // Emit receipt
    context.promiEvent.eventEmitter.emit('receipt', receipt)

    // .new(): Exit early. We need the promiEvent to resolve a contract instance.
    if (context.onlyEmitReceipt) {
      context.receipt = receipt;
      return;
    }

    // .method(): resolve/reject receipt in handler
    if (!receipt.status) {
      var reason = await Reason.get(context.params, context.contract.web3);

      var error = new StatusError(
        context.params,
        receipt.transactionHash,
        receipt,
        reason
      );

      return context.promiEvent.reject(error)
    }

    // This object has some duplicate data but is backward compatible.
    context.promiEvent.resolve({
      tx: receipt.transactionHash,
      receipt: receipt,
      logs: logs
    });

    this.removeListener('receipt', handlers.receipt);
  },
}

module.exports = handlers;

/***/ }),

/***/ "./src/contracts/truffle-contract/lib/override.js":
/*!********************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/override.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Reason = __webpack_require__(/*! ./reason */ "./src/contracts/truffle-contract/lib/reason.js");
var handlers = __webpack_require__(/*! ./handlers */ "./src/contracts/truffle-contract/lib/handlers.js");

var override = {

  timeoutMessage: 'not mined within', // Substring of timeout err fired by web3
  defaultMaxBlocks: 50, // Max # of blocks web3 will wait for a tx
  pollingInterval: 1000,

  /**
   * Attempts to extract receipt object from Web3 error message
   * @param  {Object} message       web3 error
   * @return {Object|undefined} receipt
   */
  extractReceipt(message) {
    const hasReceipt = message &&
      message.includes('{')
    message.includes('}');

    if (hasReceipt) {
      const receiptString = '{' + message.split('{')[1].trim();
      try {
        return JSON.parse(receiptString)
      } catch (err) {
        // ignore
      }
    }
  },

  /**
   * Fired after web3 ceases to support subscriptions if user has specified
   * a higher block wait time than web3's 50 blocks limit. Opens a subscription to listen
   * for new blocks and begins evaluating whether block height has reached the user
   * defined timeout threshhold. Resolves either a contract instance or a transaction receipt.
   *
   * @param  {Object} context execution state
   * @param  {Object} err     error
   */
  start: async function (context, web3Error) {
    var constructor = this;
    var blockNumber = null;
    var currentBlock = override.defaultMaxBlocks;
    var maxBlocks = constructor.timeoutBlocks;

    var timedOut = web3Error.message && web3Error.message.includes(override.timeoutMessage);
    var shouldWait = maxBlocks > currentBlock;

    // Reject after attempting to get reason string if we shouldn't be waiting.
    if (!timedOut || !shouldWait) {

      // We might have been routed here in web3 >= beta.34 by their own status check
      // error. We want to extract the receipt, emit a receipt event
      // and reject it ourselves.
      var receipt = override.extractReceipt(web3Error.message);
      if (receipt) {
        try {
          await handlers.receipt(context, receipt);
        } catch (err) {
          console.error(err);
        }
        return;
      }

      // This will run if there's a reason and no status field
      // e.g: revert with reason ganache-cli --vmErrorsOnRPCResponse=true
      var reason;
      try {
        reason = await Reason.get(context.params, constructor.web3);
      } catch (err) {
        console.error(err);
      }
      if (reason) {
        web3Error.reason = reason;
        web3Error.message += ` -- Reason given: ${reason}.`;
      }

      return context.promiEvent.reject(web3Error);
    }

    // This will run every block from now until contract.timeoutBlocks
    var listener = function (pollID) {
      var self = this;
      currentBlock++;

      if (currentBlock > constructor.timeoutBlocks) {
        clearInterval(pollID)
        return;
      }

      constructor.web3.eth.getTransactionReceipt(context.transactionHash)
        .then(result => {
          if (!result) return;

          (result.contractAddress) ?
          constructor
            .at(result.contractAddress)
            .then(context.promiEvent.resolve)
            .catch(context.promiEvent.reject)

            : constructor.promiEvent.resolve(result);

        })
        .catch(err => {
          clearInterval(pollID)
          context.promiEvent.reject(err);
        });
    };

    // Start polling
    let currentPollingBlock = await constructor.web3.eth.getBlockNumber();

    const pollID = setInterval(async () => {
      const newBlock = await constructor.web3.eth.getBlockNumber();

      if (newBlock > currentPollingBlock) {
        currentPollingBlock = newBlock;
        listener(pollID);
      }
    }, override.pollingInterval);
  },
}

module.exports = override;

/***/ }),

/***/ "./src/contracts/truffle-contract/lib/reason.js":
/*!******************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/reason.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Methods to fetch and decode reason string from ganache when a tx errors.
 */

const reason = {
  /**
   * Extracts a reason string from `eth_call` response
   * @param  {Object}           res  response from `eth_call` to extract reason
   * @param  {Web3}             web3 a helpful friend
   * @return {String|Undefined}      decoded reason string
   */
  _extract: function (res, web3) {
    if (!res || (!res.error && !res.result)) return;

    const errorStringHash = '0x08c379a0';

    const isObject = res && typeof res === 'object' && res.error && res.error.data;
    const isString = res && typeof res === 'object' && typeof res.result === 'string';

    if (isObject) {
      const data = res.error.data;
      const hash = Object.keys(data)[0];

      if (data[hash].return && data[hash].return.includes(errorStringHash)) {
        return web3.eth.abi.decodeParameter('string', data[hash].return.slice(10))
      }

    } else if (isString && res.result.includes(errorStringHash)) {
      return web3.eth.abi.decodeParameter('string', res.result.slice(10))
    }
  },

  /**
   * Runs tx via `eth_call` and resolves a reason string if it exists on the response.
   * @param  {Object} web3
   * @return {String|Undefined}
   */
  get: function (params, web3) {
    const packet = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [params],
      id: new Date().getTime(),
    }

    return new Promise(resolve => {
      web3.currentProvider.sendAsync(packet, (err, response) => {
        const reasonString = reason._extract(response, web3);
        resolve(reasonString);
      })
    })
  },
};

module.exports = reason;

/***/ }),

/***/ "./src/contracts/truffle-contract/lib/reformat.js":
/*!********************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/reformat.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Utilities for reformatting web3 outputs
 */
const BigNumber = __webpack_require__(/*! bignumber.js */ "bignumber.js");
const web3Utils = __webpack_require__(/*! web3-utils */ "web3-utils");

/**
 * Converts from string to other number format
 * @param  {String} val    number string returned by web3
 * @param  {String} format name of format to convert to
 * @return {Object|String} converted value
 */
const _convertNumber = function(val, format){
  const badFormatMsg = `Attempting to convert to unknown number format: ${format}`;

  switch(format){
    case 'BigNumber': return new BigNumber(val);
    case 'BN':        return web3Utils.toBN(val);
    case 'String':    return val;
    default:          throw new Error(badFormatMsg);
  }
}

/**
 * Converts arrays of number strings to other number formats
 * @param  {String[]} arr       number string array returned by web3
 * @param  {String}   format    name of format to convert to
 * @return {Object[]|String[]}  array of converted values
 */
const _convertNumberArray = function(arr, format){
  return arr.map((item => _convertNumber(item, format)));
}

/**
 * Reformats numbers in the result/result-object of a web3 call.
 * Possible forms of `result` are:
 *   - object (with index keys and optionally, named keys)
 *   - array
 *   - single primitive
 * @param  {String|Object|Array} result      web3 call result
 * @param  {Array}               abiSegment  event params OR .call outputs
 * @return {String|Object|Array} reformatted result
 */
const numbers = function(result, abiSegment){
  const format = this.numberFormat;

  abiSegment.forEach((output, i) => {

    // output is a number type (uint || int);
    if (output.type.includes('int')){

      // output is an array type
      if(output.type.includes('[')){

        // result is array
        if (Array.isArray(result)){
          result = _convertNumberArray(result, format);

        // result is object
        } else {
          // output has name
          if (output.name.length){
            result[output.name] = _convertNumberArray(result[output.name], format);
          }
          // output will always have an index key
          result[i] = _convertNumberArray(result[i], format);
        }
      //
      } else if (typeof result === 'object'){

        // output has name
          if (output.name.length){
            result[output.name] = _convertNumber(result[output.name], format);
          }

          // output will always have an index key
          result[i] = _convertNumber(result[i], format);

      } else {
        result = _convertNumber(result, format)
      }
    }
  });
  return result;
}

module.exports = {
  numbers: numbers
}



/***/ }),

/***/ "./src/contracts/truffle-contract/lib/statuserror.js":
/*!***********************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/statuserror.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var TruffleError = __webpack_require__(/*! truffle-error */ "truffle-error");
var inherits = __webpack_require__(/*! util */ "util").inherits;
var web3 = __webpack_require__(/*! web3 */ "web3");

inherits(StatusError, TruffleError);

var defaultGas = 90000;

function StatusError(args, tx, receipt, reason) {
  var message;
  var gasLimit = parseInt(args.gas) || defaultGas;
  var reasonString = '';

  if(reason) reasonString = `Reason given: ${reason}.`;

  if(receipt.gasUsed === gasLimit){

    message = "Transaction: " + tx + " exited with an error (status 0) after consuming all gas.\n" +
      "     Please check that the transaction:\n" +
      "     - satisfies all conditions set by Solidity `assert` statements.\n" +
      "     - has enough gas to execute the full transaction.\n" +
      "     - does not trigger an invalid opcode by other means (ex: accessing an array out of bounds).";

  } else {

    message = `Transaction: ${tx} exited with an error (status 0). ${reasonString}\n` +
      "     Please check that the transaction:\n" +
      "     - satisfies all conditions set by Solidity `require` statements.\n" +
      "     - does not trigger a Solidity `revert` statement.\n";
  }

  StatusError.super_.call(this, message);
  this.tx = tx;
  this.receipt = receipt;
  this.reason = reason;
}

module.exports = StatusError;

/***/ }),

/***/ "./src/contracts/truffle-contract/lib/utils.js":
/*!*****************************************************!*\
  !*** ./src/contracts/truffle-contract/lib/utils.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Web3 = __webpack_require__(/*! web3 */ "web3");
var abi = __webpack_require__(/*! web3-eth-abi */ "web3-eth-abi");
var reformat = __webpack_require__(/*! ./reformat */ "./src/contracts/truffle-contract/lib/reformat.js");

var web3 = new Web3();

var Utils = {
  is_object: function(val) {
    return typeof val == "object" && !Array.isArray(val);
  },
  is_big_number: function(val) {
    if (typeof val != "object") return false;

    return web3.utils.isBN(val) || web3.utils.isBigNumber(val);
  },

  decodeLogs: function(_logs, isSingle) {
    var constructor = this;
    var logs = Utils.toTruffleLog(_logs, isSingle);

    return logs.map(function(log) {
      var logABI = constructor.events[log.topics[0]];

      if (logABI == null) {
        return null;
      }

      var copy = Utils.merge({}, log);

      copy.event = logABI.name;
      copy.topics = logABI.anonymous ? copy.topics : copy.topics.slice(1);

      const logArgs = abi.decodeLog(logABI.inputs, copy.data, copy.topics);
      copy.args = reformat.numbers.call(constructor, logArgs, logABI.inputs);

      delete copy.data;
      delete copy.topics;

      return copy;
    }).filter(function(log) {
      return log != null;
    });
  },

  toTruffleLog: function(events, isSingle){
    // Transform singletons (from event listeners) to the kind of
    // object we find on the receipt
    if (isSingle && typeof isSingle === 'boolean'){
      var temp = [];
      temp.push(events)
      return temp.map(function(log){
        log.data = log.raw.data;
        log.topics = log.raw.topics;
        return log;
      })
    }

    // Or reformat items in the existing array
    events.forEach(event => {
      if (event.raw){
        event.data = event.raw.data;
        event.topics = event.raw.topics;
      }
    })

    return events;
  },

  merge: function() {
    var merged = {};
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < args.length; i++) {
      var object = args[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        merged[key] = value;
      }
    }

    return merged;
  },
  parallel: function (arr, callback) {
    callback = callback || function () {};
    if (!arr.length) {
      return callback(null, []);
    }
    var index = 0;
    var results = new Array(arr.length);
    arr.forEach(function (fn, position) {
      fn(function (err, result) {
        if (err) {
          callback(err);
          callback = function () {};
        } else {
          index++;
          results[position] = result;
          if (index >= arr.length) {
            callback(null, results);
          }
        }
      });
    });
  },

  linkBytecode: function(bytecode, links) {
    Object.keys(links).forEach(function(library_name) {
      var library_address = links[library_name];
      var regex = new RegExp("__" + library_name + "_+", "g");

      bytecode = bytecode.replace(regex, library_address.replace("0x", ""));
    });

    return bytecode;
  },

  // Extracts optional tx params from a list of fn arguments
  getTxParams: function(args){
    var constructor = this;

    var tx_params =  {};
    var last_arg = args[args.length - 1];

    // It's only tx_params if it's an object and not a BigNumber.
    if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
      tx_params = args.pop();
    }
    tx_params = Utils.merge(constructor.class_defaults, tx_params);
    return tx_params;
  },

  // Verifies that a contracts libraries have been linked correctly.
  // Throws on error
  checkLibraries: function(){
    var constructor = this;
    var regex = /__[^_]+_+/g;
    var unlinked_libraries = constructor.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      var error = constructor.contractName +
                  " contains unresolved libraries. You must deploy and link" +
                  " the following libraries before you can deploy a new version of " +
                  constructor.contractName + ": " + unlinked_libraries;


      throw new Error(error);
    }
  },
};

module.exports = Utils;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const web3_1 = __importDefault(__webpack_require__(/*! web3 */ "web3"));

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const localStorage_1 = __importDefault(__webpack_require__(/*! ./storage/localStorage */ "./src/storage/localStorage.ts"));

const contracts_1 = __webpack_require__(/*! ./contracts/contracts */ "./src/contracts/contracts.ts");

const config_1 = __webpack_require__(/*! ./lib/config */ "./src/lib/config.ts");

const conversion_1 = __webpack_require__(/*! ./lib/conversion */ "./src/lib/conversion.ts");

const market_1 = __webpack_require__(/*! ./lib/market */ "./src/lib/market.ts");

const network_1 = __webpack_require__(/*! ./lib/network */ "./src/lib/network.ts");

const tokens_1 = __webpack_require__(/*! ./lib/tokens */ "./src/lib/tokens.ts");

const atomicMethods_1 = __webpack_require__(/*! ./methods/atomicMethods */ "./src/methods/atomicMethods.ts");

const balanceActionMethods_1 = __webpack_require__(/*! ./methods/balanceActionMethods */ "./src/methods/balanceActionMethods.ts");

const balancesMethods_1 = __webpack_require__(/*! ./methods/balancesMethods */ "./src/methods/balancesMethods.ts");

const generalMethods_1 = __webpack_require__(/*! ./methods/generalMethods */ "./src/methods/generalMethods.ts");

const orderbookMethods_1 = __webpack_require__(/*! ./methods/orderbookMethods */ "./src/methods/orderbookMethods.ts");

const settlementMethods_1 = __webpack_require__(/*! ./methods/settlementMethods */ "./src/methods/settlementMethods.ts");

const storageMethods_1 = __webpack_require__(/*! ./methods/storageMethods */ "./src/methods/storageMethods.ts");

const memoryStorage_1 = __webpack_require__(/*! ./storage/memoryStorage */ "./src/storage/memoryStorage.ts");

const types_1 = __webpack_require__(/*! ./types */ "./src/types.ts"); // Export all types


__export(__webpack_require__(/*! ./types */ "./src/types.ts"));
/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class RenExSDK
 */


class RenExSDK {
  /**
   * Creates an instance of RenExSDK.
   * @param {Provider} provider
   * @memberof RenExSDK
   */
  constructor(provider, options) {
    this._atomConnectionStatus = types_1.AtomicConnectionStatus.NotConnected;
    this._atomConnectedAddress = "";
    this._cachedTokenDetails = new Map(); // Atomic functions

    this.atom = {
      getStatus: () => atomicMethods_1.currentAtomConnectionStatus(this),
      isConnected: () => atomicMethods_1.atomConnected(this),
      refreshStatus: () => atomicMethods_1.refreshAtomConnectionStatus(this),
      resetStatus: () => atomicMethods_1.resetAtomConnection(this),
      authorize: () => atomicMethods_1.authorizeAtom(this),
      fetchBalances: tokens => atomicMethods_1.atomicBalances(this, tokens),
      fetchAddresses: tokens => atomicMethods_1.atomicAddresses(tokens)
    };
    this.utils = {
      normalizePrice: (price, roundUp) => {
        return conversion_1.toOriginalType(conversion_1.normalizePrice(new bignumber_js_1.default(price), roundUp), price);
      },
      normalizeVolume: (volume, roundUp) => {
        return conversion_1.toOriginalType(conversion_1.normalizeVolume(new bignumber_js_1.default(volume), roundUp), volume);
      },
      normalizeOrder: order => {
        const newOrder = Object.assign(order, {});
        newOrder.price = this.utils.normalizePrice(order.price, order.side === types_1.OrderSide.SELL);
        newOrder.volume = this.utils.normalizeVolume(order.volume);

        if (order.minVolume) {
          newOrder.minVolume = this.utils.normalizeVolume(order.minVolume);
        }

        return newOrder;
      }
    };
    this._address = "";

    this.fetchBalances = tokens => balancesMethods_1.balances(this, tokens);

    this.fetchBalanceActionStatus = txHash => balanceActionMethods_1.updateBalanceActionStatus(this, txHash);

    this.fetchOrderStatus = orderID => settlementMethods_1.status(this, orderID);

    this.fetchMatchDetails = orderID => settlementMethods_1.matchDetails(this, orderID);

    this.fetchOrderbook = filter => orderbookMethods_1.getOrders(this, filter);

    this.fetchOrderBlockNumber = orderID => orderbookMethods_1.getOrderBlockNumber(this, orderID); // public fetchAtomicMarkets = ()


    this.fetchMarkets = () => market_1.fetchMarkets(this);

    this.fetchSupportedTokens = () => tokens_1.supportedTokens(this);

    this.fetchSupportedAtomicTokens = () => atomicMethods_1.supportedAtomicTokens(this); // Transaction Methods


    this.deposit = (value, token) => balanceActionMethods_1.deposit(this, value, token);

    this.withdraw = (value, token, withoutIngressSignature = false) => balanceActionMethods_1.withdraw(this, value, token, withoutIngressSignature);

    this.openOrder = (order, simpleConsole) => orderbookMethods_1.openOrder(this, order, simpleConsole);

    this.cancelOrder = orderID => orderbookMethods_1.cancelOrder(this, orderID);

    this.fetchDarknodeFeePercent = () => settlementMethods_1.darknodeFees(this);

    this.fetchMinEthTradeVolume = () => orderbookMethods_1.getMinEthTradeVolume(this);

    this.fetchGasPrice = () => generalMethods_1.getGasPrice(this); // Storage functions


    this.fetchTraderOrders = (options = {
      refresh: true
    }) => storageMethods_1.fetchTraderOrders(this, options);

    this.fetchBalanceActions = (options = {
      refresh: true
    }) => storageMethods_1.fetchBalanceActions(this, options);

    this.refreshBalanceActionStatuses = async () => balanceActionMethods_1.updateAllBalanceActionStatuses(this);

    this.refreshOrderStatuses = async () => orderbookMethods_1.updateAllOrderStatuses(this); // Provider / account functions


    this.getWeb3 = () => this._web3;

    this.getAddress = () => this._address;

    this.getConfig = () => this._config;

    this.setAddress = address => {
      this._address = address;

      if (this.getConfig().storageProvider === "localStorage") {
        this._storage = new localStorage_1.default(address);
      }
    };

    this.updateProvider = provider => {
      this._web3 = new web3_1.default(provider); // Update contract providers

      this._contracts = {
        renExSettlement: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.RenExSettlement))(this._networkData.contracts[0].renExSettlement),
        renExBalances: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.RenExBalances))(this._networkData.contracts[0].renExBalances),
        orderbook: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.Orderbook))(this._networkData.contracts[0].orderbook),
        darknodeRegistry: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.DarknodeRegistry))(this._networkData.contracts[0].darknodeRegistry),
        renExTokens: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.RenExTokens))(this._networkData.contracts[0].renExTokens),
        erc20: new Map(),
        wyre: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.Wyre))(this._networkData.contracts[0].wyre)
      };
    };

    this._web3 = new web3_1.default(provider);
    this._config = config_1.generateConfig(options);

    switch (this.getConfig().network) {
      case "mainnet":
        this._networkData = network_1.networks.mainnet;
        break;

      case "testnet":
        this._networkData = network_1.networks.testnet;
        break;

      default:
        throw new Error(`Unsupported network field: ${this.getConfig().network}`);
    }

    this._cachedTokenDetails = this._cachedTokenDetails.set(types_1.Token.BTC, Promise.resolve({
      addr: "0x0000000000000000000000000000000000000000",
      decimals: new bn_js_1.BN(8),
      registered: true
    })).set(types_1.Token.ETH, Promise.resolve({
      addr: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      decimals: new bn_js_1.BN(18),
      registered: true
    })).set(types_1.Token.DGX, Promise.resolve({
      addr: this._networkData.tokens.DGX,
      decimals: new bn_js_1.BN(9),
      registered: true
    })).set(types_1.Token.TUSD, Promise.resolve({
      addr: this._networkData.tokens.TUSD,
      decimals: new bn_js_1.BN(18),
      registered: true
    })).set(types_1.Token.REN, Promise.resolve({
      addr: this._networkData.tokens.REN,
      decimals: new bn_js_1.BN(18),
      registered: true
    })).set(types_1.Token.ZRX, Promise.resolve({
      addr: this._networkData.tokens.ZRX,
      decimals: new bn_js_1.BN(18),
      registered: true
    })).set(types_1.Token.OMG, Promise.resolve({
      addr: this._networkData.tokens.OMG,
      decimals: new bn_js_1.BN(18),
      registered: true
    }));

    switch (this.getConfig().storageProvider) {
      case "localStorage":
        this._storage = new localStorage_1.default(this._address);
        break;

      case "memory":
        this._storage = new memoryStorage_1.MemoryStorage();
        break;

      default:
        if (typeof this.getConfig().storageProvider === "string") {
          throw new Error(`Unsupported storage option: ${this.getConfig().storageProvider}.`);
        }

        this._storage = this.getConfig().storageProvider;
    }

    this._contracts = {
      renExSettlement: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.RenExSettlement))(this._networkData.contracts[0].renExSettlement),
      renExBalances: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.RenExBalances))(this._networkData.contracts[0].renExBalances),
      orderbook: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.Orderbook))(this._networkData.contracts[0].orderbook),
      darknodeRegistry: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.DarknodeRegistry))(this._networkData.contracts[0].darknodeRegistry),
      renExTokens: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.RenExTokens))(this._networkData.contracts[0].renExTokens),
      erc20: new Map(),
      wyre: new (contracts_1.withProvider(this.getWeb3().currentProvider, contracts_1.Wyre))(this._networkData.contracts[0].wyre)
    };
  }

}

exports.default = RenExSDK;

/***/ }),

/***/ "./src/lib/atomic.ts":
/*!***************************!*\
  !*** ./src/lib/atomic.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));

const crypto_1 = __importDefault(__webpack_require__(/*! crypto */ "crypto")); // import { second, sleep } from "@Library/conversion";


const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const encodedData_1 = __webpack_require__(/*! ./encodedData */ "./src/lib/encodedData.ts");

const errors_1 = __webpack_require__(/*! ./errors */ "./src/lib/errors.ts");

const ingress_1 = __webpack_require__(/*! ./ingress */ "./src/lib/ingress.ts"); // import { Order } from "@Library/ingress";
// import { NetworkData } from "@Library/network";


const API = "http://localhost:18516";
exports.ErrorAtomNotLinked = "Atom back-end not linked to wallet";
exports.ErrorUnableToConnect = "Unable to connect go Atom back-end";
exports.ErrorAddressNotAuthorized = "Ethereum address not authorized for Atom";
exports.ErrorUnableToRetrieveStatus = "Unable to retrieve order status";
exports.ErrorUnableToRetrieveBalances = "Unable to retrieve Atomic balances";

function checkSigner(web3, response) {
  const message = JSON.stringify(response.whoAmI);
  const whoamiString = "\x19Ethereum Signed Message:\n" + message.length + message;
  const hash = web3.utils.keccak256(whoamiString);
  const r = "0x" + response.signature.slice(0, 64);
  const s = "0x" + response.signature.slice(64, 128);
  const recovery = "0x" + response.signature.slice(128, 130);
  const v = "0x" + (parseInt(recovery, 16) + 27).toString(16); // tslint:disable-next-line:no-any

  return web3.eth.accounts.recover({
    messageHash: hash,
    r,
    s,
    v
  });
}

exports.checkSigner = checkSigner;

async function challengeSwapper() {
  const challenge = crypto_1.default.randomBytes(20).toString("hex");
  const response = await axios_1.default.get(`${API}/whoami/${challenge}`).then(resp => resp.data);

  if (response === undefined || response.whoAmI === undefined || response.whoAmI.authorizedAddresses === undefined || response.whoAmI.authorizedAddresses === null) {
    throw new Error("Failed the swapper whoami challenge.");
  }

  return response;
}

exports.challengeSwapper = challengeSwapper;

async function _connectToAtom(response, ingressURL, address) {
  const authorizedAddresses = response.whoAmI.authorizedAddresses.map(addr => {
    return new encodedData_1.EncodedData(addr, encodedData_1.Encodings.HEX).toHex().toLowerCase();
  });
  const comparisonAddress = new encodedData_1.EncodedData(address, encodedData_1.Encodings.HEX).toHex().toLowerCase();

  if (authorizedAddresses.indexOf(comparisonAddress) === -1) {
    // TODO: Inform user address is not authorized
    return types_1.AtomicConnectionStatus.NotAuthorized;
  } // TODO: Use web3 from store
  // const msg = "0x" + new Buffer(JSON.stringify(response.whoAmI)).toString("hex");
  // const chaHash = web3.utils.keccak256(msg);
  // const swapperAddress = web3.eth.accounts.recover(chaHash, "0x" + response.signature, true as any);


  const expectedEthAddress = await getAtomicBalances().then(resp => resp.ethereum.address); // Check with Ingress if Atomic address is authorized

  const atomAuthorized = await ingress_1.checkAtomAuthorization(ingressURL, address, expectedEthAddress);

  if (atomAuthorized) {
    return types_1.AtomicConnectionStatus.ConnectedUnlocked;
  }

  return types_1.AtomicConnectionStatus.AtomNotAuthorized;
}

exports._connectToAtom = _connectToAtom;

async function _authorizeAtom(web3, ingressURL, atomAddress, address) {
  const req = await getAtomAuthorizationRequest(web3, atomAddress, address);
  await ingress_1.authorizeSwapper(ingressURL, req);
}

exports._authorizeAtom = _authorizeAtom;

async function getAtomAuthorizationRequest(web3, atomAddress, address) {
  const prefix = web3.utils.toHex("RenEx: authorize: ");
  const checkedAddress = new encodedData_1.EncodedData(atomAddress, encodedData_1.Encodings.HEX);
  const hashForSigning = prefix + checkedAddress.toHex("");
  let signature;

  try {
    // tslint:disable-next-line:no-any
    signature = new encodedData_1.EncodedData((await web3.eth.personal.sign(hashForSigning, address)));
  } catch (error) {
    if (error.message.match(/User denied message signature/)) {
      return Promise.reject(new Error(errors_1.ErrSignatureCanceledByUser));
    }

    return Promise.reject(new Error(errors_1.ErrUnsignedTransaction));
  }

  const buff = signature.toBuffer(); // Normalize v to be 0 or 1 (NOTE: Orderbook contract expects either format,
  // but for future compatibility, we stick to one format)
  // MetaMask gives v as 27 or 28, Ledger gives v as 0 or 1

  if (buff[64] === 27 || buff[64] === 28) {
    buff[64] = buff[64] - 27;
  }

  return new ingress_1.AtomAuthorizationRequest({
    atomAddress: checkedAddress.toHex(),
    signature: buff.toString("base64")
  });
}

async function submitOrderToAtom(orderID) {
  // orderID and signature should be hex-encoded
  const data = {
    orderID: orderID.toHex("")
  };
  let response;

  try {
    response = (await axios_1.default.post(`${API}/orders`, data)).data;
  } catch (error) {
    throw error;
  }

  if (response.orderID !== data.orderID) {
    throw new Error("Invalid order ID returned by Atom");
  } // TODO: Check response.signature against Atom's address

}

exports.submitOrderToAtom = submitOrderToAtom;

async function getOrderStatus(orderID) {
  let response;

  try {
    response = (await axios_1.default.get(`${API}/status/${orderID.toHex("")}`)).data;
  } catch (error) {
    console.error(error);
    throw new Error(exports.ErrorUnableToRetrieveStatus);
  } // if (response.order_id !== orderID.toHex()) {
  //     console.error(`Unexpected order ID returned from /status GET request to Atom`);
  //     throw new Error(ErrorUnableToRetrieveStatus);
  // }


  return response.status;
}

exports.getOrderStatus = getOrderStatus;

async function getAtomicBalances() {
  let response;

  try {
    response = (await axios_1.default.get(`${API}/balances`)).data;
  } catch (error) {
    console.error(error);
    throw new Error(exports.ErrorUnableToRetrieveStatus);
  }

  return response;
}

exports.getAtomicBalances = getAtomicBalances;

/***/ }),

/***/ "./src/lib/balances.ts":
/*!*****************************!*\
  !*** ./src/lib/balances.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const errors_1 = __webpack_require__(/*! ./errors */ "./src/lib/errors.ts"); // import { Token, TokenDetails } from "./market";


exports.adjustDecimals = (value, fromDecimals, toDecimals) => {
  if (bignumber_js_1.default.isBigNumber(value) || value instanceof bignumber_js_1.default) {
    value = new bignumber_js_1.default(value.toFixed());
  } else {
    value = new bignumber_js_1.default(value.toString());
  }

  if (fromDecimals < toDecimals) {
    return new bn_js_1.BN(value.multipliedBy(new bignumber_js_1.default(10).exponentiatedBy(toDecimals - fromDecimals)).toFixed());
  } else {
    const v = value.dividedBy(new bignumber_js_1.default(10).exponentiatedBy(fromDecimals - toDecimals));

    if (!v.integerValue(bignumber_js_1.default.ROUND_FLOOR).eq(v)) {
      // We have a floating point number which can't be converted to BN.
      // This usually happens when the value passed in is too small.
      throw new Error(`${errors_1.ErrNumericalPrecision}: converting ${value} from ${fromDecimals} to ${toDecimals} decimals`);
    }

    return new bn_js_1.BN(v.toFixed());
  }
}; // /**
//  * Convert a token amount to the readable amount using the token decimals.
//  * @param {BigNumber} balance The balance represented as a BigNumber.
//  * @param {Token} token The token used to represented the balance.
//  */
// export const balanceToReadable = (balance: BigNumber, token: Token): BigNumber => {
//     const tokenDetails = TokenDetails.get(token);
//     if (balance === undefined) {
//         balance = new BigNumber(0);
//     }
//     const e = new BigNumber(10).pow(tokenDetails.digits);
//     balance = balance.div(e);
//     return balance;
// };
// /**
//  * Convert a readable amount to the token amount using the token decimals.
//  * @param {string} readable The amount represented as a string.
//  * @param {Token} token The token used to represent the amount.
//  */
// export const readableToBalance = (readable: string, token: Token): BigNumber => {
//     const tokenDetails = TokenDetails.get(token);
//     if (readable === undefined || readable === "") {
//         readable = "0";
//     }
//     let balance = new BigNumber(readable);
//     const e = new BigNumber(10).pow(tokenDetails.digits);
//     balance = balance.times(e);
//     return balance;
// };
// /**
//  * Removes excessive digits from a value for a given currency. Primarily used
//  * for user inputs.
//  * @param {BigNumber} amount The amount to be checked for excessive digits.
//  * @param {Token} token The token the digits should be checked against.
//  */
// export const removeExcessDigits = (amount: BigNumber, token: Token): BigNumber => {
//     const value = readableToBalance(amount.toFixed(), token).decimalPlaces(0);
//     return new BigNumber(balanceToReadable(value, token));
// };

/***/ }),

/***/ "./src/lib/config.ts":
/*!***************************!*\
  !*** ./src/lib/config.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultConfig = {
  network: "mainnet",
  autoNormalizeOrders: false,
  storageProvider: "localStorage"
};

function generateConfig(options) {
  options = options || {};
  const conf = exports.defaultConfig;

  if (options.network !== undefined) {
    conf.network = options.network;
  }

  if (options.autoNormalizeOrders !== undefined) {
    conf.autoNormalizeOrders = options.autoNormalizeOrders;
  }

  if (options.storageProvider !== undefined) {
    conf.storageProvider = options.storageProvider;
  }

  return conf;
}

exports.generateConfig = generateConfig;

/***/ }),

/***/ "./src/lib/conversion.ts":
/*!*******************************!*\
  !*** ./src/lib/conversion.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const ingress_1 = __webpack_require__(/*! ./ingress */ "./src/lib/ingress.ts");
/**
 * Calculate price tuple from a decimal string
 *
 * https://github.com/republicprotocol/republic-go/blob/smpc/docs/orders-and-order-fragments.md
 *
 */


function priceToTuple(price, roundUp) {
  const shift = 10 ** 12;
  const exponentOffset = 26;
  const step = 0.005;
  const tuple = floatToTuple(shift, exponentOffset, step, price, 1999, roundUp); // console.assert(0 <= tuple.c && tuple.c <= 1999, `Expected c (${tuple.c}) to be in [0,1999] in priceToTuple(${price})`);
  // console.assert(0 <= tuple.q && tuple.q <= 52, `Expected q (${tuple.q}) to be in [0,52] in priceToTuple(${price})`);

  return tuple;
}

exports.priceToTuple = priceToTuple;

exports.tupleToPrice = t => {
  const e = new bignumber_js_1.default(10).pow(t.q - 26 - 12 - 3);
  return new bignumber_js_1.default(t.c).times(5).times(e);
};

exports.normalizePrice = (p, roundUp) => {
  return exports.tupleToPrice(priceToTuple(p, roundUp));
};

function volumeToTuple(volume, roundUp) {
  const shift = 10 ** 12;
  const exponentOffset = 0;
  const step = 0.2;
  const tuple = floatToTuple(shift, exponentOffset, step, volume, 49, roundUp); // console.assert(0 <= tuple.c && tuple.c <= 49, `Expected c (${tuple.c}) to be in [0,49] in volumeToTuple(${volume})`);
  // console.assert(0 <= tuple.q && tuple.q <= 52, `Expected q (${tuple.q}) to be in [0,52] in volumeToTuple(${volume})`);

  return tuple;
}

exports.volumeToTuple = volumeToTuple;

exports.tupleToVolume = t => {
  const e = new bignumber_js_1.default(10).pow(t.q - 12);
  return new bignumber_js_1.default(t.c).times(0.2).times(e);
};

exports.normalizeVolume = (v, roundUp) => {
  return exports.tupleToVolume(volumeToTuple(v, roundUp));
};

function floatToTuple(shift, exponentOffset, step, value, max, roundUp) {
  const shifted = value.times(shift);
  const digits = -Math.floor(Math.log10(step)) + 1;
  const stepInt = step * 10 ** (digits - 1); // CALCULATE tuple

  let [c, exp] = significantDigits(shifted, digits, false, roundUp);

  if (!roundUp) {
    c = (c - c % stepInt) / step;
  } else {
    c = (c + (stepInt - c % stepInt) % stepInt) / step;
  } // Simplify again if possible - e.g. [1910,32] becomes [191,33]


  let expAdd;
  [c, expAdd] = significantDigits(new bignumber_js_1.default(c), digits, false, roundUp);
  exp += expAdd; // TODO: Fixme

  while (c > max) {
    c /= 10;
    exp++;
  }

  const q = exponentOffset + exp;
  return new ingress_1.Tuple({
    c,
    q
  });
}

function significantDigits(n, digits, simplify = false, roundUp) {
  if (n.isEqualTo(0)) {
    return [0, 0];
  }

  let exp = Math.floor(Math.log10(n.toNumber())) - (digits - 1);
  const pow = new bignumber_js_1.default(10).exponentiatedBy(new bignumber_js_1.default(exp).toNumber());
  let c;

  if (!roundUp) {
    c = Math.floor(n.div(pow.toNumber()).toNumber());
  } else {
    c = Math.ceil(n.div(pow.toNumber()).toNumber());
  }

  if (simplify) {
    while (c % 10 === 0 && c !== 0) {
      c = c / 10;
      exp++;
    }
  }

  return [c, exp];
}

function toOriginalType(converted, original) {
  if (bignumber_js_1.default.isBigNumber(original)) {
    return converted;
  }

  switch (typeof original) {
    case "number":
      return converted.toNumber();

    case "string":
      return converted.toFixed();

    default:
      throw new Error(`Could not convert ${typeof original} to original type`);
  }
}

exports.toOriginalType = toOriginalType;

/***/ }),

/***/ "./src/lib/encodedData.ts":
/*!********************************!*\
  !*** ./src/lib/encodedData.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * EncodedData is a wrapper type that can contain and format bytes in various
 * encodings (hex, base64, base58, node's buffer).
 *
 * Usage:
 *
 * new EncodedData("0x1234")
 * new EncodedData("1234", Encodings.HEX)
 *
 * new EncodedData(buffer).toBase58()
 *
 */

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bs58 = __importStar(__webpack_require__(/*! bs58 */ "bs58"));

const record_1 = __webpack_require__(/*! ./record */ "./src/lib/record.ts");

var Encodings;

(function (Encodings) {
  Encodings["AUTO"] = "auto";
  Encodings["HEX"] = "hex";
  Encodings["BASE64"] = "base64";
  Encodings["BUFFER"] = "buffer";
  Encodings["UNKNOWN"] = "unknown";
})(Encodings = exports.Encodings || (exports.Encodings = {}));

const DefaultEncodedData = {
  value: "",
  encoding: Encodings.AUTO
};

const parse = (param, encoding) => {
  if (encoding !== undefined) {
    if (typeof param === "string" && encoding !== Encodings.BUFFER) {
      param = {
        value: param,
        encoding
      };
    } else if (param instanceof Buffer && encoding === Encodings.BUFFER) {
      param = {
        value: param,
        encoding
      };
    }
  }

  if (typeof param === "string") {
    param = {
      value: param,
      encoding: Encodings.AUTO
    };
  }

  if (param instanceof Buffer) {
    param = {
      value: param,
      encoding: Encodings.BUFFER
    };
  }

  if (param.encoding === Encodings.AUTO) {
    if (typeof param.value === "string") {
      if (param.value === "" || param.value.slice(0, 2) === "0x" || param.value.match("^[A-Fa-f0-9]+$")) {
        param.encoding = Encodings.HEX;
      } else if (param.value.match("^[A-Za-z0-9+/=]+$")) {
        param.encoding = Encodings.BASE64;
      }
    } else if (param.value instanceof Buffer) {
      param.encoding = Encodings.BUFFER;
    }
  }

  if (param.encoding === Encodings.BUFFER && !(param.value instanceof Buffer)) {
    throw new Error("invalid buffer");
  }

  if (param.encoding === Encodings.HEX) {
    if (typeof param.value !== "string") {
      throw new Error("invalid hex");
    }

    if (param.value.slice(0, 2) === "0x") {
      param.value = param.value.slice(2);
    }

    if (param.value === "") {
      param.value = "00";
    }

    if (param.value.length % 2 === 1) {
      param.value = "0" + param.value;
    }

    if (!param.value.match("^[A-Fa-f0-9]+$")) {
      throw new Error("invalid hex");
    }
  }

  return param;
};

class EncodedData extends record_1.Record(DefaultEncodedData) {
  /**
   * Creates an instance of EncodedData.
   * @param {string | Buffer} param The encoded data
   * @param {Encodings} [encoding] One of "hex", "base64", "buffer"
   * @memberof EncodedData
   */
  constructor(param, encoding) {
    if (param instanceof EncodedData) {
      param = {
        value: param.value,
        encoding: param.encoding
      };
    }

    param = parse(param, encoding);
    super(param);
  }

  toHex(prefix = "0x") {
    switch (this.encoding) {
      case Encodings.HEX:
        return prefix + this.value;

      case Encodings.BASE64:
        return prefix + Buffer.from(this.value, "base64").toString("hex");

      case Encodings.BUFFER:
        return prefix + this.value.toString("hex");

      default:
        throw new Error("Unable to convert to hexadecimal representation");
    }
  }

  toBase64() {
    switch (this.encoding) {
      case Encodings.HEX:
        return Buffer.from(this.value, "hex").toString("base64");

      case Encodings.BASE64:
        return this.value;

      case Encodings.BUFFER:
        return this.value.toString("base64");

      default:
        throw new Error("Unable to convert to base64 representation");
    }
  }

  toBase58() {
    const buff = this.toBuffer();
    return bs58.encode(buff);
  }

  toBuffer() {
    switch (this.encoding) {
      case Encodings.HEX:
        return Buffer.from(this.value, "hex");

      case Encodings.BASE64:
        return Buffer.from(this.value, "base64");

      case Encodings.BUFFER:
        return this.value;

      default:
        throw new Error("Unable to convert to buffer");
    }
  }

  toString() {
    return this.toHex();
  }

}

exports.EncodedData = EncodedData;

/***/ }),

/***/ "./src/lib/errors.ts":
/*!***************************!*\
  !*** ./src/lib/errors.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrUnimplemented = "Method not implemented.";
exports.ErrCanceledByUser = "Transaction canceled";
exports.ErrSignatureCanceledByUser = "Signature canceled";
exports.ErrUnsignedTransaction = "Unable to sign transaction";
exports.ErrInvalidOrderDetails = "Something went wrong while encoding order";
exports.ErrNumericalPrecision = "Unsupported precision numbers";
exports.ErrFailedDeposit = "Unable to deposit funds";
exports.ErrInsufficientBalance = "Insufficient balance";
exports.ErrInsufficientFunds = "Insufficient funds - please ensure you have enough ETH for the transaction fees";
exports.ErrUnsupportedFilterStatus = "Unable to filter by specified status";
exports.ErrUnknownOrderStatus = "Unknown order status";

/***/ }),

/***/ "./src/lib/ingress.ts":
/*!****************************!*\
  !*** ./src/lib/ingress.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));

const NodeRSA = __webpack_require__(/*! node-rsa */ "node-rsa");

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const immutable_1 = __webpack_require__(/*! immutable */ "immutable");

const shamir = __importStar(__webpack_require__(/*! ./shamir */ "./src/lib/shamir.ts"));

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const balances_1 = __webpack_require__(/*! ./balances */ "./src/lib/balances.ts");

const encodedData_1 = __webpack_require__(/*! ./encodedData */ "./src/lib/encodedData.ts");

const market_1 = __webpack_require__(/*! ./market */ "./src/lib/market.ts");

const order_1 = __webpack_require__(/*! ./order */ "./src/lib/order.ts");

const record_1 = __webpack_require__(/*! ./record */ "./src/lib/record.ts");

const tokens_1 = __webpack_require__(/*! ./tokens */ "./src/lib/tokens.ts"); // TODO: Read these from the contract


const PRICE_OFFSET = 12;
const VOLUME_OFFSET = 12;
const NULL = "0x0000000000000000000000000000000000000000";
var OrderSettlement;

(function (OrderSettlement) {
  OrderSettlement[OrderSettlement["RenEx"] = 1] = "RenEx";
  OrderSettlement[OrderSettlement["RenExAtomic"] = 2] = "RenExAtomic";
})(OrderSettlement = exports.OrderSettlement || (exports.OrderSettlement = {}));

function orderSettlementMapper(settlement) {
  switch (settlement) {
    case types_1.OrderSettlement.RenEx:
      return OrderSettlement.RenEx;

    case types_1.OrderSettlement.RenExAtomic:
      return OrderSettlement.RenExAtomic;
  }
}

var OrderType;

(function (OrderType) {
  OrderType[OrderType["MIDPOINT"] = 0] = "MIDPOINT";
  OrderType[OrderType["LIMIT"] = 1] = "LIMIT";
  OrderType[OrderType["MIDPOINT_IOC"] = 2] = "MIDPOINT_IOC";
  OrderType[OrderType["LIMIT_IOC"] = 3] = "LIMIT_IOC";
})(OrderType = exports.OrderType || (exports.OrderType = {}));

function orderTypeMapper(orderType) {
  switch (orderType) {
    case types_1.OrderType.MIDPOINT:
      return OrderType.MIDPOINT;

    case types_1.OrderType.LIMIT:
      return OrderType.LIMIT;

    case types_1.OrderType.MIDPOINT_IOC:
      return OrderType.MIDPOINT_IOC;

    case types_1.OrderType.LIMIT_IOC:
      return OrderType.LIMIT_IOC;
  }
}

var OrderParity;

(function (OrderParity) {
  OrderParity[OrderParity["BUY"] = 0] = "BUY";
  OrderParity[OrderParity["SELL"] = 1] = "SELL";
})(OrderParity = exports.OrderParity || (exports.OrderParity = {}));

function orderParityMapper(orderSide) {
  switch (orderSide) {
    case types_1.OrderSide.BUY:
      return OrderParity.BUY;

    case types_1.OrderSide.SELL:
      return OrderParity.SELL;
  }
}

class Tuple extends record_1.Record({
  c: 0,
  q: 0
}) {}

exports.Tuple = Tuple;

class Order extends record_1.Record({
  signature: "",
  id: "",
  type: OrderType.LIMIT,
  parity: OrderParity.BUY,
  orderSettlement: OrderSettlement.RenEx,
  expiry: Math.round(new Date().getTime() / 1000),
  tokens: new bn_js_1.BN(0),
  price: new bn_js_1.BN(0),
  volume: new bn_js_1.BN(0),
  minimumVolume: new bn_js_1.BN(0),
  nonce: new bn_js_1.BN(0)
}) {}

exports.Order = Order;

class AtomAuthorizationRequest extends record_1.Record({
  atomAddress: "",
  signature: ""
}) {}

exports.AtomAuthorizationRequest = AtomAuthorizationRequest;

class OpenOrderRequest extends record_1.Record({
  address: "",
  orderFragmentMappings: Array()
}) {}

exports.OpenOrderRequest = OpenOrderRequest;

class WithdrawRequest extends record_1.Record({
  address: "",
  tokenID: 0
}) {}

exports.WithdrawRequest = WithdrawRequest;

class OrderFragment extends record_1.Record({
  id: "",
  orderId: "",
  orderType: OrderType.LIMIT,
  orderParity: OrderParity.BUY,
  orderSettlement: OrderSettlement.RenEx,
  orderExpiry: Math.round(new Date().getTime() / 1000),
  tokens: "",
  price: ["", ""],
  volume: ["", ""],
  minimumVolume: ["", ""],
  nonce: "",
  index: 0
}) {}

exports.OrderFragment = OrderFragment;

class Pod extends record_1.Record({
  id: "",
  darknodes: immutable_1.List(),
  orderFragments: immutable_1.List()
}) {}

exports.Pod = Pod;

function randomNonce(randomBN) {
  let nonce = randomBN();

  while (nonce.gte(shamir.PRIME)) {
    nonce = randomBN();
  }

  return nonce;
}

exports.randomNonce = randomNonce;

async function authorizeSwapper(ingressURL, request) {
  const resp = await axios_1.default.post(`${ingressURL}/authorize`, request.toJS());

  if (resp.status === 201) {
    return true;
  }

  if (resp.status === 401) {
    throw new Error("Could not authorize swapper. Reason: address is not KYC'd");
  }

  throw new Error(`Could not authorize swapper. Status code: ${resp.status}`);
}

exports.authorizeSwapper = authorizeSwapper;

async function checkAtomAuthorization(ingressURL, address, expectedEthAddress) {
  return axios_1.default.get(`${ingressURL}/authorized/${address}`).then(resp => {
    if (resp.status !== 200) {
      throw new Error("Unexpected status code: " + resp.status);
    }

    const approvedAddress = new encodedData_1.EncodedData(resp.data.atomAddress, encodedData_1.Encodings.HEX).toHex();
    return approvedAddress.toLowerCase() === expectedEthAddress.toLowerCase();
  }).catch(err => {
    console.error(err);
    return false;
  });
}

exports.checkAtomAuthorization = checkAtomAuthorization;

function createOrder(orderInputs, nonce) {
  const marketDetail = market_1.MarketPairs.get(orderInputs.symbol);

  if (!marketDetail) {
    throw new Error(`Couldn't find market information for market: ${orderInputs.symbol}`);
  }

  const baseToken = marketDetail.base;
  const quoteToken = marketDetail.quote;
  const spendToken = orderInputs.side === types_1.OrderSide.BUY ? quoteToken : baseToken;
  const receiveToken = orderInputs.side === types_1.OrderSide.BUY ? baseToken : quoteToken;
  const price = balances_1.adjustDecimals(orderInputs.price, 0, PRICE_OFFSET);
  const volume = balances_1.adjustDecimals(orderInputs.volume, 0, VOLUME_OFFSET);
  const minimumVolume = balances_1.adjustDecimals(orderInputs.minVolume, 0, VOLUME_OFFSET);
  const tokens = orderInputs.side === types_1.OrderSide.BUY ? tokens_1.generateTokenPairing(tokens_1.tokenToID(spendToken), tokens_1.tokenToID(receiveToken)) : tokens_1.generateTokenPairing(tokens_1.tokenToID(receiveToken), tokens_1.tokenToID(spendToken));
  const ingressOrder = new Order({
    type: orderTypeMapper(orderInputs.type),
    orderSettlement: orderSettlementMapper(marketDetail.orderSettlement),
    expiry: orderInputs.expiry,
    nonce: nonce ? nonce : new bn_js_1.BN(0),
    parity: orderParityMapper(orderInputs.side),
    tokens,
    price,
    volume,
    minimumVolume
  });
  return ingressOrder;
}

exports.createOrder = createOrder;

async function submitOrderFragments(ingressURL, request) {
  try {
    const resp = await axios_1.default.post(`${ingressURL}/orders`, request.toJS());

    if (resp.status !== 201) {
      throw new Error(`Unexpected status code returned by Ingress (STATUS ${resp.status})`);
    }

    return new encodedData_1.EncodedData(resp.data.signature, encodedData_1.Encodings.BASE64);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error("KYC verification failed in Ingress");
      } else {
        throw new Error(`Ingress returned status ${error.response.status} with reason: ${error.response.data}`);
      }
    } else {
      throw error;
    }
  }
}

exports.submitOrderFragments = submitOrderFragments;

async function requestWithdrawalSignature(ingressURL, address, token) {
  const request = new WithdrawRequest({
    address: address.slice(2),
    tokenID: tokens_1.tokenToID(token)
  });
  const resp = await axios_1.default.post(`${ingressURL}/withdrawals`, request.toJS());

  if (resp.status !== 201) {
    throw new Error("Unexpected status code: " + resp.status);
  }

  return new encodedData_1.EncodedData(resp.data.signature, encodedData_1.Encodings.BASE64);
}

exports.requestWithdrawalSignature = requestWithdrawalSignature;

async function ordersBatch(orderbook, offset, limit) {
  let orders;

  try {
    orders = await orderbook.getOrders(offset, limit);
  } catch (error) {
    console.error(`Failed to get call getOrders in ordersBatch`);
    throw error;
  }

  const orderIDs = orders[0];
  const tradersAddresses = orders[1];
  const orderStatuses = orders[2];
  let ordersList = immutable_1.List();

  for (let i = 0; i < orderIDs.length; i++) {
    const status = order_1.orderbookStateToOrderStatus(new bn_js_1.BN(orderStatuses[i]).toNumber());
    ordersList = ordersList.push([orderIDs[i], status, tradersAddresses[i]]);
  }

  return ordersList;
}

async function getOrders(orderbook, startIn, limitIn) {
  let orderCount;

  try {
    orderCount = new bn_js_1.BN((await orderbook.ordersCount())).toNumber();
  } catch (error) {
    console.error(`Failed to call orderCount in getOrders`);
    throw error;
  } // If limit is 0 then we treat is as no limit


  const limit = limitIn || orderCount - (startIn || 0); // Start can be 0 so we compare against undefined instead

  let start = startIn !== undefined ? startIn : Math.max(0, orderCount - limit); // We only get at most 500 orders per batch

  let batchLimit = Math.min(limit, 500); // Indicates where to stop (non-inclusive)

  const stop = limit ? start + Math.min(orderCount, limit) : orderCount;
  let ordersList = immutable_1.List();

  while (true) {
    // Check if the limit has been reached
    if (start >= stop) {
      return ordersList;
    } // Don't get more than required


    batchLimit = Math.min(batchLimit, stop - start); // Retrieve batch of orders and increment start

    const batch = await ordersBatch(orderbook, start, batchLimit);
    ordersList = ordersList.concat(batch).toList();
    start += batchLimit;
  }
}

exports.getOrders = getOrders; // export async function getOrder(wallet: Wallet, orderId: string): Promise<Order> {
//     // FIXME: Unimplemented
//     return Promise.resolve(new Order({}));
// }
// export async function getOrders(wallet: Wallet, order: Order): Promise<List<Order>> {
//     // FIXME: Unimplemented
//     return Promise.resolve(List<Order>());
// }

function getOrderID(web3, order) {
  const [leftToken, rightToken] = tokens_1.splitTokenPairing(order.tokens);
  const adjustedTokens = order.parity === OrderParity.BUY ? order.tokens : tokens_1.generateTokenPairing(rightToken, leftToken);
  const bytes = Buffer.concat([// Prefix hash
  new bn_js_1.BN(order.type).toArrayLike(Buffer, "be", 1), new bn_js_1.BN(order.expiry).toArrayLike(Buffer, "be", 8), order.nonce.toArrayLike(Buffer, "be", 8), new bn_js_1.BN(order.orderSettlement).toArrayLike(Buffer, "be", 8), adjustedTokens.toArrayLike(Buffer, "be", 8), new bn_js_1.BN(order.price).toArrayLike(Buffer, "be", 32), new bn_js_1.BN(order.volume).toArrayLike(Buffer, "be", 32), new bn_js_1.BN(order.minimumVolume).toArrayLike(Buffer, "be", 32)]);
  return new encodedData_1.EncodedData(web3.utils.keccak256(`0x${bytes.toString("hex")}`), encodedData_1.Encodings.HEX);
}

exports.getOrderID = getOrderID;

async function buildOrderMapping(web3, darknodeRegistryContract, order, simpleConsole) {
  const pods = await getPods(web3, darknodeRegistryContract, simpleConsole);
  const priceCoExp = order_1.priceToCoExp(order.price);
  const volumeCoExp = order_1.volumeToCoExp(order.volume);
  const minVolumeCoExp = order_1.volumeToCoExp(order.minimumVolume);
  const fragmentPromises = pods.map(async pod => {
    const n = pod.darknodes.size;
    const k = Math.floor(2 * (n + 1) / 3);
    simpleConsole.log(`Splitting secret shares for pod ${pod.id.slice(0, 8)}...`);
    const tokenShares = shamir.split(n, k, new bn_js_1.BN(order.tokens));
    const priceCoShares = shamir.split(n, k, new bn_js_1.BN(priceCoExp.co));
    const priceExpShares = shamir.split(n, k, new bn_js_1.BN(priceCoExp.exp));
    const volumeCoShares = shamir.split(n, k, new bn_js_1.BN(volumeCoExp.co));
    const volumeExpShares = shamir.split(n, k, new bn_js_1.BN(volumeCoExp.exp));
    const minimumVolumeCoShares = shamir.split(n, k, new bn_js_1.BN(minVolumeCoExp.co));
    const minimumVolumeExpShares = shamir.split(n, k, new bn_js_1.BN(minVolumeCoExp.exp));
    const nonceShares = shamir.split(n, k, order.nonce);
    let orderFragments = immutable_1.List(); // Loop through each darknode in the pod

    for (let i = 0; i < n; i++) {
      const darknode = pod.darknodes.get(i, undefined);

      if (darknode === undefined) {
        throw new Error("invalid darknode access");
      }

      simpleConsole.log(`Encrypting for darknode ${new encodedData_1.EncodedData("0x1b14" + darknode.slice(2), encodedData_1.Encodings.HEX).toBase58().slice(0, 8)}...`); // Retrieve darknode RSA public key from Darknode contract

      let darknodeKey = null;

      try {
        darknodeKey = await getDarknodePublicKey(darknodeRegistryContract, darknode, simpleConsole);
      } catch (error) {
        Promise.reject(error);
      }

      const [tokenShare, priceCoShare, priceExpShare, volumeCoShare, volumeExpShare, minimumVolumeCoShare, minimumVolumeExpShare, nonceShare] = [tokenShares.get(i), priceCoShares.get(i), priceExpShares.get(i), volumeCoShares.get(i), volumeExpShares.get(i), minimumVolumeCoShares.get(i), minimumVolumeExpShares.get(i), nonceShares.get(i)];

      if (tokenShare === undefined || priceCoShare === undefined || priceExpShare === undefined || volumeCoShare === undefined || volumeExpShare === undefined || minimumVolumeCoShare === undefined || minimumVolumeExpShare === undefined || nonceShare === undefined) {
        throw new Error("invalid share access");
      }

      let orderFragment = new OrderFragment({
        orderId: order.id,
        orderType: order.type,
        orderParity: order.parity,
        orderSettlement: order.orderSettlement,
        orderExpiry: order.expiry,
        tokens: encryptForDarknode(darknodeKey, tokenShare, 8).toBase64(),
        price: [encryptForDarknode(darknodeKey, priceCoShare, 8).toBase64(), encryptForDarknode(darknodeKey, priceExpShare, 8).toBase64()],
        volume: [encryptForDarknode(darknodeKey, volumeCoShare, 8).toBase64(), encryptForDarknode(darknodeKey, volumeExpShare, 8).toBase64()],
        minimumVolume: [encryptForDarknode(darknodeKey, minimumVolumeCoShare, 8).toBase64(), encryptForDarknode(darknodeKey, minimumVolumeExpShare, 8).toBase64()],
        nonce: encryptForDarknode(darknodeKey, nonceShare, 8).toBase64(),
        index: i + 1
      });
      orderFragment = orderFragment.set("id", hashOrderFragmentToId(web3, orderFragment));
      orderFragments = orderFragments.push(orderFragment);
    }

    return pod.set("orderFragments", orderFragments);
  }); // Reduce must happen serially

  return fragmentPromises.reduce(async (fragmentMappingsPromise, podPromise) => {
    const fragmentMappings = await fragmentMappingsPromise;
    const pod = await podPromise;
    return fragmentMappings.set(pod.id, pod.orderFragments);
  }, Promise.resolve(immutable_1.Map()));
}

exports.buildOrderMapping = buildOrderMapping;

function hashOrderFragmentToId(web3, orderFragment) {
  // TODO: Fix order hashing
  return Buffer.from(web3.utils.keccak256(JSON.stringify(orderFragment)).slice(2), "hex").toString("base64");
}

async function getDarknodePublicKey(darknodeRegistryContract, darknode, simpleConsole) {
  const darknodeKeyHex = await darknodeRegistryContract.getDarknodePublicKey(darknode);

  if (darknodeKeyHex === null || darknodeKeyHex.length === 0) {
    simpleConsole.error(`Unable to retrieve public key for ${darknode}`);
    return null;
  }

  const darknodeKey = Buffer.from(darknodeKeyHex.slice(2), "hex"); // We require the exponent E to fit into 32 bytes.
  // Since it is stored at 64 bytes, we ignore the first 32 bytes.
  // (Go's crypto/rsa Validate() also requires E to fit into a 32-bit integer)

  const e = darknodeKey.slice(0, 8).readUInt32BE(4);
  const n = darknodeKey.slice(8);
  const key = new NodeRSA();
  key.importKey({
    n,
    e
  });
  key.setOptions({
    encryptionScheme: {
      scheme: "pkcs1_oaep",
      hash: "sha1"
    }
  });
  return key;
}

function encryptForDarknode(darknodeKey, share, byteCount) {
  if (darknodeKey === null) {
    return new encodedData_1.EncodedData("", encodedData_1.Encodings.BASE64);
  } // TODO: Check that bignumber isn't bigger than 8 bytes (64 bits)
  // Serialize number to 8-byte array (64-bits) (big-endian)


  const indexBytes = new bn_js_1.BN(share.index).toArrayLike(Buffer, "be", byteCount);
  const bignumberBytes = share.value.toArrayLike(Buffer, "be", byteCount);
  const bytes = Buffer.concat([indexBytes, bignumberBytes]);
  return new encodedData_1.EncodedData(darknodeKey.encrypt(bytes, "buffer"), encodedData_1.Encodings.BUFFER);
}

exports.encryptForDarknode = encryptForDarknode;
/*
 * Retrieve all the darknodes registered in the current epoch.
 * The getDarknodes() function will always return an array of {count} with empty
 * values being the NULL address. These addresses must be filtered out.
 * When the {start} value is not the NULL address, it is always returned as the
 * first entry so it should not be re-added to the list of all darknodes.
 */

async function getAllDarknodes(darknodeRegistryContract) {
  const batchSize = 10;
  const allDarknodes = [];
  let lastDarknode = NULL;

  do {
    const darknodes = await darknodeRegistryContract.getDarknodes(lastDarknode, batchSize);
    allDarknodes.push(...darknodes.filter(addr => addr !== NULL && addr !== lastDarknode));
    [lastDarknode] = darknodes.slice(-1);
  } while (lastDarknode !== NULL);

  return allDarknodes;
}
/*
 * Calculate pod arrangement based on current epoch
 */


async function getPods(web3, darknodeRegistryContract, simpleConsole) {
  const darknodes = await getAllDarknodes(darknodeRegistryContract);
  const minimumPodSize = new bn_js_1.BN((await darknodeRegistryContract.minimumPodSize())).toNumber();
  simpleConsole.log(`Using minimum pod size ${minimumPodSize}`);
  const epoch = await darknodeRegistryContract.currentEpoch();

  if (!darknodes.length) {
    return Promise.reject(new Error("no darknodes in contract"));
  }

  if (minimumPodSize === 0) {
    return Promise.reject(new Error("invalid minimum pod size (0)"));
  }

  const epochVal = new bn_js_1.BN(epoch[0]);
  const numberOfDarknodes = new bn_js_1.BN(darknodes.length);
  let x = epochVal.mod(numberOfDarknodes);
  let positionInOcean = immutable_1.List();

  for (let i = 0; i < darknodes.length; i++) {
    positionInOcean = positionInOcean.set(i, -1);
  }

  simpleConsole.log(`Calculating pods`);
  let pods = immutable_1.List(); // FIXME: (setting to 1 if 0)

  const numberOfPods = Math.floor(darknodes.length / minimumPodSize) || 1;

  for (let i = 0; i < numberOfPods; i++) {
    pods = pods.push(new Pod());
  }

  for (let i = 0; i < darknodes.length; i++) {
    while (positionInOcean.get(x.toNumber()) !== -1) {
      x = x.add(new bn_js_1.BN(1));
      x = x.mod(numberOfDarknodes);
    }

    positionInOcean = positionInOcean.set(x.toNumber(), i);
    const podIndex = i % numberOfPods;
    const pod = new Pod({
      darknodes: pods.get(podIndex, new Pod()).darknodes.push(darknodes[x.toNumber()])
    });
    pods = pods.set(podIndex, pod);
    x = x.add(epochVal);
    x = x.mod(numberOfDarknodes);
  }

  for (let i = 0; i < pods.size; i++) {
    let hashData = immutable_1.List();

    for (const darknode of pods.get(i, new Pod()).darknodes.toArray()) {
      hashData = hashData.push(Buffer.from(darknode.substring(2), "hex"));
    }

    const id = new encodedData_1.EncodedData(web3.utils.keccak256(`0x${Buffer.concat(hashData.toArray()).toString("hex")}`), encodedData_1.Encodings.HEX);
    const pod = new Pod({
      id: id.toBase64(),
      darknodes: pods.get(i, new Pod()).darknodes
    }); // console.log(pod.id, JSON.stringify(pod.darknodes.map((node: string) =>
    //     new EncodedData("0x1B20" + node.slice(2), Encodings.HEX).toBase58()
    // ).toArray()));

    pods = pods.set(i, pod);
  }

  return pods;
}

/***/ }),

/***/ "./src/lib/market.ts":
/*!***************************!*\
  !*** ./src/lib/market.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const immutable_1 = __webpack_require__(/*! immutable */ "immutable");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

exports.MarketPairs = immutable_1.OrderedMap() // RenExAtomic:
.set(types_1.MarketPair.ETH_BTC, {
  symbol: types_1.MarketPair.ETH_BTC,
  orderSettlement: types_1.OrderSettlement.RenExAtomic,
  quote: types_1.Token.BTC,
  base: types_1.Token.ETH
}) // RenEx:
.set(types_1.MarketPair.DGX_ETH, {
  symbol: types_1.MarketPair.DGX_ETH,
  orderSettlement: types_1.OrderSettlement.RenEx,
  quote: types_1.Token.ETH,
  base: types_1.Token.DGX
}).set(types_1.MarketPair.TUSD_ETH, {
  symbol: types_1.MarketPair.TUSD_ETH,
  orderSettlement: types_1.OrderSettlement.RenEx,
  quote: types_1.Token.ETH,
  base: types_1.Token.TUSD
}).set(types_1.MarketPair.REN_ETH, {
  symbol: types_1.MarketPair.REN_ETH,
  orderSettlement: types_1.OrderSettlement.RenEx,
  quote: types_1.Token.ETH,
  base: types_1.Token.REN
}).set(types_1.MarketPair.ZRX_ETH, {
  symbol: types_1.MarketPair.ZRX_ETH,
  orderSettlement: types_1.OrderSettlement.RenEx,
  quote: types_1.Token.ETH,
  base: types_1.Token.ZRX
}).set(types_1.MarketPair.OMG_ETH, {
  symbol: types_1.MarketPair.OMG_ETH,
  orderSettlement: types_1.OrderSettlement.RenEx,
  quote: types_1.Token.ETH,
  base: types_1.Token.OMG
});

async function fetchMarkets(sdk) {
  return Promise.resolve(exports.MarketPairs.valueSeq().toArray());
}

exports.fetchMarkets = fetchMarkets;

/***/ }),

/***/ "./src/lib/network.ts":
/*!****************************!*\
  !*** ./src/lib/network.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const mainnet = __importStar(__webpack_require__(/*! ./networks/mainnet.json */ "./src/lib/networks/mainnet.json"));

const testnet = __importStar(__webpack_require__(/*! ./networks/testnet.json */ "./src/lib/networks/testnet.json"));

exports.networks = {
  mainnet: mainnet,
  testnet: testnet
};

/***/ }),

/***/ "./src/lib/networks/mainnet.json":
/*!***************************************!*\
  !*** ./src/lib/networks/mainnet.json ***!
  \***************************************/
/*! exports provided: network, ingress, infura, etherscan, ethNetwork, ethNetworkLabel, ledgerNetworkId, contracts, tokens, default */
/***/ (function(module) {

module.exports = {"network":"mainnet","ingress":"https://renex-ingress-mainnet.herokuapp.com","infura":"https://mainnet.infura.io","etherscan":"https://etherscan.io","ethNetwork":"main","ethNetworkLabel":"Main","ledgerNetworkId":42,"contracts":[{"darknodeRegistry":"0x3799006a87FDE3CCFC7666B3E6553B03ED341c2F","orderbook":"0x6b8bB175c092DE7d81860B18DB360B734A2598e0","renExTokens":"0x7cAde4fbc8761817bb62A080733D1B6CaD744ec4","renExBalances":"0x5eC18B477B20aF940807B5478dB5A64Cd4a77EFd","renExSettlement":"0x908262dE0366E42d029B0518D5276762c92B21e1","wyre":"0x9f2a7b5E6280727cd6c8486f5F96E5f76164F2DF"}],"tokens":{"TUSD":"0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E","DGX":"0x4f3AfEC4E5a3F2A6a1A411DEF7D7dFe50eE057bF","REN":"0x408e41876cCCDC0F92210600ef50372656052a38","OMG":"0xd26114cd6EE289AccF82350c8d8487fedB8A0C07","ZRX":"0xE41d2489571d322189246DaFA5ebDe1F4699F498"}};

/***/ }),

/***/ "./src/lib/networks/testnet.json":
/*!***************************************!*\
  !*** ./src/lib/networks/testnet.json ***!
  \***************************************/
/*! exports provided: network, ingress, infura, etherscan, ethNetwork, ethNetworkLabel, ledgerNetworkId, contracts, tokens, default */
/***/ (function(module) {

module.exports = {"network":"testnet","ingress":"https://renex-ingress-testnet.herokuapp.com","infura":"https://kovan.infura.io","etherscan":"https://kovan.etherscan.io","ethNetwork":"kovan","ethNetworkLabel":"Kovan","ledgerNetworkId":42,"contracts":[{"darknodeRegistry":"0x75Fa8349fc9C7C640A4e9F1A1496fBB95D2Dc3d5","orderbook":"0xA9b453FC64b4766Aab8a867801d0a4eA7b1474E0","renExTokens":"0x481b39E2000a117CBA417473DC1E7cdAf4EAd98F","renExBalances":"0xb0E21B869D6f741a8A8F5075BA59E496593B881A","renExSettlement":"0x65A699E555cf93e4e115FfC2DE2F41d5A21DF3Fb","wyre":"0xB14fA2276D8bD26713A6D98871b2d63Da9eefE6f"}],"tokens":{"TUSD":"0x525389752ffe6487d33EF53FBcD4E5D3AD7937a0","DGX":"0x932F4580B261e9781A6c3c102133C8fDd4503DFc","REN":"0x2CD647668494c1B15743AB283A0f980d90a87394","OMG":"0x66497ba75dD127b46316d806c077B06395918064","ZRX":"0x6EB628dCeFA95802899aD3A9EE0C7650Ac63d543"}};

/***/ }),

/***/ "./src/lib/order.ts":
/*!**************************!*\
  !*** ./src/lib/order.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const index_1 = __webpack_require__(/*! ../index */ "./src/index.ts");

const errors_1 = __webpack_require__(/*! ./errors */ "./src/lib/errors.ts");

const record_1 = __webpack_require__(/*! ./record */ "./src/lib/record.ts");

class CoExp extends record_1.Record({
  co: 0,
  exp: 0
}) {}

exports.CoExp = CoExp;

function priceToCoExp(price) {
  const priceF = new bignumber_js_1.default(price.toString()).div(new bignumber_js_1.default("1e12"));
  return priceFloatToCoExp(priceF);
}

exports.priceToCoExp = priceToCoExp;

function volumeToCoExp(volume) {
  const volumeF = new bignumber_js_1.default(volume.toString()).div(new bignumber_js_1.default("1e12"));
  return volumeFloatToCoExp(volumeF);
}

exports.volumeToCoExp = volumeToCoExp;

function priceFloatToCoExp(price) {
  if (price.gte(10.0)) {
    const prev = priceFloatToCoExp(price.div(10));
    return new CoExp({
      co: prev.co,
      exp: prev.exp + 1
    });
  } else if (price.gte(1)) {
    const _try = price.div(0.005).integerValue(bignumber_js_1.default.ROUND_FLOOR);

    return new CoExp({
      co: _try.toNumber(),
      exp: 38
    });
  } else if (price.gt(0)) {
    const prev = priceFloatToCoExp(price.times(10));
    return new CoExp({
      co: prev.co,
      exp: prev.exp - 1
    });
  } else {
    return new CoExp({
      co: 0,
      exp: 0
    });
  }
}

exports.priceFloatToCoExp = priceFloatToCoExp;

function volumeFloatToCoExp(volume) {
  if (volume.gte(10)) {
    const prev = volumeFloatToCoExp(volume.div(10));
    return new CoExp({
      co: prev.co,
      exp: prev.exp + 1
    });
  } else if (volume.gte(1)) {
    const _try = volume.div(0.2).integerValue(bignumber_js_1.default.ROUND_FLOOR);

    return new CoExp({
      co: _try.toNumber(),
      exp: 12
    });
  } else if (volume.gt(0)) {
    const prev = volumeFloatToCoExp(volume.times(10));
    return new CoExp({
      co: prev.co,
      exp: prev.exp - 1
    });
  }

  return new CoExp({
    co: 0,
    exp: 0
  });
}

exports.volumeFloatToCoExp = volumeFloatToCoExp;
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

function orderbookStateToOrderStatus(state) {
  switch (state) {
    case 0:
      return index_1.OrderStatus.NOT_SUBMITTED;

    case 1:
      return index_1.OrderStatus.OPEN;

    case 2:
      return index_1.OrderStatus.CONFIRMED;

    case 3:
      return index_1.OrderStatus.CANCELED;

    default:
      throw new Error(`${errors_1.ErrUnknownOrderStatus}: ${state}`);
  }
}

exports.orderbookStateToOrderStatus = orderbookStateToOrderStatus;
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

function settlementStatusToOrderStatus(status) {
  switch (status) {
    case 0:
      return index_1.OrderStatus.CONFIRMED;

    case 1:
      return index_1.OrderStatus.CONFIRMED;

    case 2:
      return index_1.OrderStatus.SETTLED;

    case 3:
      return index_1.OrderStatus.SLASHED;

    default:
      throw new Error(`${errors_1.ErrUnknownOrderStatus}: ${status}`);
  }
}

exports.settlementStatusToOrderStatus = settlementStatusToOrderStatus;

/***/ }),

/***/ "./src/lib/record.ts":
/*!***************************!*\
  !*** ./src/lib/record.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
 // tslint:disable:no-any

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const Immutable = __importStar(__webpack_require__(/*! immutable */ "immutable"));
/**
 * Create a new class that can be instantiated. All instances of the class
 * will be immutable, and will be guaranteed to have all properties of the
 * interface T. Default values for these properties can be specified. Using
 * the getter and setter methods are type safe.
 *
 * @param data An object defining the default value for instances of the
 *             class that will be returned.
 *
 * @return A class that can be used to instantiate immutable objects.
 */


function Record(data) {
  // The returned class inherits from the Immutable.Record class, using the
  // data argument to specify the default property values.
  return class extends Immutable.Record(data) {
    constructor(inner) {
      super(Immutable.fromJS(inner || {}));
    }
    /**
     * A type safe getter.
     *
     * @param key The name of the property to get. It must be a property that
     *            exists in T.
     *
     * @return The value associated with the property.
     */


    get(key) {
      return super.get(key);
    }
    /**
     * A type safe setter.
     *
     * @param key The name of the property to set. It must be a property that
     *            exists in T.
     *
     * @return A new instance that has all of the property values of the
     *         original instance, except for the property value that was set.
     */


    set(key, value) {
      return super.set(key, value);
    }
    /**
     * A type safe merge.
     *
     * @param inner An object of properties, and associated values, that will
     *              be set.
     *
     * @return A new instance that has all of the property values of the
     *         original instance, except for the property values that were
     *         merged.
     */


    merge(inner) {
      return super.merge(inner);
    }

    toJS() {
      return super.toJS();
    }

  };
}

exports.Record = Record;

/***/ }),

/***/ "./src/lib/shamir.ts":
/*!***************************!*\
  !*** ./src/lib/shamir.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const crypto = __importStar(__webpack_require__(/*! crypto */ "crypto"));

const immutable_1 = __webpack_require__(/*! immutable */ "immutable");

exports.PRIME = new bn_js_1.BN("17012364981921935471");

class Share {
  constructor(index, value) {
    this.index = index;
    this.value = value;
  }

}

exports.Share = Share;
/**
 * Split a secret into shares using the finite field defined by the PRIME
 * constant. The secret must be less than, or equal to, the PRIME constant.
 * @param {number} n The number of shares that the secret will be split into.
 * @param {number} k The number of shares required to reconstruct the secret.
 * @param {BN} secret The secret number that will be split into shares.
 * @returns {List<Share>} An immutable list of shares.
 */

function split(n, k, secret) {
  if (n < k) {
    throw new Error(`n-k error: n = ${n}, k = ${k}`);
  }

  if (exports.PRIME.lte(secret)) {
    throw new Error("finite field error: secret is too big");
  }

  const coefficients = new Array(k);
  coefficients[0] = secret;

  for (let i = 1; i < k; i++) {
    let coefficient = new bn_js_1.BN(0);
    const words = new Int32Array(2);

    do {
      const bytes = crypto.randomBytes(words.length);
      words.set(bytes);
      coefficient = new bn_js_1.BN(Math.abs(words[0])).pow(new bn_js_1.BN(2)).add(new bn_js_1.BN(Math.abs(words[1])));
    } while (coefficient.gte(exports.PRIME));

    coefficients[i] = coefficient;
  }

  const shares = new Array(k);

  for (let x = 1; x <= n; x++) {
    let accumulator = coefficients[0];
    const base = new bn_js_1.BN(x);
    let exp = base.mod(exports.PRIME);

    for (let j = 1; j < coefficients.length; j++) {
      const co = coefficients[j].mul(exp).mod(exports.PRIME);
      accumulator = accumulator.add(co).mod(exports.PRIME);
      exp = exp.mul(base).mod(exports.PRIME);
    }

    shares[x - 1] = new Share(x, accumulator);
  }

  const shareList = immutable_1.List(shares);
  return shareList;
}

exports.split = split;
/**
 * Join shares into a secret using the finite field defined by the PRIME
 * constant. This function cannot determine the minimum number of shares
 * required.
 * @param {List<Share>} shares An immutable list of shares that will be used to
 *        reconstruct the secret.
 * @returns {BN} The reconstructed secret, or meaningless garbage when an
 *          insufficient number of shares is provided.
 */

function join(shares) {
  let secret = new bn_js_1.BN(0);

  for (let i = 0; i < shares.size; i++) {
    let num = new bn_js_1.BN(1);
    let den = new bn_js_1.BN(1);

    for (let j = 0; j < shares.size; j++) {
      if (i === j) {
        continue;
      }

      const startShare = shares.get(i);

      if (startShare === undefined) {
        throw new Error("accessing invalid share");
      }

      const start = new bn_js_1.BN(startShare.index);
      const nextShare = shares.get(j);

      if (nextShare === undefined) {
        throw new Error("accessing invalid share");
      }

      const next = new bn_js_1.BN(nextShare.index);
      const nextGen = num.mul(next).mod(exports.PRIME);
      num = exports.PRIME.sub(nextGen);
      const nextDiff = start.sub(next).mod(exports.PRIME);
      den = den.mul(nextDiff).mod(exports.PRIME);
    }

    den = den.invm(exports.PRIME);
    const share = shares.get(i);

    if (share === undefined) {
      throw new Error("accessing invalid share");
    }

    let value = share.value.mul(num).mod(exports.PRIME);
    value = value.mul(den).mod(exports.PRIME);
    secret = secret.add(value).mod(exports.PRIME);
  }

  return secret;
}

exports.join = join;

/***/ }),

/***/ "./src/lib/tokens.ts":
/*!***************************!*\
  !*** ./src/lib/tokens.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __webpack_require__(/*! bignumber.js */ "bignumber.js");

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

function toSmallestUnit(amount, tokenDetails) {
  return amount.times(new bignumber_js_1.BigNumber(10).exponentiatedBy(tokenDetails.decimals));
}

exports.toSmallestUnit = toSmallestUnit;

function fromSmallestUnit(amount, tokenDetails) {
  return amount.div(new bignumber_js_1.BigNumber(10).exponentiatedBy(tokenDetails.decimals));
}

exports.fromSmallestUnit = fromSmallestUnit;

function supportedTokens(sdk) {
  return Promise.resolve([types_1.Token.ETH, types_1.Token.DGX, types_1.Token.TUSD, types_1.Token.REN, types_1.Token.ZRX, types_1.Token.OMG]);
}

exports.supportedTokens = supportedTokens;

function tokenToID(token) {
  switch (token) {
    case types_1.Token.BTC:
      return 0;

    case types_1.Token.ETH:
      return 1;

    case types_1.Token.DGX:
      return 256;

    case types_1.Token.TUSD:
      return 257;

    case types_1.Token.REN:
      return 65536;

    case types_1.Token.ZRX:
      return 65537;

    case types_1.Token.OMG:
      return 65538;
  }

  throw new Error(`Invalid token: ${token}`);
}

exports.tokenToID = tokenToID;

function idToToken(token) {
  switch (token) {
    case 0:
      return types_1.Token.BTC;

    case 1:
      return types_1.Token.ETH;

    case 256:
      return types_1.Token.DGX;

    case 257:
      return types_1.Token.TUSD;

    case 65536:
      return types_1.Token.REN;

    case 65537:
      return types_1.Token.ZRX;

    case 65538:
      return types_1.Token.OMG;
  }

  throw new Error(`Invalid token ID: ${token}`);
}

exports.idToToken = idToToken;
/**
 * Combine two 32-bit token identifiers into a single 64-bit number.
 *
 * @param {number} leftToken 32-bit token identifier.
 * @param {number} rightToken 32-bit token identifier.
 * @returns {BN} 64-bit market identifier.
 */

function generateTokenPairing(leftToken, rightToken) {
  // Convert individual tokens to 32 bit numbers
  const leftTokenBuffer = new bn_js_1.BN(leftToken).toArrayLike(Buffer, "be", 4);
  const rightTokenBuffer = new bn_js_1.BN(rightToken).toArrayLike(Buffer, "be", 4); // Return the token pair as a 64 bit number

  return new bn_js_1.BN(Buffer.concat([leftTokenBuffer, rightTokenBuffer]));
}

exports.generateTokenPairing = generateTokenPairing;
/**
 * Split a 64-bit number into two 32-bit token identifiers.
 *
 * @param {BN} pair The 64-bit token pair.
 * @returns {[number, number]} Two 32-bit token identifiers.
 */

function splitTokenPairing(pair) {
  const buffer = pair.toArrayLike(Buffer, "be", 8);
  const fstToken = new bn_js_1.BN(buffer.slice(0, 4)).toNumber();
  const sndToken = new bn_js_1.BN(buffer.slice(4, 8)).toNumber();
  return [fstToken, sndToken];
}

exports.splitTokenPairing = splitTokenPairing;

/***/ }),

/***/ "./src/methods/atomicMethods.ts":
/*!**************************************!*\
  !*** ./src/methods/atomicMethods.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const atomic_1 = __webpack_require__(/*! ../lib/atomic */ "./src/lib/atomic.ts");

const tokens_1 = __webpack_require__(/*! ../lib/tokens */ "./src/lib/tokens.ts");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const balancesMethods_1 = __webpack_require__(/*! ./balancesMethods */ "./src/methods/balancesMethods.ts");

const storageMethods_1 = __webpack_require__(/*! ./storageMethods */ "./src/methods/storageMethods.ts");
/* Atomic Connection */


exports.currentAtomConnectionStatus = sdk => {
  return sdk._atomConnectionStatus;
};

exports.atomConnected = sdk => {
  const status = exports.currentAtomConnectionStatus(sdk);
  return status === types_1.AtomicConnectionStatus.ConnectedLocked || status === types_1.AtomicConnectionStatus.ConnectedUnlocked;
};

exports.resetAtomConnection = async sdk => {
  sdk._atomConnectedAddress = "";
  sdk._atomConnectionStatus = types_1.AtomicConnectionStatus.NotConnected;
  return exports.refreshAtomConnectionStatus(sdk);
};

exports.refreshAtomConnectionStatus = async sdk => {
  sdk._atomConnectionStatus = await getAtomConnectionStatus(sdk);
  return sdk._atomConnectionStatus;
};

const getAtomConnectionStatus = async sdk => {
  try {
    const response = await atomic_1.challengeSwapper();
    const signerAddress = atomic_1.checkSigner(sdk.getWeb3(), response);

    if (sdk._atomConnectedAddress === "") {
      const expectedEthAddress = await atomic_1.getAtomicBalances().then(resp => resp.ethereum.address);

      if (expectedEthAddress !== signerAddress) {
        // The signer and the balances address is different
        return types_1.AtomicConnectionStatus.InvalidSwapper;
      }

      sdk._atomConnectedAddress = signerAddress;
    } else if (sdk._atomConnectedAddress !== signerAddress) {
      // A new address was used to sign swapper messages
      return types_1.AtomicConnectionStatus.ChangedSwapper;
    }

    if (sdk.getAddress()) {
      return atomic_1._connectToAtom(response, sdk._networkData.ingress, sdk.getAddress());
    }

    return types_1.AtomicConnectionStatus.NotConnected;
  } catch (err) {
    return types_1.AtomicConnectionStatus.NotConnected;
  }
};

exports.authorizeAtom = async sdk => {
  const ethAtomAddress = await exports.atomicAddresses([types_1.Token.ETH]).then(addrs => addrs[0]);
  await atomic_1._authorizeAtom(sdk.getWeb3(), sdk._networkData.ingress, ethAtomAddress, sdk.getAddress());
  return exports.refreshAtomConnectionStatus(sdk);
};
/* Atomic balances */


exports.supportedAtomicTokens = async sdk => [types_1.Token.BTC, types_1.Token.ETH];

const retrieveAtomicBalances = async (sdk, tokens) => {
  return atomic_1.getAtomicBalances().then(balances => {
    return Promise.all(tokens.map(async token => {
      const tokenDetails = await balancesMethods_1.getTokenDetails(sdk, token);
      let balance;

      switch (token) {
        case types_1.Token.ETH:
          balance = new bignumber_js_1.default(balances.ethereum.amount);
          break;

        case types_1.Token.BTC:
          balance = new bignumber_js_1.default(balances.bitcoin.amount);
          break;
      }

      if (balance) {
        return tokens_1.fromSmallestUnit(balance, tokenDetails);
      }

      return new bignumber_js_1.default(0);
    }));
  });
};

exports.atomicAddresses = tokens => {
  return atomic_1.getAtomicBalances().then(balances => {
    return tokens.map(token => {
      switch (token) {
        case types_1.Token.ETH:
          return balances.ethereum.address;

        case types_1.Token.BTC:
          return balances.bitcoin.address;
      }

      return "";
    });
  });
};

const usedAtomicBalances = async (sdk, tokens) => {
  return storageMethods_1.fetchTraderOrders(sdk).then(orders => {
    const usedFunds = new Map();
    orders.forEach(order => {
      if (order.computedOrderDetails.orderSettlement === types_1.OrderSettlement.RenExAtomic && (order.status === types_1.OrderStatus.NOT_SUBMITTED || order.status === types_1.OrderStatus.OPEN || order.status === types_1.OrderStatus.CONFIRMED)) {
        const token = order.computedOrderDetails.spendToken;
        const usedTokenBalance = usedFunds.get(token);

        if (usedTokenBalance) {
          usedFunds.set(token, usedTokenBalance.plus(order.computedOrderDetails.spendVolume));
        } else {
          usedFunds.set(token, order.computedOrderDetails.spendVolume);
        }
      }
    });
    return tokens.map(token => usedFunds.get(token) || new bignumber_js_1.default(0));
  });
};

exports.atomicBalances = async (sdk, tokens) => {
  return Promise.all([retrieveAtomicBalances(sdk, tokens), usedAtomicBalances(sdk, tokens)]).then(([startingBalance, usedBalance]) => {
    let atomicBalance = new Map();
    tokens.forEach((token, index) => {
      atomicBalance = atomicBalance.set(token, {
        used: usedBalance[index],
        free: bignumber_js_1.default.max(new bignumber_js_1.default(0), startingBalance[index].minus(usedBalance[index]))
      });
    });
    return atomicBalance;
  });
};

/***/ }),

/***/ "./src/methods/balanceActionMethods.ts":
/*!*********************************************!*\
  !*** ./src/methods/balanceActionMethods.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const contracts_1 = __webpack_require__(/*! ../contracts/contracts */ "./src/contracts/contracts.ts");

const errors_1 = __webpack_require__(/*! ../lib/errors */ "./src/lib/errors.ts");

const ingress_1 = __webpack_require__(/*! ../lib/ingress */ "./src/lib/ingress.ts");

const tokens_1 = __webpack_require__(/*! ../lib/tokens */ "./src/lib/tokens.ts");

const balancesMethods_1 = __webpack_require__(/*! ./balancesMethods */ "./src/methods/balancesMethods.ts");

const generalMethods_1 = __webpack_require__(/*! ./generalMethods */ "./src/methods/generalMethods.ts");

const storageMethods_1 = __webpack_require__(/*! ./storageMethods */ "./src/methods/storageMethods.ts");

const tokenIsEthereum = token => {
  const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  return token.address.toLowerCase() === ETH_ADDR.toLowerCase();
};

exports.updateBalanceActionStatus = async (sdk, txHash) => {
  const balanceActionStatus = await generalMethods_1.getTransactionStatus(sdk, txHash); // Update local storage (without awaiting)

  sdk._storage.getBalanceAction(txHash).then(async balanceAction => {
    if (balanceAction) {
      balanceAction.status = balanceActionStatus;
      await sdk._storage.setBalanceAction(balanceAction);
    }
  }).catch(console.error);

  return balanceActionStatus;
};

exports.updateAllBalanceActionStatuses = async (sdk, balanceActions) => {
  const newStatuses = new Map();

  if (!balanceActions) {
    balanceActions = await storageMethods_1.fetchBalanceActions(sdk);
  }

  await Promise.all(balanceActions.map(async action => {
    if (action.status === types_1.TransactionStatus.Pending) {
      const newStatus = await exports.updateBalanceActionStatus(sdk, action.txHash);

      if (newStatus !== action.status) {
        newStatuses.set(action.txHash, newStatus);
      }
    }
  }));
  return newStatuses;
}; // tslint:disable-next-line:no-any


exports.onTxHash = tx => {
  return new Promise((resolve, reject) => {
    tx.once("transactionHash", txHash => resolve({
      txHash,
      promiEvent: tx
    })).catch(reject);
  });
};

exports.deposit = async (sdk, value, token) => {
  value = new bignumber_js_1.default(value); // Check that we can deposit that amount

  const tokenBalance = await balancesMethods_1.balances(sdk, [token]).then(b => b.get(token));

  if (tokenBalance && value.gt(tokenBalance.nondeposited)) {
    throw new Error(errors_1.ErrInsufficientBalance);
  }

  const address = sdk.getAddress();
  const tokenDetails = await balancesMethods_1.getTokenDetails(sdk, token);
  const gasPrice = await generalMethods_1.getGasPrice(sdk);
  const valueBN = new bn_js_1.BN(tokens_1.toSmallestUnit(value, tokenDetails).toFixed());
  const balanceAction = {
    action: types_1.BalanceActionType.Deposit,
    amount: value,
    time: Math.floor(new Date().getTime() / 1000),
    status: types_1.TransactionStatus.Pending,
    token,
    trader: address,
    txHash: "",
    nonce: undefined
  };

  try {
    if (tokenIsEthereum(tokenDetails)) {
      const {
        txHash,
        promiEvent
      } = await exports.onTxHash(sdk._contracts.renExBalances.deposit(tokenDetails.address, valueBN, {
        value: valueBN.toString(),
        from: address,
        gasPrice
      })); // We set the nonce after the transaction is created. We don't set
      // it before hand in case the user signs other transactions while
      // the wallet popup (or equivalent) is open. We rely on the wallet's
      // nonce tracking to return the correct nonce immediately.

      try {
        balanceAction.nonce = (await sdk.getWeb3().eth.getTransactionCount(address, "pending")) - 1;
      } catch (err) {
        // Log the error but leave the nonce as undefined
        console.error(err);
      }

      balanceAction.txHash = txHash;

      sdk._storage.setBalanceAction(balanceAction).catch(console.error);

      return {
        balanceAction,
        promiEvent
      };
    } else {
      // ERC20 token
      let tokenContract = sdk._contracts.erc20.get(token);

      if (tokenContract === undefined) {
        tokenContract = new (contracts_1.withProvider(sdk.getWeb3().currentProvider, contracts_1.ERC20))(tokenDetails.address);

        sdk._contracts.erc20.set(token, tokenContract);
      } // If allowance is less than amount, user must first approve
      // TODO: This may cause the transaction to fail if the user call this
      // twice in a row rapidly (after already having an allowance set)
      // There's no way to check pending state - alternative is to see
      // if there are any pending deposits for the same token


      const allowance = new bn_js_1.BN((await tokenContract.allowance(address, sdk._contracts.renExBalances.address, {
        from: address,
        gasPrice
      })));

      if (allowance.lt(valueBN)) {
        await exports.onTxHash(tokenContract.approve(sdk._contracts.renExBalances.address, valueBN, {
          from: address,
          gasPrice
        }));
      }

      const {
        txHash,
        promiEvent
      } = await exports.onTxHash(sdk._contracts.renExBalances.deposit(tokenDetails.address, valueBN, {
        // Manually set gas limit since gas estimation won't work
        // if the ethereum node hasn't seen the previous transaction
        gas: token === types_1.Token.DGX ? 500000 : 150000,
        gasPrice,
        from: address
      }));
      balanceAction.txHash = txHash; // We set the nonce after the transaction is created. We don't set
      // it before hand in case the user signs other transactions while
      // the wallet popup (or equivalent) is open. We rely on the wallet's
      // nonce tracking to return the correct nonce immediately.

      try {
        balanceAction.nonce = (await sdk.getWeb3().eth.getTransactionCount(address, "pending")) - 1;
      } catch (err) {
        // Log the error but leave the nonce as undefined
        console.error(err);
      }

      sdk._storage.setBalanceAction(balanceAction).catch(console.error);

      return {
        balanceAction,
        promiEvent
      }; // TODO: https://github.com/MetaMask/metamask-extension/issues/3425
    }
  } catch (error) {
    if (error.tx) {
      balanceAction.txHash = error.tx;

      sdk._storage.setBalanceAction(balanceAction).catch(console.error);

      return {
        balanceAction,
        promiEvent: null
      };
    }

    if (error.message.match("Insufficient funds")) {
      throw new Error(errors_1.ErrInsufficientFunds);
    }

    if (error.message.match("User denied transaction signature")) {
      throw new Error(errors_1.ErrCanceledByUser);
    }

    throw error;
  }
};

exports.withdraw = async (sdk, value, token, withoutIngressSignature) => {
  value = new bignumber_js_1.default(value); // Trustless withdrawals are not implemented yet

  if (withoutIngressSignature === true) {
    throw new Error(errors_1.ErrUnimplemented);
  } // Check the balance before withdrawal attempt


  const tokenBalance = await balancesMethods_1.balances(sdk, [token]).then(b => b.get(token));

  if (tokenBalance && value.gt(tokenBalance.free)) {
    throw new Error(errors_1.ErrInsufficientBalance);
  }

  const address = sdk.getAddress();
  const tokenDetails = await balancesMethods_1.getTokenDetails(sdk, token);
  const gasPrice = await generalMethods_1.getGasPrice(sdk);
  const valueBN = new bn_js_1.BN(tokens_1.toSmallestUnit(value, tokenDetails).toFixed());
  const balanceAction = {
    action: types_1.BalanceActionType.Withdraw,
    amount: value,
    time: Math.floor(new Date().getTime() / 1000),
    status: types_1.TransactionStatus.Pending,
    token,
    trader: address,
    txHash: "",
    nonce: undefined
  };

  try {
    const signature = await ingress_1.requestWithdrawalSignature(sdk._networkData.ingress, address, token);
    const {
      txHash,
      promiEvent
    } = await exports.onTxHash(sdk._contracts.renExBalances.withdraw(tokenDetails.address, valueBN, signature.toHex(), {
      from: address,
      gasPrice
    })); // Update balance action

    balanceAction.txHash = txHash; // We set the nonce after the transaction is created. We don't set
    // it before hand in case the user signs other transactions while
    // the wallet popup (or equivalent) is open. We rely on the wallet's
    // nonce tracking to return the correct nonce immediately.

    try {
      balanceAction.nonce = (await sdk.getWeb3().eth.getTransactionCount(address, "pending")) - 1;
    } catch (err) {
      // Log the error but leave the nonce as undefined
      console.error(err);
    }

    sdk._storage.setBalanceAction(balanceAction).catch(console.error);

    return {
      balanceAction,
      promiEvent
    };
  } catch (error) {
    if (error.tx) {
      balanceAction.txHash = error.tx;

      sdk._storage.setBalanceAction(balanceAction).catch(console.error);

      return {
        balanceAction,
        promiEvent: null
      };
    }

    if (error.message.match("Insufficient funds")) {
      throw new Error(errors_1.ErrInsufficientFunds);
    }

    if (error.message.match("User denied transaction signature")) {
      throw new Error(errors_1.ErrCanceledByUser);
    }

    throw error;
  }
};

/***/ }),

/***/ "./src/methods/balancesMethods.ts":
/*!****************************************!*\
  !*** ./src/methods/balancesMethods.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const contracts_1 = __webpack_require__(/*! ../contracts/contracts */ "./src/contracts/contracts.ts");

const tokens_1 = __webpack_require__(/*! ../lib/tokens */ "./src/lib/tokens.ts");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const storageMethods_1 = __webpack_require__(/*! ./storageMethods */ "./src/methods/storageMethods.ts");

exports.getTokenDetails = async (sdk, token) => {
  let detailsFromContract = await sdk._cachedTokenDetails.get(token);

  if (!detailsFromContract) {
    const detailsPromise = sdk._contracts.renExTokens.tokens(tokens_1.tokenToID(token));

    sdk._cachedTokenDetails.set(token, detailsPromise);

    detailsFromContract = await detailsPromise;
  }

  const details = {
    address: detailsFromContract.addr,
    decimals: new bignumber_js_1.default(detailsFromContract.decimals).toNumber(),
    registered: detailsFromContract.registered
  };
  return details;
};

const nondepositedBalance = async (sdk, token) => {
  const details = await exports.getTokenDetails(sdk, token);
  let balance = new bignumber_js_1.default(0);

  if (token === types_1.Token.ETH) {
    balance = new bignumber_js_1.default((await sdk.getWeb3().eth.getBalance(sdk.getAddress())));
  } else {
    let tokenContract = sdk._contracts.erc20.get(token);

    if (!tokenContract) {
      tokenContract = new (contracts_1.withProvider(sdk.getWeb3().currentProvider, contracts_1.ERC20))(details.address);

      sdk._contracts.erc20.set(token, tokenContract);
    }

    balance = new bignumber_js_1.default((await tokenContract.balanceOf(sdk.getAddress())));
  }

  return tokens_1.fromSmallestUnit(balance, details);
};

const nondepositedBalances = (sdk, tokens) => {
  // Loop through all tokens, returning 0 for any that throw an error
  return Promise.all(tokens.map(async token => {
    try {
      return await nondepositedBalance(sdk, token);
    } catch (err) {
      console.error(`Unable to retrieve non-deposited balance for token #${token}. ${err}`);
      return new bignumber_js_1.default(0);
    }
  }));
};

const totalBalance = async (sdk, token) => {
  const details = await exports.getTokenDetails(sdk, token);
  const balance = new bignumber_js_1.default((await sdk._contracts.renExBalances.traderBalances(sdk.getAddress(), details.address)));
  return tokens_1.fromSmallestUnit(balance, details);
};

const totalBalances = (sdk, tokens) => {
  // Loop through all tokens, returning 0 for any that throw an error
  return Promise.all(tokens.map(async token => {
    try {
      return totalBalance(sdk, token);
    } catch (err) {
      return new bignumber_js_1.default(0);
    }
  }));
};

const lockedBalances = async (sdk, tokens) => {
  // Add balances from orders that are open or not settled
  const usedOrderBalancesPromise = storageMethods_1.fetchTraderOrders(sdk).then(orders => {
    const usedFunds = new Map();
    orders.forEach(order => {
      if (order.status === types_1.OrderStatus.NOT_SUBMITTED || order.status === types_1.OrderStatus.OPEN || order.status === types_1.OrderStatus.CONFIRMED) {
        if (order.computedOrderDetails.orderSettlement === types_1.OrderSettlement.RenEx) {
          const token = order.computedOrderDetails.spendToken;
          const usedTokenBalance = usedFunds.get(token);

          if (usedTokenBalance) {
            usedFunds.set(token, usedTokenBalance.plus(order.computedOrderDetails.spendVolume));
          } else {
            usedFunds.set(token, order.computedOrderDetails.spendVolume);
          }
        } else {
          // Include atomic swap fees in usable balance calculation
          const token = order.computedOrderDetails.feeToken;
          const feeTokenBalance = usedFunds.get(token);

          if (feeTokenBalance) {
            usedFunds.set(token, feeTokenBalance.plus(order.computedOrderDetails.feeAmount));
          } else {
            usedFunds.set(token, order.computedOrderDetails.feeAmount);
          }
        }
      }
    });
    return usedFunds;
  }); // Add balances from pending withdrawals

  const pendingBalancesPromise = storageMethods_1.fetchBalanceActions(sdk).then(balanceActions => {
    const pendingFunds = new Map();
    balanceActions.forEach(action => {
      if (action.action === types_1.BalanceActionType.Withdraw && action.status === types_1.TransactionStatus.Pending) {
        const pendingTokenFunds = pendingFunds.get(action.token);

        if (pendingTokenFunds) {
          pendingFunds.set(action.token, pendingTokenFunds.plus(action.amount));
        } else {
          pendingFunds.set(action.token, action.amount);
        }
      }
    });
    return pendingFunds;
  });
  const [usedOrderBalances, pendingBalances] = await Promise.all([usedOrderBalancesPromise, pendingBalancesPromise]);
  return tokens.map(token => {
    const usedOrderBalance = usedOrderBalances.get(token) || new bignumber_js_1.default(0);
    const pendingBalance = pendingBalances.get(token) || new bignumber_js_1.default(0);
    return usedOrderBalance.plus(pendingBalance);
  });
};

exports.balances = async (sdk, tokens) => {
  return Promise.all([totalBalances(sdk, tokens), lockedBalances(sdk, tokens), nondepositedBalances(sdk, tokens)]).then(([total, locked, nondeposited]) => {
    const balanceDetails = new Map();
    tokens.forEach((token, index) => {
      const tokenBalance = total[index];
      const tokenLocked = locked[index];
      let usable = tokenBalance.minus(tokenLocked); // If usable balance is less than zero, set to 0

      if (usable.lt(new bignumber_js_1.default(0))) {
        usable = new bignumber_js_1.default(0);
      }

      balanceDetails.set(token, {
        free: usable,
        used: tokenLocked,
        nondeposited: nondeposited[index]
      });
    });
    return balanceDetails;
  });
};

/***/ }),

/***/ "./src/methods/generalMethods.ts":
/*!***************************************!*\
  !*** ./src/methods/generalMethods.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const index_1 = __webpack_require__(/*! ../index */ "./src/index.ts");

const contracts_1 = __webpack_require__(/*! ../contracts/contracts */ "./src/contracts/contracts.ts");

const tokens_1 = __webpack_require__(/*! ../lib/tokens */ "./src/lib/tokens.ts");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const balancesMethods_1 = __webpack_require__(/*! ./balancesMethods */ "./src/methods/balancesMethods.ts");

exports.transfer = async (sdk, addr, token, valueBig) => {
  const gasPrice = await exports.getGasPrice(sdk);
  const tokenDetails = await balancesMethods_1.getTokenDetails(sdk, token);
  const value = tokens_1.toSmallestUnit(new bignumber_js_1.default(valueBig), tokenDetails).toString();

  if (token === types_1.Token.ETH) {
    sdk.getWeb3().eth.sendTransaction({
      from: sdk.getAddress(),
      to: addr,
      value,
      gasPrice
    });
  } else {
    let tokenContract = sdk._contracts.erc20.get(token);

    if (!tokenContract) {
      tokenContract = new (contracts_1.withProvider(sdk.getWeb3().currentProvider, contracts_1.ERC20))(tokenDetails.address);

      sdk._contracts.erc20.set(token, tokenContract);
    }

    await tokenContract.transfer(addr, value);
  }
};

exports.getGasPrice = async sdk => {
  const maxGasPrice = 60000000000;

  try {
    const resp = await axios_1.default.get("https://ethgasstation.info/json/ethgasAPI.json");

    if (resp.data.fast) {
      const gasPrice = resp.data.fast * Math.pow(10, 8);
      return gasPrice > maxGasPrice ? maxGasPrice : gasPrice;
    }

    throw new Error("cannot retrieve gas price from ethgasstation");
  } catch (error) {
    // TODO: Add error logging
    try {
      return (await sdk.getWeb3().eth.getGasPrice()) * 1.1;
    } catch (error) {
      // TODO: Add error logging
      return undefined;
    }
  }
};
/**
 * Returns the status of a transaction from its transaction hash.
 *
 * @param {RenExSDK} sdk
 * @param {string} txHash
 * @returns {Promise<TransactionStatus>} One of "pending", "confirmed",
 *          "failed", or "replaced"
 */


exports.getTransactionStatus = async (sdk, txHash) => {
  let receipt = await sdk.getWeb3().eth.getTransactionReceipt(txHash); // If the transaction hasn't been confirmed yet, it will either have a null
  // receipt, or it will have an empty blockhash.

  if (!receipt) {
    // If the receipt doesn't have a blockHash, check if its nonce is lower
    // than the trader's current nonce. This implies that the transaction
    // has been overwritten.
    // Get the current trader's nonce
    const traderNonce = await sdk.getWeb3().eth.getTransactionCount(sdk.getAddress()); // Get transaction's nonce

    let transaction;

    try {
      transaction = await sdk._storage.getBalanceAction(txHash);
    } catch (err) {
      return index_1.TransactionStatus.Pending;
    }

    if (transaction === undefined || transaction.nonce === undefined) {
      return index_1.TransactionStatus.Pending;
    } // Check if the trader's nonce is higher than the transaction's nonce


    if (traderNonce > transaction.nonce) {
      // Check the transaction receipt again in case the transaction was
      // confirmed in the time between fetching the transaction and
      // getting the nonce. We could retrieve the nonce before the receipt
      // but most of the time we do not expect this scenario to happen.
      // This isn't perfect since the requests may hit different nodes.
      // One solution is to call `getTransactionStatus` again after a
      // delay if it has returned "replaced", to confirm the result.
      receipt = await sdk.getWeb3().eth.getTransactionReceipt(txHash); // Check that the transaction isn't confirmed

      if (!receipt) {
        return index_1.TransactionStatus.Replaced;
      }
    } else {
      return index_1.TransactionStatus.Pending;
    }
  }

  if (!receipt.blockHash) {
    return index_1.TransactionStatus.Pending;
  } // Status type is string, but actually returns back as a boolean
  // tslint:disable-next-line:no-any


  const receiptStatus = receipt.status;

  if (receiptStatus === "0" || receiptStatus === 0 || receiptStatus === false) {
    return index_1.TransactionStatus.Failed;
  } else {
    return index_1.TransactionStatus.Done;
  }
};

/***/ }),

/***/ "./src/methods/orderbookMethods.ts":
/*!*****************************************!*\
  !*** ./src/methods/orderbookMethods.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __webpack_require__(/*! bignumber.js */ "bignumber.js");

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const ingress = __importStar(__webpack_require__(/*! ../lib/ingress */ "./src/lib/ingress.ts"));

const atomic_1 = __webpack_require__(/*! ../lib/atomic */ "./src/lib/atomic.ts");

const conversion_1 = __webpack_require__(/*! ../lib/conversion */ "./src/lib/conversion.ts");

const encodedData_1 = __webpack_require__(/*! ../lib/encodedData */ "./src/lib/encodedData.ts");

const errors_1 = __webpack_require__(/*! ../lib/errors */ "./src/lib/errors.ts");

const market_1 = __webpack_require__(/*! ../lib/market */ "./src/lib/market.ts");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const atomicMethods_1 = __webpack_require__(/*! ./atomicMethods */ "./src/methods/atomicMethods.ts");

const balanceActionMethods_1 = __webpack_require__(/*! ./balanceActionMethods */ "./src/methods/balanceActionMethods.ts");

const balancesMethods_1 = __webpack_require__(/*! ./balancesMethods */ "./src/methods/balancesMethods.ts");

const generalMethods_1 = __webpack_require__(/*! ./generalMethods */ "./src/methods/generalMethods.ts");

const settlementMethods_1 = __webpack_require__(/*! ./settlementMethods */ "./src/methods/settlementMethods.ts");

const storageMethods_1 = __webpack_require__(/*! ./storageMethods */ "./src/methods/storageMethods.ts"); // TODO: Read these from the contract


const MIN_ETH_TRADE_VOLUME = 1; // Default time an order is open for (24 hours)

const DEFAULT_EXPIRY_OFFSET = 60 * 60 * 24;

const populateOrderDefaults = (sdk, orderInputs, unixSeconds, minEthTradeVolume, marketDetail) => {
  const price = new bignumber_js_1.BigNumber(orderInputs.price);
  const minVolume = marketDetail.base === types_1.Token.ETH ? minEthTradeVolume : calculateAbsoluteMinVolume(minEthTradeVolume, price);
  return {
    symbol: orderInputs.symbol,
    side: orderInputs.side,
    price,
    volume: new bignumber_js_1.BigNumber(orderInputs.volume),
    minVolume: orderInputs.minVolume ? new bignumber_js_1.BigNumber(orderInputs.minVolume) : minVolume,
    expiry: orderInputs.expiry !== undefined ? orderInputs.expiry : unixSeconds + DEFAULT_EXPIRY_OFFSET,
    type: orderInputs.type !== undefined ? orderInputs.type : types_1.OrderType.LIMIT
  };
};

exports.getMinEthTradeVolume = async sdk => {
  return Promise.resolve(new bignumber_js_1.BigNumber(MIN_ETH_TRADE_VOLUME));
};

const calculateAbsoluteMinVolume = (minEthTradeVolume, price) => {
  return conversion_1.normalizeVolume(minEthTradeVolume.dividedBy(price), true);
};

const normalizeOrder = order => {
  const newOrder = Object.assign(order, {});
  newOrder.price = conversion_1.normalizePrice(order.price, order.side === types_1.OrderSide.SELL);
  newOrder.volume = conversion_1.normalizeVolume(order.volume);
  newOrder.minVolume = conversion_1.normalizeVolume(order.minVolume);
  return newOrder;
};

const isNormalized = order => {
  const priceEq = order.price.eq(conversion_1.normalizePrice(order.price, order.side === types_1.OrderSide.SELL));
  const volumeEq = order.volume.eq(conversion_1.normalizeVolume(order.volume));
  const minVolumeEq = order.minVolume.eq(conversion_1.normalizeVolume(order.minVolume));
  return priceEq && volumeEq && minVolumeEq;
};

const isValidDecimals = (order, decimals) => {
  const volumeEq = order.volume.eq(new bignumber_js_1.BigNumber(order.volume.toFixed(decimals)));
  const minVolumeEq = order.minVolume.eq(new bignumber_js_1.BigNumber(order.minVolume.toFixed(decimals)));
  return volumeEq && minVolumeEq;
};

exports.openOrder = async (sdk, orderInputsIn, simpleConsole = types_1.NullConsole) => {
  const marketDetail = market_1.MarketPairs.get(orderInputsIn.symbol);

  if (!marketDetail) {
    throw new Error(`Unsupported market pair: ${orderInputsIn.symbol}`);
  }

  const minEthTradeVolume = await exports.getMinEthTradeVolume(sdk);
  const unixSeconds = Math.floor(new Date().getTime() / 1000);
  let orderInputs = populateOrderDefaults(sdk, orderInputsIn, unixSeconds, minEthTradeVolume, marketDetail);
  const baseToken = marketDetail.base;
  const quoteToken = marketDetail.quote;
  const baseTokenDetails = await balancesMethods_1.getTokenDetails(sdk, baseToken);

  if (!isValidDecimals(orderInputs, baseTokenDetails.decimals)) {
    throw new Error(`Order volumes are invalid. ${baseToken} is limited to ${baseTokenDetails.decimals} decimal places.`);
  }

  if (!isNormalized(orderInputs)) {
    if (sdk.getConfig().autoNormalizeOrders) {
      orderInputs = normalizeOrder(orderInputs);
    } else {
      throw new Error("Order inputs have not been normalized.");
    }
  }

  const orderSettlement = marketDetail.orderSettlement;
  const quoteVolume = orderInputs.volume.times(orderInputs.price);
  const spendToken = orderInputs.side === types_1.OrderSide.BUY ? quoteToken : baseToken;
  const receiveToken = orderInputs.side === types_1.OrderSide.BUY ? baseToken : quoteToken;
  const receiveVolume = orderInputs.side === types_1.OrderSide.BUY ? orderInputs.volume : quoteVolume;
  const spendVolume = orderInputs.side === types_1.OrderSide.BUY ? quoteVolume : orderInputs.volume;
  const feePercent = await settlementMethods_1.darknodeFees(sdk);
  let feeToken = receiveToken;
  let feeAmount = quoteVolume.times(feePercent);

  if (orderSettlement === types_1.OrderSettlement.RenExAtomic && baseToken === types_1.Token.ETH) {
    feeToken = types_1.Token.ETH;
    feeAmount = orderInputs.volume.times(feePercent);
  }

  const retrievedBalances = await balancesMethods_1.balances(sdk, [spendToken, feeToken]);
  let balance = new bignumber_js_1.BigNumber(0);
  simpleConsole.log("Verifying trader balance");

  if (orderSettlement === types_1.OrderSettlement.RenEx) {
    const spendTokenBalance = retrievedBalances.get(spendToken);

    if (spendTokenBalance) {
      balance = spendTokenBalance.free;
    }
  } else {
    try {
      const atomicBalance = await atomicMethods_1.atomicBalances(sdk, [spendToken]).then(b => b.get(spendToken));

      if (atomicBalance) {
        balance = atomicBalance.free;
      }
    } catch (err) {
      simpleConsole.error(err.message || err);
      throw err;
    }
  }

  if (spendVolume.gt(balance)) {
    simpleConsole.error(errors_1.ErrInsufficientBalance);
    throw new Error(errors_1.ErrInsufficientBalance);
  }

  if (orderInputs.price.lte(new bignumber_js_1.BigNumber(0))) {
    simpleConsole.error("Invalid price");
    throw new Error("Invalid price");
  }

  if (orderInputs.volume.lte(new bignumber_js_1.BigNumber(0))) {
    simpleConsole.error("Invalid volume");
    throw new Error("Invalid volume");
  }

  if (orderInputs.minVolume.lt(new bignumber_js_1.BigNumber(0))) {
    simpleConsole.error("Invalid minimum volume");
    throw new Error("Invalid minimum volume");
  }

  const absoluteMinVolume = baseToken === types_1.Token.ETH ? minEthTradeVolume : calculateAbsoluteMinVolume(minEthTradeVolume, orderInputs.price);

  if (orderInputs.volume.lt(absoluteMinVolume)) {
    let errMsg = `Volume must be at least ${absoluteMinVolume} ${baseToken}`;

    if (baseToken !== types_1.Token.ETH) {
      errMsg += ` or ${minEthTradeVolume} ${types_1.Token.ETH}`;
    }

    simpleConsole.error(errMsg);
    throw new Error(errMsg);
  }

  if (orderInputs.minVolume.lt(absoluteMinVolume)) {
    let errMsg = `Minimum volume must be at least ${absoluteMinVolume} ${baseToken}`;

    if (baseToken !== types_1.Token.ETH) {
      errMsg += ` or ${minEthTradeVolume} ${types_1.Token.ETH}`;
    }

    simpleConsole.error(errMsg);
    throw new Error(errMsg);
  }

  if (orderInputs.volume.lt(orderInputs.minVolume)) {
    const errMsg = `Volume must be greater or equal to minimum volume: (${orderInputs.minVolume})`;
    simpleConsole.error(errMsg);
    throw new Error(errMsg);
  }

  if (orderSettlement === types_1.OrderSettlement.RenExAtomic) {
    const usableFeeTokenBalance = retrievedBalances.get(feeToken);

    if (usableFeeTokenBalance && feeAmount.gt(usableFeeTokenBalance.free)) {
      simpleConsole.error("Insufficient balance for fees");
      throw new Error("Insufficient balance for fees");
    }
  }

  const nonce = ingress.randomNonce(() => new bn_js_1.BN(sdk.getWeb3().utils.randomHex(8).slice(2), "hex"));
  let ingressOrder = ingress.createOrder(orderInputs, nonce);
  const orderID = ingress.getOrderID(sdk.getWeb3(), ingressOrder);
  ingressOrder = ingressOrder.set("id", orderID.toBase64());

  if (orderSettlement === types_1.OrderSettlement.RenExAtomic) {
    simpleConsole.log("Submitting order to Atomic Swapper");

    try {
      await atomic_1.submitOrderToAtom(orderID);
    } catch (err) {
      simpleConsole.error(err.message || err);
      throw new Error("Error sending order to Atomic Swapper");
    }
  } // Create order fragment mapping


  simpleConsole.log("Building order mapping");
  let orderFragmentMappings;

  try {
    orderFragmentMappings = await ingress.buildOrderMapping(sdk.getWeb3(), sdk._contracts.darknodeRegistry, ingressOrder, simpleConsole);
  } catch (err) {
    simpleConsole.error(err.message || err);
    throw err;
  }

  const request = new ingress.OpenOrderRequest({
    address: sdk.getAddress().slice(2),
    orderFragmentMappings: [orderFragmentMappings]
  });
  simpleConsole.log("Sending order fragments");
  let signature;

  try {
    signature = await ingress.submitOrderFragments(sdk._networkData.ingress, request);
  } catch (err) {
    simpleConsole.error(err.message || err);
    throw err;
  } // Submit order and the signature to the orderbook


  simpleConsole.log("Waiting for transaction signature");
  const gasPrice = await generalMethods_1.getGasPrice(sdk);
  let txHash;
  let promiEvent;

  try {
    ({
      txHash,
      promiEvent
    } = await balanceActionMethods_1.onTxHash(sdk._contracts.orderbook.openOrder(1, signature.toString(), orderID.toHex(), {
      from: sdk.getAddress(),
      gasPrice
    })));
  } catch (err) {
    simpleConsole.error(err.message || err);
    throw err;
  }

  simpleConsole.log("Order submitted.");
  const traderOrder = {
    orderInputs,
    status: types_1.OrderStatus.NOT_SUBMITTED,
    trader: sdk.getAddress(),
    id: orderID.toBase64(),
    transactionHash: txHash,
    computedOrderDetails: {
      spendToken,
      receiveToken,
      spendVolume,
      receiveVolume,
      date: unixSeconds,
      feeAmount,
      feeToken,
      orderSettlement,
      nonce
    }
  };

  sdk._storage.setOrder(traderOrder).catch(console.error);

  return {
    traderOrder,
    promiEvent
  };
};

exports.cancelOrder = async (sdk, orderID) => {
  const orderIDHex = new encodedData_1.EncodedData(orderID, encodedData_1.Encodings.BASE64).toHex();
  const gasPrice = await generalMethods_1.getGasPrice(sdk);
  return {
    promiEvent: sdk._contracts.orderbook.cancelOrder(orderIDHex, {
      from: sdk.getAddress(),
      gasPrice
    })
  };
};

exports.getOrders = async (sdk, filter) => {
  const filterableStatuses = [types_1.OrderStatus.NOT_SUBMITTED, types_1.OrderStatus.OPEN, types_1.OrderStatus.CONFIRMED];

  if (filter.status && !filterableStatuses.includes(filter.status)) {
    throw new Error(errors_1.ErrUnsupportedFilterStatus);
  }

  let orders = await ingress.getOrders(sdk._contracts.orderbook, filter.start, filter.limit);

  if (filter.status) {
    orders = orders.filter(order => order[1] === filter.status).toList();
  }

  const filterAddress = filter.address;

  if (filterAddress) {
    orders = orders.filter(order => order[2].toLowerCase() === filterAddress.toLowerCase()).toList();
  }

  return orders.map(order => ({
    id: order[0],
    status: order[1],
    trader: order[2]
  })).toArray();
};

exports.updateAllOrderStatuses = async (sdk, orders) => {
  const newStatuses = new Map();

  if (!orders) {
    orders = await storageMethods_1.fetchTraderOrders(sdk);
  }

  await Promise.all(orders.map(async order => {
    if (order.status === types_1.OrderStatus.NOT_SUBMITTED || order.status === types_1.OrderStatus.OPEN) {
      const newStatus = await settlementMethods_1.status(sdk, order.id);

      if (newStatus !== order.status) {
        newStatuses.set(order.id, newStatus);
      }
    }
  }));
  return newStatuses;
};

exports.getOrderBlockNumber = async (sdk, orderID) => {
  const orderIDHex = new encodedData_1.EncodedData(orderID, encodedData_1.Encodings.BASE64).toHex();
  return new bn_js_1.BN((await sdk._contracts.orderbook.orderBlockNumber(orderIDHex))).toNumber();
};

/***/ }),

/***/ "./src/methods/settlementMethods.ts":
/*!******************************************!*\
  !*** ./src/methods/settlementMethods.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

const atomic_1 = __webpack_require__(/*! ../lib/atomic */ "./src/lib/atomic.ts");

const encodedData_1 = __webpack_require__(/*! ../lib/encodedData */ "./src/lib/encodedData.ts");

const order_1 = __webpack_require__(/*! ../lib/order */ "./src/lib/order.ts");

const tokens_1 = __webpack_require__(/*! ../lib/tokens */ "./src/lib/tokens.ts");

const types_1 = __webpack_require__(/*! ../types */ "./src/types.ts");

const atomicMethods_1 = __webpack_require__(/*! ./atomicMethods */ "./src/methods/atomicMethods.ts");

const orderbookMethods_1 = __webpack_require__(/*! ./orderbookMethods */ "./src/methods/orderbookMethods.ts"); // This function is called if the Orderbook returns Confirmed


const settlementStatus = async (sdk, orderID) => {
  try {
    await exports.matchDetails(sdk, orderID.toBase64());
  } catch (error) {
    return types_1.OrderStatus.CONFIRMED;
  } // Retrieve order from storage to see if order is an Atomic Swap


  const storedOrder = await sdk._storage.getOrder(orderID.toBase64()); // If not atomic, return settled

  if (!storedOrder || storedOrder.computedOrderDetails.orderSettlement === types_1.OrderSettlement.RenEx) {
    return types_1.OrderStatus.SETTLED;
  }

  const storedStatus = !storedOrder.status ? types_1.OrderStatus.CONFIRMED : storedOrder.status; // If RenEx Swapper is not connected, return previous status

  if (!atomicMethods_1.atomConnected(sdk)) {
    return storedStatus;
  } // Ask RenEx Swapper for status


  try {
    let orderStatus = await atomic_1.getOrderStatus(orderID); // The Swapper may not have the most recent status

    if (orderStatus === types_1.OrderStatus.OPEN || orderStatus === types_1.OrderStatus.NOT_SUBMITTED) {
      orderStatus = types_1.OrderStatus.CONFIRMED;
    }

    return orderStatus;
  } catch (error) {
    // Return previous status;
    return storedStatus;
  }
};

exports.status = async (sdk, orderID64) => {
  // Convert orderID from base64
  const orderID = new encodedData_1.EncodedData(orderID64, encodedData_1.Encodings.BASE64);
  let orderStatus;
  let orderbookStatus;

  try {
    orderbookStatus = order_1.orderbookStateToOrderStatus(new bn_js_1.BN((await sdk._contracts.orderbook.orderState(orderID.toHex()))).toNumber());
  } catch (err) {
    console.error(`Unable to call orderState in status`);
    throw err;
  }

  if (orderbookStatus === types_1.OrderStatus.CONFIRMED) {
    orderStatus = await settlementStatus(sdk, orderID); // If the order is still settling, check how much time has passed. We
    // do this since we do not want the user's funds to be locked up
    // forever if a trader attempts to settle an order without funds they
    // actually possess.

    const storedOrder = await sdk._storage.getOrder(orderID64);

    if (storedOrder && storedOrder.computedOrderDetails.orderSettlement === types_1.OrderSettlement.RenEx && orderStatus === types_1.OrderStatus.CONFIRMED) {
      let currentBlockNumber = 0;

      try {
        currentBlockNumber = await sdk.getWeb3().eth.getBlockNumber();
      } catch (error) {
        console.error(error);
      }

      if (currentBlockNumber > 0) {
        let blockNumber = 0;

        try {
          blockNumber = await orderbookMethods_1.getOrderBlockNumber(sdk, orderID64);
        } catch (error) {
          console.error(error);
        }

        if (blockNumber > 0 && currentBlockNumber - blockNumber > 300) {
          orderStatus = types_1.OrderStatus.FAILED_TO_SETTLE;
        }
      }
    }
  } else if (orderbookStatus === types_1.OrderStatus.OPEN) {
    // Check if order is expired
    const storedOrder = await sdk._storage.getOrder(orderID64); // Note: Date.now() returns milliseconds

    if (storedOrder && storedOrder.orderInputs.expiry < Date.now() / 1000) {
      orderStatus = types_1.OrderStatus.EXPIRED;
    } else {
      orderStatus = orderbookStatus;
    }
  } else {
    orderStatus = orderbookStatus;
  } // Update local storage (without awaiting)


  sdk._storage.getOrder(orderID64).then(async storedOrder => {
    if (storedOrder) {
      storedOrder.status = orderStatus;
      await sdk._storage.setOrder(storedOrder);
    }
  }).catch(console.error);

  return orderStatus;
};
/**
 * Returns the percentage fees required by the darknodes.
 */


exports.darknodeFees = async sdk => {
  const numerator = new bignumber_js_1.default((await sdk._contracts.renExSettlement.DARKNODE_FEES_NUMERATOR()));
  const denominator = new bignumber_js_1.default((await sdk._contracts.renExSettlement.DARKNODE_FEES_DENOMINATOR()));
  return numerator.dividedBy(denominator);
};

exports.matchDetails = async (sdk, orderID64) => {
  // Check if we already have the match details
  const storedOrder = await sdk._storage.getOrder(orderID64);

  if (storedOrder && storedOrder.matchDetails) {
    return storedOrder.matchDetails;
  }

  const orderID = new encodedData_1.EncodedData(orderID64, encodedData_1.Encodings.BASE64);
  const details = await sdk._contracts.renExSettlement.getMatchDetails(orderID.toHex());
  const matchedID = new encodedData_1.EncodedData(details.matchedID, encodedData_1.Encodings.HEX);

  if (!details.settled) {
    throw new Error("Not settled");
  }

  const orderMatchDetails = details.orderIsBuy ? {
    orderID: orderID64,
    matchedID: matchedID.toBase64(),
    receivedToken: tokens_1.idToToken(new bn_js_1.BN(details.secondaryToken).toNumber()),
    receivedVolume: new bignumber_js_1.default(details.secondaryVolume),
    fee: new bignumber_js_1.default(details.priorityFee),
    spentToken: tokens_1.idToToken(new bn_js_1.BN(details.priorityToken).toNumber()),
    spentVolume: new bignumber_js_1.default(details.priorityVolume)
  } : {
    orderID: orderID64,
    matchedID: matchedID.toBase64(),
    receivedToken: tokens_1.idToToken(new bn_js_1.BN(details.priorityToken).toNumber()),
    receivedVolume: new bignumber_js_1.default(details.priorityVolume),
    fee: new bignumber_js_1.default(details.secondaryFee),
    spentToken: tokens_1.idToToken(new bn_js_1.BN(details.secondaryToken).toNumber()),
    spentVolume: new bignumber_js_1.default(details.secondaryVolume)
  }; // If the order is an Atomic Swap, add fees and volumes since fees are
  // separate

  if (storedOrder && storedOrder.computedOrderDetails.orderSettlement === types_1.OrderSettlement.RenExAtomic) {
    const [receivedVolume, spentVolume] = details.orderIsBuy ? [new bignumber_js_1.default(details.secondaryVolume).plus(new bignumber_js_1.default(details.secondaryFee)), new bignumber_js_1.default(details.priorityVolume).plus(new bignumber_js_1.default(details.priorityFee))] : [new bignumber_js_1.default(details.priorityVolume).plus(new bignumber_js_1.default(details.priorityFee)), new bignumber_js_1.default(details.secondaryVolume).plus(new bignumber_js_1.default(details.secondaryFee))];
    orderMatchDetails.receivedVolume = receivedVolume;
    orderMatchDetails.spentVolume = spentVolume; // TODO: Calculate fees

    orderMatchDetails.fee = new bignumber_js_1.default(0);
  } // Update local storage (without awaiting)


  sdk._storage.getOrder(orderID64).then(async reStoredOrder => {
    if (reStoredOrder) {
      reStoredOrder.matchDetails = orderMatchDetails;
      await sdk._storage.setOrder(reStoredOrder);
    }
  }).catch(console.error);

  return orderMatchDetails;
};

/***/ }),

/***/ "./src/methods/storageMethods.ts":
/*!***************************************!*\
  !*** ./src/methods/storageMethods.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const balanceActionMethods_1 = __webpack_require__(/*! ./balanceActionMethods */ "./src/methods/balanceActionMethods.ts");

const orderbookMethods_1 = __webpack_require__(/*! ./orderbookMethods */ "./src/methods/orderbookMethods.ts");

exports.fetchTraderOrders = async (sdk, options = {
  refresh: true
}) => {
  // Get all the orders
  const traderOrders = await sdk._storage.getOrders();

  if (options.refresh) {
    // Check if any order statuses have been updated
    const changedOrders = await orderbookMethods_1.updateAllOrderStatuses(sdk, traderOrders); // Update the local tradeOrders variable with these new statuses

    traderOrders.map((order, index) => {
      const newStatus = changedOrders.get(order.id);

      if (newStatus) {
        traderOrders[index].status = newStatus;
      }
    });
  } // Return orders based on computed date


  return traderOrders.sort((a, b) => a.computedOrderDetails.date < b.computedOrderDetails.date ? -1 : 1);
};

exports.fetchBalanceActions = async (sdk, options = {
  refresh: true
}) => {
  const balanceActions = await sdk._storage.getBalanceActions();

  if (options.refresh) {
    // Check if any statuses have been updated
    const changedActions = await balanceActionMethods_1.updateAllBalanceActionStatuses(sdk, balanceActions); // Update the local balanceActions variable with these new statuses

    balanceActions.map((action, index) => {
      const newStatus = changedActions.get(action.txHash);

      if (newStatus) {
        balanceActions[index].status = newStatus;
      }
    });
  }

  return balanceActions.sort((a, b) => a.time < b.time ? -1 : 1);
};

/***/ }),

/***/ "./src/storage/localStorage.ts":
/*!*************************************!*\
  !*** ./src/storage/localStorage.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const localforage_1 = __importDefault(__webpack_require__(/*! localforage */ "localforage"));

const serializers_1 = __webpack_require__(/*! ./serializers */ "./src/storage/serializers.ts");

const createKey = (name, address) => `renex_sdk_${name}_${address.toLowerCase()}`;

class LocalStorage {
  constructor(address) {
    const storageKey = address ? address : "default";
    this.orders = localforage_1.default.createInstance({
      name: "orders",
      storeName: createKey("orders", storageKey),
      driver: [localforage_1.default.INDEXEDDB, localforage_1.default.WEBSQL, localforage_1.default.LOCALSTORAGE]
    });
    this.balanceActions = localforage_1.default.createInstance({
      name: "deposits",
      storeName: createKey("deposits", storageKey),
      driver: [localforage_1.default.INDEXEDDB, localforage_1.default.WEBSQL, localforage_1.default.LOCALSTORAGE]
    });
  } // Orders


  async setOrder(order) {
    await this.orders.setItem(order.id, serializers_1.serializeTraderOrder(order));
  }

  async getOrder(orderID) {
    const serialized = await this.orders.getItem(orderID);

    if (!serialized) {
      return undefined;
    }

    return serializers_1.deserializeTraderOrder(serialized);
  }

  async getOrders() {
    const orders = [];
    await this.orders.iterate(value => {
      try {
        orders.push(serializers_1.deserializeTraderOrder(value));
      } catch (err) {
        console.error(err);
      }
    });
    return orders;
  } // Balances


  async setBalanceAction(balanceAction) {
    await this.balanceActions.setItem(balanceAction.txHash, serializers_1.serializeBalanceAction(balanceAction));
  }

  async getBalanceAction(txHash) {
    const serialized = await this.balanceActions.getItem(txHash);

    if (!serialized) {
      return undefined;
    }

    return serializers_1.deserializeBalanceAction(serialized);
  }

  async getBalanceActions() {
    const balanceActions = [];
    await this.balanceActions.iterate(value => {
      try {
        balanceActions.push(serializers_1.deserializeBalanceAction(value));
      } catch (err) {
        console.error(err);
      }
    });
    return balanceActions;
  }

}

exports.default = LocalStorage;

/***/ }),

/***/ "./src/storage/memoryStorage.ts":
/*!**************************************!*\
  !*** ./src/storage/memoryStorage.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

class MemoryStorage {
  constructor() {
    this.orders = new Map();
    this.balanceActions = new Map();
  } // Orders


  async setOrder(order) {
    this.orders.set(order.id, order);
  }

  async getOrder(orderID) {
    return this.orders.get(orderID);
  }

  async getOrders() {
    return Array.from(this.orders.values());
  } // // Balances


  async setBalanceAction(balanceAction) {
    this.balanceActions.set(balanceAction.txHash, balanceAction);
  }

  async getBalanceAction(txHash) {
    return this.balanceActions.get(txHash);
  }

  async getBalanceActions() {
    return Array.from(this.balanceActions.values());
  }

}

exports.MemoryStorage = MemoryStorage;

/***/ }),

/***/ "./src/storage/serializers.ts":
/*!************************************!*\
  !*** ./src/storage/serializers.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bignumber_js_1 = __importDefault(__webpack_require__(/*! bignumber.js */ "bignumber.js"));

const bn_js_1 = __webpack_require__(/*! bn.js */ "bn.js");

exports.serializeTraderOrder = order => {
  return JSON.stringify(order);
};

exports.deserializeTraderOrder = orderString => {
  const order = JSON.parse(orderString);

  if (order.matchDetails) {
    order.matchDetails.fee = new bignumber_js_1.default(order.matchDetails.fee);
    order.matchDetails.receivedVolume = new bignumber_js_1.default(order.matchDetails.receivedVolume);
    order.matchDetails.spentVolume = new bignumber_js_1.default(order.matchDetails.spentVolume);
  }

  order.computedOrderDetails.receiveVolume = new bignumber_js_1.default(order.computedOrderDetails.receiveVolume);
  order.computedOrderDetails.spendVolume = new bignumber_js_1.default(order.computedOrderDetails.spendVolume);
  order.computedOrderDetails.feeAmount = new bignumber_js_1.default(order.computedOrderDetails.feeAmount);
  order.computedOrderDetails.nonce = new bn_js_1.BN(order.computedOrderDetails.nonce, "hex");
  order.orderInputs.minVolume = new bignumber_js_1.default(order.orderInputs.minVolume);
  order.orderInputs.price = new bignumber_js_1.default(order.orderInputs.price);
  order.orderInputs.volume = new bignumber_js_1.default(order.orderInputs.volume);
  return order;
};

exports.serializeBalanceAction = balanceAction => {
  return JSON.stringify(balanceAction);
};

exports.deserializeBalanceAction = balanceActionString => {
  const balanceAction = JSON.parse(balanceActionString);
  balanceAction.amount = new bignumber_js_1.default(balanceAction.amount);
  return balanceAction;
};

/***/ }),

/***/ "./src/types.ts":
/*!**********************!*\
  !*** ./src/types.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var OrderStatus;

(function (OrderStatus) {
  OrderStatus["NOT_SUBMITTED"] = "NOT_SUBMITTED";
  OrderStatus["FAILED_TO_SETTLE"] = "FAILED_TO_SETTLE";
  OrderStatus["OPEN"] = "OPEN";
  OrderStatus["CONFIRMED"] = "CONFIRMED";
  OrderStatus["CANCELED"] = "CANCELED";
  OrderStatus["SETTLED"] = "SETTLED";
  OrderStatus["SLASHED"] = "SLASHED";
  OrderStatus["EXPIRED"] = "EXPIRED";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));

var OrderSettlement;

(function (OrderSettlement) {
  OrderSettlement["RenEx"] = "renex";
  OrderSettlement["RenExAtomic"] = "atomic";
})(OrderSettlement = exports.OrderSettlement || (exports.OrderSettlement = {}));

var OrderType;

(function (OrderType) {
  OrderType["MIDPOINT"] = "midpoint";
  OrderType["LIMIT"] = "limit";
  OrderType["MIDPOINT_IOC"] = "midpoint_ioc";
  OrderType["LIMIT_IOC"] = "limit_ioc";
})(OrderType = exports.OrderType || (exports.OrderType = {}));

var OrderSide;

(function (OrderSide) {
  OrderSide["BUY"] = "buy";
  OrderSide["SELL"] = "sell";
})(OrderSide = exports.OrderSide || (exports.OrderSide = {}));

var Token;

(function (Token) {
  Token["BTC"] = "BTC";
  Token["ETH"] = "ETH";
  Token["DGX"] = "DGX";
  Token["TUSD"] = "TUSD";
  Token["REN"] = "REN";
  Token["ZRX"] = "ZRX";
  Token["OMG"] = "OMG";
})(Token = exports.Token || (exports.Token = {}));

var MarketPair;

(function (MarketPair) {
  MarketPair["ETH_BTC"] = "ETH/BTC";
  MarketPair["DGX_ETH"] = "DGX/ETH";
  MarketPair["TUSD_ETH"] = "TUSD/ETH";
  MarketPair["REN_ETH"] = "REN/ETH";
  MarketPair["ZRX_ETH"] = "ZRX/ETH";
  MarketPair["OMG_ETH"] = "OMG/ETH";
})(MarketPair = exports.MarketPair || (exports.MarketPair = {}));

var BalanceActionType;

(function (BalanceActionType) {
  BalanceActionType["Withdraw"] = "withdraw";
  BalanceActionType["Deposit"] = "deposit";
})(BalanceActionType = exports.BalanceActionType || (exports.BalanceActionType = {}));

var TransactionStatus;

(function (TransactionStatus) {
  TransactionStatus["Pending"] = "pending";
  TransactionStatus["Done"] = "done";
  TransactionStatus["Failed"] = "failed";
  TransactionStatus["Replaced"] = "replaced";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));

exports.NullConsole = {
  error: message => null,
  log: message => null
};
var AtomicConnectionStatus;

(function (AtomicConnectionStatus) {
  AtomicConnectionStatus["InvalidSwapper"] = "invalid_swapper";
  AtomicConnectionStatus["ChangedSwapper"] = "changed_swapper";
  AtomicConnectionStatus["NotConnected"] = "not_connected";
  AtomicConnectionStatus["NotAuthorized"] = "not_authorized";
  AtomicConnectionStatus["AtomNotAuthorized"] = "atom_not_authorized";
  AtomicConnectionStatus["ConnectedUnlocked"] = "connected_unlocked";
  AtomicConnectionStatus["ConnectedLocked"] = "connected_locked";
})(AtomicConnectionStatus = exports.AtomicConnectionStatus || (exports.AtomicConnectionStatus = {}));

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),

/***/ "bignumber.js":
/*!*******************************!*\
  !*** external "bignumber.js" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bignumber.js");

/***/ }),

/***/ "bn.js":
/*!************************!*\
  !*** external "bn.js" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bn.js");

/***/ }),

/***/ "bs58":
/*!***********************!*\
  !*** external "bs58" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bs58");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),

/***/ "immutable":
/*!****************************!*\
  !*** external "immutable" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("immutable");

/***/ }),

/***/ "localforage":
/*!******************************!*\
  !*** external "localforage" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("localforage");

/***/ }),

/***/ "node-rsa":
/*!***************************!*\
  !*** external "node-rsa" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("node-rsa");

/***/ }),

/***/ "truffle-blockchain-utils":
/*!*******************************************!*\
  !*** external "truffle-blockchain-utils" ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("truffle-blockchain-utils");

/***/ }),

/***/ "truffle-contract-schema":
/*!******************************************!*\
  !*** external "truffle-contract-schema" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("truffle-contract-schema");

/***/ }),

/***/ "truffle-error":
/*!********************************!*\
  !*** external "truffle-error" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("truffle-error");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),

/***/ "web3":
/*!***********************!*\
  !*** external "web3" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("web3");

/***/ }),

/***/ "web3-core-promievent":
/*!***************************************!*\
  !*** external "web3-core-promievent" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("web3-core-promievent");

/***/ }),

/***/ "web3-eth-abi":
/*!*******************************!*\
  !*** external "web3-eth-abi" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("web3-eth-abi");

/***/ }),

/***/ "web3-utils":
/*!*****************************!*\
  !*** external "web3-utils" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("web3-utils");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map