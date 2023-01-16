import Banner from "./Banner"
import { useSelector } from "react-redux"
import Chart from "react-apexcharts"
import { options, series } from "./PriceChart.config"
import { priceChatSelector } from "../store/selectors"
import arrowDown from "../assets/down-arrow.svg"
import arrowUP from "../assets/up-arrow.svg"

const PriceChart = () => {
  let account = useSelector((state) => state.provider.account)
  let symbols = useSelector((state) => state.tokens.symbols)
  let customseries = useSelector(priceChatSelector)

  return (
    <div className="component exchange__chart">
      <div className="component__header flex-between">
        <div className="flex">
          <h2>{`${symbols[0]} / ${symbols[1]}`}</h2>
          <div className="flex">
            {account ? (
              <div>
                <img
                  src={
                    customseries && customseries.priceStatus
                      ? arrowUP
                      : arrowDown
                  }
                  alt="Arrow down"
                />
                <span className="up">
                  {customseries && customseries.lastPrice}
                </span>
              </div>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
      {!account ? (
        <Banner text={"Please Connect MetaMask Wallet"} />
      ) : (
        <Chart
          options={options}
          series={customseries && customseries.series}
          type="candlestick"
          width="100%"
          height="100%"
        />
      )}
    </div>
  )
}

export default PriceChart
