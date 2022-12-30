import dapp from "../assets/dapp.svg"
import eth from "../assets/eth.svg"
import { useSelector } from "react-redux"
import { loadBalance, transferTokens } from "../store/interactions"
import { useDispatch } from "react-redux"
import { useEffect, useState, useRef } from "react"

const Balance = () => {
  const [isDeposit, setISDeposit] = useState(true)

  const deposit = useRef()
  const withdraw = useRef()

  const [token1TransferAmount, setToken1TransferAmount] = useState(0)
  const [token2TransferAmount, setToken2TransferAmount] = useState(0)
  const symbol = useSelector((state) => state.tokens.symbols)

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

  const amountHandler = (e, token) => {
    if (token.address === tokens[0].address) {
      setToken1TransferAmount(e.target.value)
    } else {
      setToken2TransferAmount(e.target.value)
    }
  }

  //Step1: do transfer----> done
  //Step2: Notify app thet transfer is pending--->done
  //Step3: Get Confirmation from blockchain that transfer was successfull
  //Step 4: Notify app thet deposit was successfull
  //Step 4: Notify app thet deposit was fail

  const depositHandler = (e) => {
    e.preventDefault()

    if (account) {
      if (isDeposit) {
        transferTokens(
          provider,
          exchange,
          "Deposit",
          tokens[0],
          token1TransferAmount,
          dispatch
        )
        setToken1TransferAmount(0)
      } else {
        transferTokens(
          provider,
          exchange,
          "Withdraw",
          tokens[0],
          token1TransferAmount,
          dispatch
        )
        setToken1TransferAmount(0)
      }
    }
  }

  const depositHandler1 = (e) => {
    e.preventDefault()
    if (account) {
      if (isDeposit) {
        transferTokens(
          provider,
          exchange,
          "Deposit",
          tokens[1],
          token2TransferAmount,
          dispatch
        )
        setToken2TransferAmount(0)
      } else {
        transferTokens(
          provider,
          exchange,
          "Withdraw",
          tokens[1],
          token2TransferAmount,
          dispatch
        )
        setToken2TransferAmount(0)
      }
    }
  }

  const tabHandler = (e) => {
    if (e.target.className !== deposit.current.className) {
      withdraw.current.className = "tab tab--active"
      deposit.current.className = "tab"
      setISDeposit(false)
    } else {
      withdraw.current.className = "tab"
      deposit.current.className = "tab tab--active"
      setISDeposit(true)
    }
  }
  //Load Balance
  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalance(exchange, tokens, account, dispatch)
    }
  }, [exchange, tokens, account, dispatch, transferInprogress])

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button
            className="tab tab--active"
            ref={deposit}
            onClick={tabHandler}
          >
            Deposit
          </button>
          <button
            className="tab"
            ref={withdraw}
            onClick={tabHandler}
          >
            Withdraw
          </button>
        </div>
      </div>
      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img
              src={dapp}
              alt="Token Logo"
            ></img>
            {symbol[0]}
          </p>

          <p>
            <small>Wallet</small>
            <br />
            {tokenBalance[0]}
          </p>

          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalance[0]}
          </p>
        </div>

        <form onSubmit={(e) => depositHandler(e)}>
          <label htmlFor="token0">{symbol[0]} Amount</label>
          <input
            type="text"
            id="token0"
            placeholder="0.0000"
            value={token1TransferAmount === 0 ? "" : token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])}
          />

          <button
            className="button"
            type="submit"
          >
            <span>{isDeposit ? "Deposit" : "Withdraw"}</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img
              src={eth}
              alt="Token Logo"
            ></img>
            {symbol[1]}
          </p>

          <p>
            <small>Wallet</small>
            <br />
            {tokenBalance[1]}
          </p>

          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalance[1]}
          </p>
        </div>

        <form onSubmit={(e) => depositHandler1(e)}>
          <label htmlFor="token1"></label>
          <input
            type="text"
            id="token1"
            placeholder="0.0000"
            value={token2TransferAmount === 0 ? "" : token2TransferAmount}
            onChange={(e) => amountHandler(e, tokens[1])}
          />

          <button
            className="button"
            type="submit"
          >
            <span>{isDeposit ? "Deposit" : "Withdraw"}</span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  )
}

export default Balance
