const Order = () => {
  return (
    <div className="component exchange__orders">
      <div className="component__header flex-between">
        <h2>New Order</h2>
        <div className="tabs">
          <button className="tab tab--active">Buy</button>
          <button className="tab">Sell</button>
        </div>
      </div>

      <form>
        <input
          type="text"
          id="amount"
          placeholder="0.0000"
        />

        <input
          type="text"
          id="price"
          placeholder="0.0000"
        />

        <button
          className="button button--filled"
          type="submit"
        ></button>
      </form>
    </div>
  )
}

export default Order
