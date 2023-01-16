import { useSelector } from "react-redux"
import { useRef, useState } from "react"
import {
  myOpenOrdersSelector,
  myfilledOrdersSelector,
} from "../store/selectors"
import { cancelOrder } from "../store/interactions"
import sort from "../assets/sort.svg"
import { useDispatch } from "react-redux"

const Transactions = () => {
  const dispatch = useDispatch()
  let provider = useSelector((state) => state.provider.connection)
  let exchange = useSelector((state) => state.exchange.contracts)

  const openOrders = useSelector(myOpenOrdersSelector)
  const filledOrders = useSelector(myfilledOrdersSelector)
  const symbols = useSelector((state) => state.tokens.symbols)
  let order = useRef()
  let transcation = useRef()
  let [showOrder, setOrder] = useState(true)

  const tabHandler = (e) => {
    if (e.target.className !== transcation.current.className) {
      order.current.className = "tab tab--active"
      transcation.current.className = "tab"
      setOrder(true)
    } else {
      order.current.className = "tab"
      transcation.current.className = "tab tab--active"
      setOrder(false)
    }
  }

  const cancelHandler = (order) => {
    cancelOrder(provider, exchange, order, dispatch)
  }
  return (
    <div className="component exchange__transactions">
      {showOrder ? (
        <div>
          <div className="component__header flex-between">
            <h2>My Orders</h2>

            <div className="tabs">
              <button
                onClick={tabHandler}
                ref={order}
                className="tab tab--active"
              >
                Orders
              </button>
              <button
                onClick={tabHandler}
                ref={transcation}
                className="tab"
              >
                Trades
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                {/* <th>
                  Time
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th> */}
                <th>
                  {symbols[0]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
                <th>
                  {`${symbols[0]}/${symbols[1]}`}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
              </tr>
            </thead>
            <tbody>
              {openOrders &&
                openOrders.map((o, index) => {
                  return (
                    <tr key={index}>
                      <td style={{ color: o.OrderTypeClass }}>
                        {o.token0Amount}
                      </td>
                      <td>{o.tokenPrice}</td>
                      <td>
                        <button
                          className="button--sm"
                          onClick={() => cancelHandler(o)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="component__header flex-between">
            <h2>My Transactions</h2>

            <div className="tabs">
              <button
                onClick={tabHandler}
                ref={order}
                className="tab tab--active"
              >
                Orders
              </button>
              <button
                onClick={tabHandler}
                ref={transcation}
                className="tab"
              >
                Trades
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>
                  Time
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
                <th>
                  {symbols[0]}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
                <th>
                  {`${symbols[0]}/${symbols[1]}`}
                  <img
                    src={sort}
                    alt="Sort"
                  ></img>
                </th>
              </tr>
            </thead>
            <tbody>
              {filledOrders &&
                filledOrders.map((o, index) => {
                  return (
                    <tr key={index}>
                      <td> {o.formattedTimestamp}</td>
                      <td style={{ color: o.OrderTypeClass }}>
                        {o.token0Amount}
                      </td>
                      <td>{o.tokenPrice}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Transactions
