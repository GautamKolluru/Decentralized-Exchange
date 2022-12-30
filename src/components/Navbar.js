import logo from "../assets/logo.png"
import { useSelector } from "react-redux"
import Blockies from "react-blockies"
import { loadAccount, loadNetwork } from "../store/interactions"
import { useDispatch } from "react-redux"
import eth from "../assets/eth.svg"
import config from "../config.json"

const Navbar = () => {
  const dispatch = useDispatch()
  let account = useSelector((state) => state.provider.account)
  let balance = useSelector((state) => state.provider.balance)
  let provider = useSelector((state) => state.provider.connection)
  let chainId = useSelector((state) => state.provider.chainId)
  let networkValue
  const connectHandler = async () => {
    loadAccount(dispatch, provider)
  }

  const networkHandler = async (e) => {
    networkValue = e.target.value
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }],
    })
  }

  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img
          src={logo}
          className="logo"
          alt="DAPP logo"
        ></img>
        <h1>Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img
          src={eth}
          alt="ETH Logo"
          className="Eth Logo"
        />
        <select
          name="networks"
          id="networks"
          value={config[chainId] ? `0x${chainId.toString(16)}` : "0"}
          onChange={networkHandler}
        >
          <option
            value={networkValue ? networkValue : "0"}
            disabled
          >
            Select Network
          </option>
          <option value="0x7A69">Local Host</option>
          <option value="0x5">Goerli</option>
          <option></option>
        </select>
      </div>

      <div className="exchange__header--account flex">
        <p>
          <small>My Balance</small>
          {balance ? Number(balance).toFixed(4) : 0 + " ETH"}
        </p>
        {account ? (
          <a
            href={
              config[chainId]
                ? `${config[chainId].explorerURL}/address/${account}`
                : "#"
            }
            target="_blank"
          >
            {account.slice(0, 5) + "..." + account.slice(38, 42)}
            <Blockies
              seed={account}
              size={10}
              scale={3}
              color="#dfe"
              bgColor="#ffe"
              spotColor="#000"
              className="identicon"
            />
          </a>
        ) : (
          <button
            className="button"
            onClick={connectHandler}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
