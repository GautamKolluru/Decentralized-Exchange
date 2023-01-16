require("@nomicfoundation/hardhat-toolbox")
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, ".env") })
const privateKeys = process.env.PRIVATE_KEYS || ""

console.log(process.env)

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {},
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: privateKeys.split(","),
    },
  },
}
