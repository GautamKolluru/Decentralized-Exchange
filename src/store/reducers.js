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
  state = {
    loaded: false,
    contracts: [],
    symbols: [],
    balances: [],
  },
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
    allOrders: {
      data: [],
    },
    cancelOrders: {
      data: [],
    },
    filledOrders: {
      data: [],
    },
  },
  action
) => {
  let index, data
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
          isSuccessful: false,
          isError: true,
        },
        transferInprogress: false,
      }

    //Order request
    case "ALL_ORDERS_LOADED":
      return {
        ...state,
        allOrders: {
          loaded: true,
          data: action.allOrders,
        },
      }
    case "CANCEL_ORDERS_LOADED":
      return {
        ...state,
        cancelOrders: {
          loaded: true,
          data: action.cancelOrders,
        },
      }
    //--------
    //Cancelling orders

    case "ORDER_CANCEL_SUCCESS":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "CANCEL",
          isPending: true,
          isSuccessful: false,
        },
        cancelOrders: {
          loaded: true,
          data: [...state.cancelOrders.data, action.order],
        },
        events: [action.events, ...state.events],
      }
    case "ORDER_CANCEL_REQUEST":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "CANCEL",
          isPending: false,
          isSuccessful: true,
        },
      }
    case "ORDER_CANCEL_FAIL":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "CANCEL",
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
      }
    //Fill orders
    case "FILLED_ORDERS_LOADED":
      return {
        ...state,
        filledOrders: {
          loaded: true,
          data: action.filledOrders,
        },
      }
    case "ORDER_FILL_SUCCESS":
      index = state.filledOrders.data.findIndex(
        (order) => order.id.toString() === action.order.id.toString()
      )
      if (index === -1) {
        data = [...state.filledOrders.data, action.order]
      } else {
        data = state.filledOrders.data
      }
      return {
        ...state,
        filledOrders: {
          loaded: true,
          data,
        },
        events: [action.event, ...state.events],
      }
    case "ORDER_FILL_FAIL":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "FILL",
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
      }
    case "ORDER_FILL_REQUEST":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "FILL",
          isPending: true,
          isSuccessful: false,
        },
      }
    case "NEW_ORDER_REQUEST":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "New Order",
          isPending: true,
          isSuccessful: false,
        },
      }
    case "NEW_ORDER_FAIL":
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "New Order",
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
      }
    case "NEW_ORDER_SUCCESS":
      index = state.allOrders.data.findIndex(
        (order) => order.id.toString() === action.order.id.toString()
      )
      if (index === -1) {
        data = [...state.allOrders.data, action.order]
      } else {
        data = state.allOrders.data
      }
      return {
        ...state,
        trasnsaction: {
          trasnsactionType: "New Order",
          isPending: false,
          isSuccessful: true,
        },
        events: [action.event, ...state.events],
        allOrders: {
          ...state.allOrders,
          data,
        },
      }

    default:
      return state
  }
}
