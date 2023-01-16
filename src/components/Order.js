import { useRef, useState } from "react"
import { makeBuyOrder, makeSellOrder } from "../store/interactions"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"

const Order = () => {
  const [isBuy, setIsBuy] = useState(true)
  const [amount, setAmount] = useState(0)
  const [price, setPrice] = useState(0)

  const dispatch = useDispatch()
  let account = useSelector((state) => state.provider.account)
  let tokens = useSelector((state) => state.tokens.contracts)
  let exchange = useSelector((state) => state.exchange.contracts)

  let tokenBalance = useSelector((state) => state.tokens.balances)
  let exchangeBalance = useSelector((state) => state.exchange.balances)

  let provider = useSelector((state) => state.provider.connection)
  let transferInprogress = useSelector(
    (state) => state.exchange.transferInprogress
  )

  let buy = useRef(null)
  let sell = useRef(null)
  const tabHandler = (e) => {
    if (e.target.className !== buy.current.className) {
      sell.current.className = "tab tab--active"
      buy.current.className = "tab"
      setIsBuy(false)
    } else {
      sell.current.className = "tab"
      buy.current.className = "tab tab--active"
      setIsBuy(true)
    }
  }

  const buyHandler = (e) => {
    e.preventDefault()
    console.log("buy order")
    makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
    setAmount(0)
    setPrice(0)
  }
  const sellHandler = (e) => {
    e.preventDefault()
    makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch)
    setAmount(0)
    setPrice(0)
  }
  return (
    <div className="component exchange__orders">
      <div className="component__header flex-between">
        <h2>New Order</h2>
        <div className="tabs">
          <button
            ref={buy}
            className="tab tab--active"
            onClick={tabHandler}
          >
            Buy
          </button>
          <button
            ref={sell}
            className="tab"
            onClick={tabHandler}
          >
            Sell
          </button>
        </div>
      </div>

      <form onSubmit={isBuy ? buyHandler : sellHandler}>
        {isBuy ? (
          <label htmlFor="amount">Buy Amount </label>
        ) : (
          <label htmlFor="amount">Sell Amount </label>
        )}
        <input
          type="text"
          id="amount"
          placeholder="0.0000"
          value={amount === 0 ? "" : amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {isBuy ? (
          <label htmlFor="price">Buy Price </label>
        ) : (
          <label htmlFor="price">Sell Price </label>
        )}
        <input
          type="text"
          id="price"
          placeholder="0.0000"
          value={price === 0 ? "" : price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          className="button button--filled"
          type="submit"
        >
          {isBuy ? <span>Buy Order</span> : <span>Sell Order</span>}
        </button>
      </form>
    </div>
  )
}

export default Order
