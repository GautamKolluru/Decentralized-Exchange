import { useEffect } from "react"
import { useDispatch } from "react-redux"
import config from "../config.json"
import Navbar from "./Navbar"
import Markets from "./Markets"
import Balance from "./Balance"
import Order from "./Order"
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvent,
} from "../store/interactions"

function App() {
  const dispatch = useDispatch()

  const loadBlockChainData = async () => {
    //Connect Ether to blockchain
    const provider = loadProvider(dispatch)

    //Fetch current networks chainID(e.g. hardhat:31337,kovan:42)
    const chainId = await loadNetwork(provider, dispatch)

    //Reload page when network changes
    window.ethereum.on("chainChanged", () => {
      window.location.reload()
    })
    //Fetch current acount and balance from metamask when changed
    window.ethereum.on("accountsChanged", () => {
      loadAccount(dispatch, provider)
    })

    //Load Token Smart Contract
    const DApp = config[chainId].DApp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)

    //Load Exchange smart contract
    const exchangeConfig = config[chainId].exchange
    let exchange = await loadExchange(
      provider,
      exchangeConfig.address,
      dispatch
    )

    //Listen to events
    subscribeToEvent(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockChainData()
  }, [loadBlockChainData])
  return (
    <div>
      <Navbar />
      <main className="exchange grid">
        <section className="exchange__section--left grid">
          <Markets />

          <Balance />

          <Order />
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  )
}

export default App
