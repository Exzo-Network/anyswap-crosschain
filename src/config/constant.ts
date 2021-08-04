export const tokenListUrl = 'https://list.htswap.io/tokenList/'
export const bridgeApi = 'https://bridgeapi.anyswap.exchange'
// export const bridgeApi = 'http://localhost:8107'
// export const bridgeApi = 'http://192.168.19.68:8107'

export enum VERSION {
  V1 = 'UNDERLYING',
  V1_1 = 'UNDERLYINGV2',
  V2 = 'STABLE',
  V2_1 = 'STABLEV2',
  V2_2 = 'STABLEV3',
  V2_T1 = 'STABLE_TEST',
  V3 = 'ARB_DEV',
  V4 = 'BRIDGE',
  V4_OKT = 'BRIDGE_OKT',
}

export const env:any = 'pro'
// export const env:any = 'dev'

export const version = '0.1.5'
export const timeout = 1000 * 60 * 30

// export const USE_VERSION = VERSION.V1_1
// export const USE_VERSION = VERSION.V2_2
export const USE_VERSION = VERSION.V4
// export const USE_VERSION = VERSION.V4_OKT

function formatHiddenCoin (list?:Array<any>) {
  const arr:any = []
  if (list && list.length > 0) {
    for (let str of list) {
      arr.push(str)
      if (str.indexOf('any') !== 0) str = 'any' + str
      arr.push(str)
    }
  }
  // console.log(arr)
  return arr
}
export const controlConfig:any = {
  [VERSION.V1]: {
    bridgeConfigToken: '0xf27ee99622c3c9b264583dacb2cce056e194494f',
    bridgeInitDataChain: '56',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    initNode: '56',
    isOpenRouter: 1,
    isOpenRouterTxns: 0,
    isOpenBridge: 0
  },
  [VERSION.V1_1]: {
    bridgeConfigToken: '0xbCCFf1c6C1CA650F533D3dcc5F4722aaE6718337',
    bridgeInitDataChain: '56',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    initNode: '56',
    isOpenRouter: 1,
    isOpenRouterTxns: env === 'dev' ? 1 : 0,
    isOpenBridge: env === 'dev' ? 1 : 0,
  },
  [VERSION.V2]: {
    bridgeConfigToken: '0xe6f658118bcc6d344c812826b1af13bd7d59956c',
    bridgeInitDataChain: '56',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    initNode: '1',
    isOpenRouter: 1,
    isOpenRouterTxns: 0,
    isOpenBridge: 0
  },
  [VERSION.V2_1]: {
    bridgeConfigToken: '0x9879aBDea01a879644185341F7aF7d8343556B7a',
    bridgeInitDataChain: '56',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    initNode: '1',
    isOpenRouter: 1,
    isOpenRouterTxns: 0,
    isOpenBridge: 0
  },
  [VERSION.V2_2]: {
    bridgeConfigToken: '0x9879aBDea01a879644185341F7aF7d8343556B7a',
    bridgeInitDataChain: '56',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    initNode: env === 'dev' ? '56' : '1',
    isOpenRouter: 1,
    isOpenRouterTxns: env === 'dev' ? 1 : 0,
    isOpenBridge: env === 'dev' ? 1 : 0,
  },
  [VERSION.V2_T1]: {
    bridgeConfigToken: '0xe5137598331dfb329840a1a732babeda5dcbc962',
    bridgeInitDataChain: '256',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    initNode: '97',
    isOpenRouter: 1,
    isOpenRouterTxns: 0,
    isOpenBridge: 0
  },
  [VERSION.V3]: {
    bridgeConfigToken: '0x7beb05cf5681f402e762f8569c2fc138a2172978',
    bridgeInitDataChain: '56',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    initNode: '1',
    isOpenRouter: 1,
    isOpenRouterTxns: 0,
    isOpenBridge: 0
  },
  [VERSION.V4]: {
    bridgeConfigToken: '',
    bridgeInitDataChain: '',
    hiddenCoin: formatHiddenCoin([]),
    hiddenChain: [],
    showCoin: [],
    showChain: [],
    initNode: '56',
    isOpenRouter: 0,
    isOpenRouterTxns: 0,
    isOpenBridge: 1
  },
  [VERSION.V4_OKT]: {
    bridgeConfigToken: '',
    bridgeInitDataChain: '',
    hiddenCoin: [],
    hiddenChain: [],
    showCoin: ['Binance', 'BUSDToken', 'BabyDogeCoin'],
    showChain: [56,66],
    initNode: '56',
    isOpenRouter: 0,
    isOpenRouterTxns: 0,
    isOpenBridge: 1
  }
}


export const ENV_NODE_CONFIG = USE_VERSION + '_ENV_NODE_CONFIG'

export const INIT_NODE = controlConfig[USE_VERSION].initNode

export const BASECURRENCY = 'BASECURRENCY'
