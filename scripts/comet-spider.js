const fs = require('fs');
const ethers = require('ethers');
const { dirname } = require('path');
const srcDir = dirname(require.main.filename).split('scripts')[0] + 'src/';

// Remember to add any new secrets to the GitHub actions/workflows/build.yml file
const providers = {
  'mainnet_usdc': process.env.MAINNET_PROVIDER_URL,
  'mainnet_weth': process.env.MAINNET_PROVIDER_URL,
  'polygon_usdc': process.env.POLYGON_PROVIDER_URL,
  'arbitrum_usdc': process.env.ARBITRUM_PROVIDER_URL,
  'base_usdbc': process.env.BASE_PROVIDER_URL,
  'base_weth': process.env.BASE_PROVIDER_URL,
  'goerli_usdc': process.env.GOERLI_PROVIDER_URL,
  'goerli_weth': process.env.GOERLI_PROVIDER_URL,
  'mumbai_usdc': process.env.MUMBAI_PROVIDER_URL,
  'goerli_arbitrum_usdc': process.env.GOERLI_ARBITRUM_PROVIDER_URL,
  'goerli_optimism_usdc': process.env.GOERLI_OPTIMISM_PROVIDER_URL,
  'goerli_base_usdc': process.env.GOERLI_BASE_PROVIDER_URL,
  'goerli_base_weth': process.env.GOERLI_BASE_PROVIDER_URL,
  'fuji_usdc': process.env.FUJI_PROVIDER_URL,
};

const cometInstances = {
  'mainnet_usdc': '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
  'mainnet_weth': '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
  'polygon_usdc': '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
  'arbitrum_usdc': '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
  'base_usdbc': '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
  'base_weth': '0x46e6b214b524310239732D51387075E0e70970bf',
  'goerli_usdc': '0x3EE77595A8459e93C2888b13aDB354017B198188',
  'goerli_weth': '0x9A539EEc489AAA03D588212a164d0abdB5F08F5F',
  'mumbai_usdc': '0xF09F0369aB0a875254fB565E52226c88f10Bc839',
  'goerli_arbitrum_usdc': '0x1d573274E19174260c5aCE3f2251598959d24456',
  'goerli_optimism_usdc': '0xb8F2f9C84ceD7bBCcc1Db6FB7bb1F19A9a4adfF4',
  'goerli_base_usdc': '0xe78Fc55c884704F9485EDa042fb91BfE16fD55c1',
  'goerli_base_weth': '0xED94f3052638620fE226a9661ead6a39C2a265bE',
  'fuji_usdc': '0x59BF4753899C20EA152dEefc6f6A14B2a5CC3021',
};

// Define using what is already defined in Util.getNetNameWithChainId
const instanceNetworkMap = {
  'mainnet_usdc': 'mainnet',
  'mainnet_weth': 'mainnet',
  'polygon_usdc': 'matic',
  'arbitrum_usdc': 'arbitrum',
  'base_usdbc': 'base',
  'base_weth': 'base',
  'goerli_usdc': 'goerli',
  'goerli_weth': 'goerli',
  'mumbai_usdc': 'maticmum',
  'goerli_arbitrum_usdc': 'optimism-arbitrum',
  'goerli_optimism_usdc': 'optimism-goerli',
  'goerli_base_usdc': 'base-goerli',
  'goerli_base_weth': 'base-goerli',
  'fuji_usdc': 'ava-fuji',
};

const erc20Abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];

function forEachWithCallback(callback, after) {
  const arrayCopy = this;
  let index = 0;
  const next = () => {
    index++;
    if (arrayCopy.length > 0) {
      callback(arrayCopy.shift(), index, next);
    } else {
      after();
    }
  }
  next();
}

Array.prototype.forEachWithCallback = forEachWithCallback;

function main() {
  return new Promise((resolve) => {
    const cometConstants = {
      moveToParentClass: {
        'Comet': 'Comet',
      },
      address: {},
      // abi: {},
      decimals: {},
      collaterals: {},
      base: {},
      instanceNetworkMap
    };

    // CometInterface main 518cea7
    const abi = [{"inputs":[],"name":"Absurd","type":"error"},{"inputs":[],"name":"AlreadyInitialized","type":"error"},{"inputs":[],"name":"BadAmount","type":"error"},{"inputs":[],"name":"BadAsset","type":"error"},{"inputs":[],"name":"BadDecimals","type":"error"},{"inputs":[],"name":"BadDiscount","type":"error"},{"inputs":[],"name":"BadMinimum","type":"error"},{"inputs":[],"name":"BadNonce","type":"error"},{"inputs":[],"name":"BadPrice","type":"error"},{"inputs":[],"name":"BadSignatory","type":"error"},{"inputs":[],"name":"BorrowCFTooLarge","type":"error"},{"inputs":[],"name":"BorrowTooSmall","type":"error"},{"inputs":[],"name":"InsufficientReserves","type":"error"},{"inputs":[],"name":"InvalidInt104","type":"error"},{"inputs":[],"name":"InvalidInt256","type":"error"},{"inputs":[],"name":"InvalidUInt104","type":"error"},{"inputs":[],"name":"InvalidUInt128","type":"error"},{"inputs":[],"name":"InvalidUInt64","type":"error"},{"inputs":[],"name":"InvalidValueS","type":"error"},{"inputs":[],"name":"InvalidValueV","type":"error"},{"inputs":[],"name":"LiquidateCFTooLarge","type":"error"},{"inputs":[],"name":"NegativeNumber","type":"error"},{"inputs":[],"name":"NoSelfTransfer","type":"error"},{"inputs":[],"name":"NotCollateralized","type":"error"},{"inputs":[],"name":"NotForSale","type":"error"},{"inputs":[],"name":"NotLiquidatable","type":"error"},{"inputs":[],"name":"Paused","type":"error"},{"inputs":[],"name":"SignatureExpired","type":"error"},{"inputs":[],"name":"SupplyCapExceeded","type":"error"},{"inputs":[],"name":"TimestampTooLarge","type":"error"},{"inputs":[],"name":"TooManyAssets","type":"error"},{"inputs":[],"name":"TooMuchSlippage","type":"error"},{"inputs":[],"name":"TransferInFailed","type":"error"},{"inputs":[],"name":"TransferOutFailed","type":"error"},{"inputs":[],"name":"Unauthorized","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"absorber","type":"address"},{"indexed":true,"internalType":"address","name":"borrower","type":"address"},{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"collateralAbsorbed","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdValue","type":"uint256"}],"name":"AbsorbCollateral","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"absorber","type":"address"},{"indexed":true,"internalType":"address","name":"borrower","type":"address"},{"indexed":false,"internalType":"uint256","name":"basePaidOut","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"usdValue","type":"uint256"}],"name":"AbsorbDebt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"baseAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"collateralAmount","type":"uint256"}],"name":"BuyCollateral","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bool","name":"supplyPaused","type":"bool"},{"indexed":false,"internalType":"bool","name":"transferPaused","type":"bool"},{"indexed":false,"internalType":"bool","name":"withdrawPaused","type":"bool"},{"indexed":false,"internalType":"bool","name":"absorbPaused","type":"bool"},{"indexed":false,"internalType":"bool","name":"buyPaused","type":"bool"}],"name":"PauseAction","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Supply","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"SupplyCollateral","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TransferCollateral","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"address","name":"asset","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"WithdrawCollateral","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"WithdrawReserves","type":"event"},{"inputs":[{"internalType":"address","name":"absorber","type":"address"},{"internalType":"address[]","name":"accounts","type":"address[]"}],"name":"absorb","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"accrueAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"manager","type":"address"},{"internalType":"bool","name":"isAllowed","type":"bool"}],"name":"allow","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"manager","type":"address"},{"internalType":"bool","name":"isAllowed","type":"bool"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"allowBySig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"manager","type":"address"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approveThis","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseAccrualScale","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseBorrowMin","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseIndexScale","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseMinForRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseScale","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTokenPriceFeed","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"baseTrackingAccrued","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTrackingBorrowSpeed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseTrackingSupplySpeed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"borrowBalanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowKink","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowPerSecondInterestRateBase","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowPerSecondInterestRateSlopeHigh","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"borrowPerSecondInterestRateSlopeLow","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"minAmount","type":"uint256"},{"internalType":"uint256","name":"baseAmount","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"buyCollateral","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"asset","type":"address"}],"name":"collateralBalanceOf","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"extensionDelegate","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"factorScale","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"i","type":"uint8"}],"name":"getAssetInfo","outputs":[{"components":[{"internalType":"uint8","name":"offset","type":"uint8"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"address","name":"priceFeed","type":"address"},{"internalType":"uint64","name":"scale","type":"uint64"},{"internalType":"uint64","name":"borrowCollateralFactor","type":"uint64"},{"internalType":"uint64","name":"liquidateCollateralFactor","type":"uint64"},{"internalType":"uint64","name":"liquidationFactor","type":"uint64"},{"internalType":"uint128","name":"supplyCap","type":"uint128"}],"internalType":"struct CometCore.AssetInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getAssetInfoByAddress","outputs":[{"components":[{"internalType":"uint8","name":"offset","type":"uint8"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"address","name":"priceFeed","type":"address"},{"internalType":"uint64","name":"scale","type":"uint64"},{"internalType":"uint64","name":"borrowCollateralFactor","type":"uint64"},{"internalType":"uint64","name":"liquidateCollateralFactor","type":"uint64"},{"internalType":"uint64","name":"liquidationFactor","type":"uint64"},{"internalType":"uint128","name":"supplyCap","type":"uint128"}],"internalType":"struct CometCore.AssetInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"utilization","type":"uint256"}],"name":"getBorrowRate","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getCollateralReserves","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"priceFeed","type":"address"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getReserves","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"utilization","type":"uint256"}],"name":"getSupplyRate","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUtilization","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"governor","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"manager","type":"address"}],"name":"hasPermission","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"initializeStorage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isAbsorbPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"isAllowed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isBorrowCollateralized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isBuyPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isLiquidatable","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isSupplyPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isTransferPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isWithdrawPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"liquidatorPoints","outputs":[{"internalType":"uint32","name":"numAbsorbs","type":"uint32"},{"internalType":"uint64","name":"numAbsorbed","type":"uint64"},{"internalType":"uint128","name":"approxSpend","type":"uint128"},{"internalType":"uint32","name":"_reserved","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxAssets","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"numAssets","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"supplyPaused","type":"bool"},{"internalType":"bool","name":"transferPaused","type":"bool"},{"internalType":"bool","name":"withdrawPaused","type":"bool"},{"internalType":"bool","name":"absorbPaused","type":"bool"},{"internalType":"bool","name":"buyPaused","type":"bool"}],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"pauseGuardian","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"priceScale","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"baseAmount","type":"uint256"}],"name":"quoteCollateral","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"storeFrontPriceFactor","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"supply","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"supplyFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"supplyKink","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"supplyPerSecondInterestRateBase","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"supplyPerSecondInterestRateSlopeHigh","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"supplyPerSecondInterestRateSlopeLow","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"supplyTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"targetReserves","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBorrow","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalsBasic","outputs":[{"components":[{"internalType":"uint64","name":"baseSupplyIndex","type":"uint64"},{"internalType":"uint64","name":"baseBorrowIndex","type":"uint64"},{"internalType":"uint64","name":"trackingSupplyIndex","type":"uint64"},{"internalType":"uint64","name":"trackingBorrowIndex","type":"uint64"},{"internalType":"uint104","name":"totalSupplyBase","type":"uint104"},{"internalType":"uint104","name":"totalBorrowBase","type":"uint104"},{"internalType":"uint40","name":"lastAccrualTime","type":"uint40"},{"internalType":"uint8","name":"pauseFlags","type":"uint8"}],"internalType":"struct CometStorage.TotalsBasic","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"totalsCollateral","outputs":[{"internalType":"uint128","name":"totalSupplyAsset","type":"uint128"},{"internalType":"uint128","name":"_reserved","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"trackingIndexScale","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferAsset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferAssetFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userBasic","outputs":[{"internalType":"int104","name":"principal","type":"int104"},{"internalType":"uint64","name":"baseTrackingIndex","type":"uint64"},{"internalType":"uint64","name":"baseTrackingAccrued","type":"uint64"},{"internalType":"uint16","name":"assetsIn","type":"uint16"},{"internalType":"uint8","name":"_reserved","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"userCollateral","outputs":[{"internalType":"uint128","name":"balance","type":"uint128"},{"internalType":"uint128","name":"_reserved","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawReserves","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawTo","outputs":[],"stateMutability":"nonpayable","type":"function"}];
    cometConstants.abi = abi;

    Object.keys(cometInstances).forEachWithCallback(async (instance, itr, done) => {
      console.log('Spidering instance:', instance, '...');
      cometConstants.moveToParentClass[instance.toUpperCase()] = instance;
      cometConstants.address[instance] = {};
      cometConstants.abi[instance] = {};
      cometConstants.decimals[instance] = {};
      cometConstants.collaterals[instance] = [];
      cometConstants.base[instance] = '';
      const provider = new ethers.providers.JsonRpcProvider(providers[instance]);
      const implementationAddress = '0x' + (await provider.getStorageAt(cometInstances[instance], '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')).substring(26, 66);

      const comet = new ethers.Contract(cometInstances[instance], abi, provider);

      const baseToken = await comet.callStatic.baseToken();
      const baseTokenPriceFeed = await comet.callStatic.baseTokenPriceFeed();
      const baseScale = await comet.callStatic.baseScale();

      const numAssets = +(await comet.callStatic.numAssets()).toString();

      let promises = [];
      for (let i = 0; i < numAssets; i++) {
        promises.push(comet.callStatic.getAssetInfo(i));
      }

      const cometAssetInfos = await Promise.all(promises);

      cometAssetInfos.push({
        asset: baseToken,
        priceFeed: baseTokenPriceFeed,
        scale: baseScale,
      });

      promises = [];
      for (let i = 0; i < cometAssetInfos.length; i++) {
        const token = new ethers.Contract(cometAssetInfos[i].asset, erc20Abi, provider);
        promises.push(token.callStatic.symbol());
      }

      const symbols = await Promise.all(promises);

      for (let i = 0; i < symbols.length; i++) {
        if (symbols[i].includes('.')) {
          symbols[i] = symbols[i].replace(/\./g, '_');
        }

        cometConstants.moveToParentClass[symbols[i]] = symbols[i];
        cometConstants.collaterals[instance].push(symbols[i]);
        cometConstants.address[instance][symbols[i]] = {
          contract: cometAssetInfos[i].asset,
          priceFeed: cometAssetInfos[i].priceFeed,
        };
        cometConstants.decimals[instance][symbols[i]] = cometAssetInfos[i].scale.toString().length - 1;
      }

      cometConstants.address[instance].Comet = cometInstances[instance];
      cometConstants.abi[instance].Comet = abi;
      cometConstants.base[instance] = symbols[symbols.length-1];

      done();
    }, () => {
      resolve(cometConstants);
    });
  });
}

(async function () {
  const cometConstants = await main();
  fs.writeFileSync(srcDir + 'comet-artifacts/comet-constants.json', JSON.stringify(cometConstants));
})().catch(console.error);
