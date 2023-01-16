import sort from "../assets/sort.svg"
import { useSelector } from "react-redux"
import { filledOrderSelector } from "../store/selectors"
import Banner from "./Banner"

const Trades = () => {
  const symbols = useSelector((state) => state.tokens.symbols)
  const trade = useSelector(filledOrderSelector)
  return (
    <div className="component exchange__trades">
      <div className="component__header flex-between">
        <h2>Trades</h2>
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
          {trade ? (
            trade.map((t, index) => {
              return (
                <tr key={index}>
                  <td>{t.formattedTimestamp}</td>
                  <td style={{ color: t.tokenPriceClass }}>{t.token0Amount}</td>
                  <td>{t.tokenPrice}</td>
                </tr>
              )
            })
          ) : (
            <Banner text="No Transcation" />
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Trades
