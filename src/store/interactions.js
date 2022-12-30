import { ethers } from "ethers"
import TOKEN_ABI from "../abis/Token.json"
import EXCHANGE_ABI from "../abis/Exchange.json"

export const loadProvider = (dispatch) => {
  const connection = new ethers.providers.Web3Provider(window.ethereum)
  dispatch({ type: "PROVIDER_LOADED", connection })
  return connection
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch({ type: "NETWORK_LOADED", chainId })
  return chainId
}

export const loadAccount = async (dispatch, provider) => {
  let account = await window.ethereum.request({
    method: "eth_requestAccounts",
  })
  let balance = ethers.utils.formatEther(await provider.getBalance(account[0]))
  account = account[0]
  dispatch({ type: "ACCOUNT_LOADED", account })
  dispatch({ type: "ETHER_BALANCE_LOADED", balance })
  return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
  let symbols, tokens
  tokens = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
  symbols = await tokens.symbol()
  dispatch({ type: "TOKEN_1_LOADED", tokens, symbols })

  tokens = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
  symbols = await tokens.symbol()

  dispatch({ type: "TOKEN_2_LOADED", tokens, symbols })
}

export const loadExchange = async (provider, address, dispatch) => {
  let exchange
  exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
  dispatch({ type: "EXCHANGE_LOADED", exchange })
  return exchange
}

export const subscribeToEvent = (exchange, dispatch) => {
  exchange.on("Deposite", (token, user, amount, balance, event) => {
    dispatch({ type: "TRANSFER_SUCCESS", event })
  })
  exchange.on("Withdraw", (token, user, amount, balance, event) => {
    dispatch({ type: "TRANSFER_SUCCESS", event })
  })
}
//Load User Balance (Wallet and exchange)

export const loadBalance = async (exchange, tokens, account, dispatch) => {
  let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
  dispatch({ type: "TOKEN_1_BALANCE_LOADED", balance })

  balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
  dispatch({ type: "TOKEN_2_BALANCE_LOADED", balance })

  balance = ethers.utils.formatUnits(
    await exchange.balanceof(tokens[0].address, account),
    18
  )
  dispatch({ type: "EXCHANGE_TOKEN_1_BALANCE_LOADED", balance })

  balance = ethers.utils.formatUnits(
    await exchange.balanceof(tokens[1].address, account),
    18
  )
  dispatch({ type: "EXCHANGE_TOKEN_2_BALANCE_LOADED", balance })
}
export const transferTokens = async (
  provider,
  exchange,
  transferType,
  token,
  amount,
  dispatch
) => {
  dispatch({ type: "TRANSFER_REQUEST" })
  let transcation
  try {
    const signer = await provider.getSigner()

    const amountToTransfer = ethers.utils.parseUnits(
      Number(amount).toString(),
      18
    )
    if (transferType === "Deposit") {
      transcation = await token
        .connect(signer)
        .approve(exchange.address, amountToTransfer)
      await transcation.wait()

      transcation = await exchange
        .connect(signer)
        .depositToken(token.address, amountToTransfer)
      await transcation.wait()
    } else {
      transcation = await exchange
        .connect(signer)
        .withdrawToken(token.address, amountToTransfer)
      await transcation.wait()
    }
  } catch (error) {
    console.log(error)
    dispatch({ type: "TRANSFER_FAIL" })
  }
}