import config from "../config.json"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { loadTokens } from "../store/interactions"

const Markets = () => {
  const dispatch = useDispatch()
  const chainId = useSelector((state) => state.provider.chainId)
  let provider = useSelector((state) => state.provider.connection)

  const marketHandler = async (e) => {
    console.log("market")
    await loadTokens(provider, e.target.value.split(","), dispatch)
  }

  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>Select Market</h2>
        {chainId && config[chainId] ? (
          <select
            name="markets"
            id="markets"
            onChange={marketHandler}
          >
            <option
              value={`${config[chainId].DApp.address},${config[chainId].mETH.address}`}
            >
              DApp/mEth
            </option>
            <option
              value={`${config[chainId].DApp.address},${config[chainId].mDAI.address}`}
            >
              DApp/mDAI
            </option>
          </select>
        ) : (
          <p>Network not loaded</p>
        )}
      </div>

      <hr />
    </div>
  )
}

export default Markets
