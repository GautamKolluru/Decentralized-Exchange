import sort from "../assets/sort.svg"
import { useSelector } from "react-redux"
import { orderBookSelector } from "../store/selectors"
import { fillOrder } from "../store/interactions"
import { useDispatch } from "react-redux"

const OrderBook = () => {
  const dispatch = useDispatch()
  let provider = useSelector((state) => state.provider.connection)
  let exchange = useSelector((state) => state.exchange.contracts)
  const symbols = useSelector((state) => state.tokens.symbols)
  let orderBook = useSelector(orderBookSelector)

  const fillHandler = (order) => {
    fillOrder(provider, exchange, order, dispatch)
  }

  return (
    <div className="component exchange__orderbook">
      <div className="component__header flex-between">
        <h2>Order Book</h2>
      </div>

      <div className="flex">
        {!orderBook || orderBook.sellOrders.length === 0 ? (
          <p className="flex-center">No Sell Orders</p>
        ) : (
          <table className="exchange__orderbook--sell">
            <caption>Selling</caption>
            <thead>
              <tr>
                <th>
                  {symbols && symbols[0]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
                <th>
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
                <th>
                  {symbols && symbols[1]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
              </tr>
            </thead>
            <tbody>
              {orderBook.sellOrders.map((o, index) => {
                return (
                  <tr
                    key={index}
                    onClick={() => fillHandler(o)}
                  >
                    <td>{o.token0Amount}</td>
                    <td style={{ color: o.orderTypeClass }}>{o.tokenPrice}</td>
                    <td>{o.token1Amount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <div className="divider"></div>
        {!orderBook || orderBook.buyOrders.length === 0 ? (
          <p className="flex-center">No Buy Orders</p>
        ) : (
          <table className="exchange__orderbook--buy">
            <caption>Buying</caption>
            <thead>
              <tr>
                <th>
                  {symbols && symbols[0]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
                <th>
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
                <th>
                  {symbols && symbols[1]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
              </tr>
            </thead>
            <tbody>
              {orderBook.buyOrders.map((o, index) => {
                return (
                  <tr
                    key={index}
                    onClick={() => fillHandler(o)}
                  >
                    <td>{o.token0Amount}</td>
                    <td style={{ color: o.orderTypeClass }}>{o.tokenPrice}</td>
                    <td>{o.token1Amount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default OrderBook
