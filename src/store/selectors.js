import { createSelector } from "reselect"
import { get, groupBy, reject, maxBy, minBy } from "lodash"
import { ethers } from "ethers"
import moment from "moment"

const tokens = (state) => get(state, "tokens.contracts")
const allOrders = (state) => get(state, "exchange.allOrders.data")
const cancelOrders = (state) => get(state, "exchange.cancelOrders.data")
const filledOrders = (state) => get(state, "exchange.filledOrders.data")
const accounts = (state) => get(state, "provider.account")

const GREEN = "#25CE8F"
const RED = "#F45353"

const decorateOrder = (order, tokens) => {
  let orderType, token0Amount, token1Amount
  if (order.tokenGet === tokens[0].address) {
    orderType = "buy"
    token0Amount = order.amountGet
    token1Amount = order.amountGive
  } else {
    orderType = "sell"
    token0Amount = order.amountGive
    token1Amount = order.amountGet
  }
  token0Amount = ethers.utils.formatUnits(token0Amount, "ether")
  token1Amount = ethers.utils.formatUnits(token1Amount, "ether")
  let tokenPrice = token0Amount / token1Amount
  const precision = 100000
  tokenPrice = Math.round(tokenPrice * 100000) / 100000

  order = {
    ...order,
    orderType,
    token0Amount,
    token1Amount,
    tokenPrice,
    formattedTimestamp: moment.unix(order.timeStamp).format("h:mm:ssa d MMM D"),
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy",
  }
  return order
  //console.log(order)
}
//orderbook
const openOrders = (state) => {
  const all = allOrders(state)
  const cancel = cancelOrders(state)
  const filled = filledOrders(state)
  if (!all || !cancel || !filled) {
    return
  }
  let newOrders = reject(all, (o) => {
    return cancel.some((c) => {
      return c.id.toString() === o.id.toString()
    })
  })

  newOrders = reject(newOrders, (o) => {
    return filled.some((c) => {
      return c.id.toString() === o.id.toString()
    })
  })

  return newOrders
}

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, token) => {
    if (!token[0] || !token[1] || !orders) {
      return
    }

    orders = orders.filter(
      (o) => o.tokenGet === token[0].address || o.tokenGet === token[1].address
    )
    orders = orders.filter(
      (o) =>
        o.tokenGive === token[0].address || o.tokenGive === token[1].address
    )

    orders = orders.map((o) => {
      return decorateOrder(o, token)
    })

    orders = groupBy(orders, "orderType")

    const buyOrders = get(orders, "buy", [])

    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    }

    const sellOrders = get(orders, "sell", [])

    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    }

    return orders
  }
)

export const priceChatSelector = createSelector(
  filledOrders,
  tokens,
  (orders, token) => {
    if (!token[0] || !token[1] || !orders) {
      return
    }

    orders = orders.filter(
      (o) => o.tokenGet === token[0].address || o.tokenGet === token[1].address
    )
    orders = orders.filter(
      (o) =>
        o.tokenGive === token[0].address || o.tokenGive === token[1].address
    )
    if (orders.length <= 1) {
      let series = [
        {
          data: [
            {
              x: new Date(),
              y: [0, 0, 0, 0],
            },
          ],
        },
      ]
      return {
        lastPrice: 0,
        series,
        priceStatus: false,
      }
    }
    //sort order from ascending order
    orders = orders.sort((a, b) => a.timeStamp - b.timeStamp)

    orders = orders.map((o) => {
      return decorateOrder(o, token)
    })
    //Get token last price
    const lastPrice = orders[orders.length - 1]
    console.log(lastPrice.tokenPrice)

    const secondLastPrice = orders[orders.length - 2]
    console.log(secondLastPrice.tokenPrice)

    //Group orders by hours
    orders = groupBy(orders, (o) =>
      moment.unix(o.timeStamp).startOf("hour").format()
    )

    console.log(orders)
    let series = buildGraphData(orders)
    return {
      lastPrice: lastPrice.tokenPrice,
      series,
      priceStatus: secondLastPrice.tokenPrice < lastPrice.tokenPrice,
    }
  }
)

const buildGraphData = (orders) => {
  let hours = Object.keys(orders)

  let series

  series = hours.map((o) => {
    const group = orders[o]

    const open = group[0]
    const high = maxBy(group, "tokenPrice")
    const low = minBy(group, "tokenPrice")
    const close = group[group.length - 1]

    return {
      data: [
        {
          x: new Date(o),
          y: [
            open.tokenPrice,
            high.tokenPrice,
            low.tokenPrice,
            close.tokenPrice,
          ],
        },
      ],
    }
  })
  console.log(series)
  return series
}

export const filledOrderSelector = createSelector(
  filledOrders,
  tokens,
  (orders, token) => {
    if (!token[0] || !token[1] || !orders) {
      return
    }

    orders = orders.filter(
      (o) => o.tokenGet === token[0].address || o.tokenGet === token[1].address
    )
    orders = orders.filter(
      (o) =>
        o.tokenGive === token[0].address || o.tokenGive === token[1].address
    )
    if (orders.length < 1) {
      return
    }

    //sort order from ascending order
    orders = orders.sort((a, b) => a.timeStamp - b.timeStamp)

    orders = orders.map((o) => {
      return decorateOrder(o, token)
    })

    orders = decorateFilledOrder(orders)

    return orders
  }
)

const decorateFilledOrder = (orders) => {
  let prevOrder = orders[0]
  let newOrder
  newOrder = orders.map((o) => {
    if (o.id.toString() === prevOrder.id.toString()) {
      return {
        ...o,
        tokenPriceClass: GREEN,
      }
    }

    if (o.tokenPrice > prevOrder.tokenPrice) {
      prevOrder = o
      return {
        ...o,
        tokenPriceClass: GREEN,
      }
    } else {
      prevOrder = o
      return {
        ...o,
        tokenPriceClass: RED,
      }
    }
  })

  return newOrder
}
export const myOpenOrdersSelector = createSelector(
  accounts,
  openOrders,
  tokens,
  (account, orders, token) => {
    if (!token[0] || !token[1] || !orders) {
      return
    }
    if (orders.length < 1 || !account) {
      return
    }
    //To get orders based on selected token
    orders = orders.filter(
      (o) => o.tokenGet === token[0].address || o.tokenGet === token[1].address
    )
    orders = orders.filter(
      (o) =>
        o.tokenGive === token[0].address || o.tokenGive === token[1].address
    )

    orders = orders.filter((o) => {
      return o.user.toUpperCase().includes(account.toUpperCase())
    })

    orders = orders.map((o) => {
      o = decorateOrder(o, token)
      if (o.orderType === "sell") {
        return {
          ...o,
          OrderTypeClass: RED,
        }
      } else {
        return {
          ...o,
          OrderTypeClass: GREEN,
        }
      }
    })
    //sort order from decending order
    orders = orders.sort((a, b) => b.timeStamp - a.timeStamp)

    return orders
  }
)

export const myfilledOrdersSelector = createSelector(
  accounts,
  filledOrders,
  tokens,
  (account, orders, token) => {
    if (!token[0] || !token[1] || !orders) {
      return
    }
    if (orders.length < 1 || !account) {
      return
    }
    //To get orders based on selected token
    orders = orders.filter(
      (o) => o.tokenGet === token[0].address || o.tokenGet === token[1].address
    )
    orders = orders.filter(
      (o) =>
        o.tokenGive === token[0].address || o.tokenGive === token[1].address
    )

    orders = orders.filter((o) => {
      return o.user.toUpperCase().includes(account.toUpperCase())
    })

    orders = orders.map((o) => {
      o = decorateOrder(o, token)
      if (o.orderType === "sell") {
        return {
          ...o,
          OrderTypeClass: RED,
        }
      } else {
        return {
          ...o,
          OrderTypeClass: GREEN,
        }
      }
    })
    //sort order from decending order
    orders = orders.sort((a, b) => b.timeStamp - a.timeStamp)

    return orders
  }
)
