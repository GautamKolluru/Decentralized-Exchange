const { ethers } = require("hardhat")
const { expect } = require("chai")

const tokens = (arg) => {
  const value = ethers.utils.parseUnits(arg.toString(), "ether")
  return value
}

describe("Token Contract", () => {
  let deploy, accounts, deployerAccount, receiverAccount, spenderAccount
  beforeEach(async () => {
    //Fetch token from block chain
    const Token = await ethers.getContractFactory("Token")
    deploy = await Token.deploy("Dapp University", "DAPP", "1000000")
    accounts = await ethers.getSigners()
    deployerAccount = accounts[0]
    receiverAccount = accounts[1]
    spenderAccount = accounts[2]
  })
  describe("Deployment", () => {
    const name = "Dapp University"
    const symbol = "DAPP"
    const decimal = "18"
    const totalSupply = "1000000"
    it("has correct name", async () => {
      //Read name
      expect(await deploy.name()).to.equal(name)
    })

    it("has correct symbol", async () => {
      //Read name
      expect(await deploy.symbol()).to.equal(symbol)
    })

    it("has correct decimals", async () => {
      //Read name

      expect(await deploy.decimals()).to.equal(decimal)
    })

    it("has correct totalsupply", async () => {
      expect(await deploy.totalSupply()).to.equal(tokens(totalSupply))
    })
    it("has correct totalsupply assigned to deployer", async () => {
      expect(await deploy.balanceOf(deployerAccount.address)).to.equal(
        tokens(totalSupply)
      )
    })
  })

  describe("Sending Token", () => {
    let transaction, result
    let amount = tokens("100")
    beforeEach(async () => {
      transaction = await deploy
        .connect(deployerAccount)
        .transfer(receiverAccount.address, amount)
      result = await transaction.wait()
    })
    describe("Success", async () => {
      it("Transfer token", async () => {
        expect(await deploy.balanceOf(deployerAccount.address)).to.equal(
          tokens(999900)
        )
        expect(await deploy.balanceOf(receiverAccount.address)).to.equal(
          tokens(100)
        )
      })

      it("Emit event", async () => {
        expect(result.events[0].event).to.equal("Transfer")
        let args = result.events[0].args
        expect(deployerAccount.address).to.equal(args.from)
        expect(receiverAccount.address).to.equal(args.to)
        expect(args.value).to.equal(amount)
      })
    })
    describe("Failure", async () => {
      it("reject insufficient balance", async () => {
        await expect(
          deploy
            .connect(deployerAccount)
            .transfer(receiverAccount.address, tokens("100000000000000000000"))
        ).to.be.rejected
      })

      it("reject invalid receipent", async () => {
        await expect(
          deploy
            .connect(deployerAccount)
            .transfer(
              "0x0000000000000000000000000000000000000000",
              tokens("1000")
            )
        ).to.be.rejected
      })
    })
  })

  describe("Approving Tokens", () => {
    let transaction, result
    let amount = tokens("100")
    beforeEach(async () => {
      transaction = await deploy
        .connect(deployerAccount)
        .approve(spenderAccount.address, amount)
      result = await transaction.wait()
    })
    describe("Success", () => {
      it("allocate an allowance for delegate token spend", async () => {
        expect(
          await deploy.allowance(
            deployerAccount.address,
            spenderAccount.address
          )
        ).to.be.equal(amount)
      })
    })
    describe("Failure", () => {
      it("reject invalid receipent", async () => {
        await expect(
          deploy
            .connect(deployerAccount)
            .approve("0x0000000000000000000000000000000000000000", amount)
        ).to.be.rejected
      })
    })
  })

  describe("Delegate Token Transfer", () => {
    let transaction, result
    let amount = tokens("100")
    beforeEach(async () => {
      transaction = await deploy
        .connect(deployerAccount)
        .approve(spenderAccount.address, amount)
      result = await transaction.wait()
    })

    describe("Success", async () => {
      beforeEach(async () => {
        transaction = await deploy
          .connect(spenderAccount)
          .transferFrom(
            deployerAccount.address,
            receiverAccount.address,
            amount
          )
        result = await transaction.wait()
      })

      it("Transfer Token balance", async () => {
        expect(await deploy.balanceOf(deployerAccount.address)).to.equal(
          tokens(999900)
        )
        expect(await deploy.balanceOf(receiverAccount.address)).to.equal(
          tokens(100)
        )
      })

      it("reset allowence", async () => {
        expect(
          await deploy.allowance(
            deployerAccount.address,
            spenderAccount.address
          )
        ).to.equal(tokens(0))
      })
    })
    describe("Failure", async () => {
      let transaction, result
      let amount = tokens("10000000000")
      it("Spender Insufficient balance", async () => {
        await expect(
          deploy
            .connect(spenderAccount)
            .transferFrom(
              deployerAccount.address,
              receiverAccount.address,
              amount
            )
        ).to.be.rejected
      })

      it("Spender account transfer not approved", async () => {
        await expect(
          deploy
            .connect(deployerAccount)
            .transferFrom(
              deployerAccount.address,
              receiverAccount.address,
              tokens("100")
            )
        ).to.be.rejected
      })
    })
  })
})
