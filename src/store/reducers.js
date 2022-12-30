export const provider = (state = {}, action) => {
  switch (action.type) {
    case "PROVIDER_LOADED":
      return {
        ...state,
        connection: action.connection,
      }
    case "NETWORK_LOADED":
      return {
        ...state,
        chainId: action.chainId,
      }
    case "ACCOUNT_LOADED":
      return {
        ...state,
        account: action.account,
        balance: action.balance,
      }
    case "ETHER_BALANCE_LOADED":
      return {
        ...state,
        balance: action.balance,
      }
    default:
      return state
  }
}

export const tokens = (
  state = { loaded: false, contracts: [], symbols: [], balances: [] },
  action
) => {
  switch (action.type) {
    case "TOKEN_1_LOADED":
      return {
        ...state,
        loaded: true,
        contracts: [action.tokens],
        symbols: [action.symbols],
      }
    case "TOKEN_2_LOADED":
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.tokens],
        symbols: [...state.symbols, action.symbols],
      }
    case "TOKEN_1_BALANCE_LOADED":
      return {
        ...state,
        balances: [action.balance],
      }
    case "TOKEN_2_BALANCE_LOADED":
      return {
        ...state,
        balances: [...state.balances, action.balance],
      }
    default:
      return state
  }
}

export const exchange = (
  state = {
    loaded: false,
    contract: {},
    balances: [],
    trasnsaction: {},
    events: [],
  },
  action
) => {
  switch (action.type) {
    case "EXCHANGE_LOADED":
      return {
        ...state,
        loaded: true,
        contracts: action.exchange,
      }
    case "EXCHANGE_TOKEN_1_BALANCE_LOADED":
      return {
        ...state,
        balances: [action.balance],
      }
    case "EXCHANGE_TOKEN_2_BALANCE_LOADED":
      return {
        ...state,
        balances: [...state.balances, action.balance],
      }

    //Transfer Cases Deposit and withdraw

    case "TRANSFER_REQUEST":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "Transfer",
          isPending: true,
          isSuccessful: false,
        },
        transferInprogress: true,
      }
    case "TRANSFER_SUCCESS":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "Transfer",
          isPending: false,
          isSuccessful: true,
        },
        transferInprogress: false,
        events: [action.event, ...state.events],
      }
    case "TRANSFER_FAIL":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "Transfer",
          isPending: false,
          isSuccessful: true,
          isError: true,
        },
        transferInprogress: false,
      }
    default:
      return state
  }
}
