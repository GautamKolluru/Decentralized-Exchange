const { ethers } = require("hardhat")
const { expect } = require("chai")

const tokens = (arg) => {
  const value = ethers.utils.parseUnits(arg.toString(), "ether")
  return value
}

describe("Exchange Contract", () => {
  let deployExchange,
    deployToken,
    accounts,
    deployerAccount,
    feeAccount,
    user1,
    deployToken2,
    user2
  const feePercent = 10
  beforeEach(async () => {
    //Fetch token from block chain
    accounts = await ethers.getSigners()
    deployerAccount = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]
    user2 = accounts[3]
    const Exchange = await ethers.getContractFactory("Exchange")
    const Token = await ethers.getContractFactory("Token")
    deployExchange = await Exchange.deploy(feeAccount.address, feePercent)
    deployToken = await Token.deploy("Dapp University", "DAPP", "1000000")
    deployToken2 = await Token.deploy("Mock Dai", "mDAI", "1000000")
  })
  describe("Deployment", () => {
    it("track the fee account", async () => {
      //Read name
      expect(await deployExchange.feeAccount()).to.equal(feeAccount.address)
    })
    it("track the fee percent", async () => {
      //Read name
      expect(await deployExchange.feePercent()).to.equal(feePercent)
    })
  })

  describe("Depositing Token", async () => {
    let transcation, approveResult, transcation1, depositResult

    beforeEach(async () => {
      transcation = await deployToken
        .connect(deployerAccount)
        .approve(deployExchange.address, tokens(100))
      approveResult = await transcation.wait()

      transcation1 = await deployExchange
        .connect(deployerAccount)
        .depositToken(deployToken.address, tokens(100))
      depositResult = await transcation1.wait()
    })

    it("Transfer token", async () => {
      //Read name

      expect(
        await deployExchange.tokens(
          deployToken.address,
          deployerAccount.address
        )
      ).to.equal(tokens(100))
      expect(
        await deployExchange.balanceof(
          deployToken.address,
          deployerAccount.address
        )
      ).to.equal(tokens(100))
    })
    it("Emit Deposit event", async () => {
      expect(depositResult.events[1].event).to.equal("Deposite")
      let args = depositResult.events[1].args
      expect(deployToken.address).to.equal(args.token)
      expect(deployerAccount.address).to.equal(args.user)
      expect(args.balance).to.equal(tokens(100))
    })
  })

  describe("Withdrawing Token", async () => {
    let transcation, approveResult, transcation1, depositResult, withdrawResult

    beforeEach(async () => {
      await deployToken
        .connect(deployerAccount)
        .transfer(user1.address, tokens(100))

      transcation = await deployToken
        .connect(user1)
        .approve(deployExchange.address, tokens(100))
      approveResult = await transcation.wait()

      transcation1 = await deployExchange
        .connect(user1)
        .depositToken(deployToken.address, tokens(100))
      depositResult = await transcation1.wait()

      transcation = await deployExchange
        .connect(user1)
        .withdrawToken(deployToken.address, tokens(100))
      withdrawResult = await transcation.wait()
    })
    describe("Success", async () => {
      it("User withdraw token", async () => {
        expect(await deployToken.balanceOf(deployExchange.address)).to.equal(
          tokens(0)
        )

        expect(
          await deployExchange.balanceof(deployToken.address, user1.address)
        ).to.equal(tokens(0))
      })
      it("Emit Withdraw event", async () => {
        expect(withdrawResult.events[1].event).to.equal("Withdraw")
        let args = withdrawResult.events[1].args
        expect(deployToken.address).to.equal(args.token)
        expect(user1.address).to.equal(args.user)
        expect(args.balance).to.equal(tokens(0))
      })
    })
    describe("Failure", async () => {
      it("fail for insufficient balance", async () => {
        await expect(
          deployExchange
            .connect(user1)
            .withdrawToken(deployToken.address, tokens(100))
        ).to.be.rejected
      })
    })
  })

  describe("Make Order", async () => {
    let transcation, approveResult, transcation1, depositResult, makeorderResult

    beforeEach(async () => {
      await deployToken
        .connect(deployerAccount)
        .transfer(user1.address, tokens(100))

      transcation = await deployToken
        .connect(user1)
        .approve(deployExchange.address, tokens(100))
      approveResult = await transcation.wait()

      transcation1 = await deployExchange
        .connect(user1)
        .depositToken(deployToken.address, tokens(100))
      depositResult = await transcation1.wait()

      transcation = await deployExchange
        .connect(user1)
        .makeOrder(
          deployToken2.address,
          tokens(100),
          deployToken.address,
          tokens(100)
        )
      makeorderResult = await transcation.wait()
    })
    describe("Success", async () => {
      it("track the newly created order ", async () => {
        expect(await deployExchange.orderCount()).to.be.equal(1)
      })
      it("emit order event ", async () => {
        expect(makeorderResult.events[0].event).to.equal("Order")
        let args = makeorderResult.events[0].args
        expect(user1.address).to.equal(args.user)
        expect(deployToken2.address).to.equal(args.tokenGet)
        expect(deployToken.address).to.equal(args.tokenGive)
        expect(args.amountGive).to.equal(tokens(100))
      })
    })
    describe("Failure", async () => {
      it("User with insufficient balance ", async () => {
        await expect(
          deployExchange
            .connect(user1)
            .makeOrder(
              deployToken2.address,
              tokens(100),
              deployToken.address,
              tokens(10000)
            )
        ).to.be.rejected
      })
    })
  })

  describe("Order actions", async () => {
    let transcation, approveResult, transcation1, depositResult, makeorderResult

    beforeEach(async () => {
      //Token transfer
      await deployToken
        .connect(deployerAccount)
        .transfer(user1.address, tokens(1))
      //Approve token
      transcation = await deployToken
        .connect(user1)
        .approve(deployExchange.address, tokens(1))
      approveResult = await transcation.wait()
      //Deposit Token
      transcation1 = await deployExchange
        .connect(user1)
        .depositToken(deployToken.address, tokens(1))
      depositResult = await transcation1.wait()
      //Create Order
      transcation = await deployExchange
        .connect(user1)
        .makeOrder(
          deployToken2.address,
          tokens(1),
          deployToken.address,
          tokens(1)
        )
      makeorderResult = await transcation.wait()
    })
    describe("Cancelling Orders", async () => {
      beforeEach(async () => {
        //Cancel Order
        transcation = await deployExchange.connect(user1).cancelOrder(1)
        makeorderResult = await transcation.wait()
      })
      describe("Success", async () => {
        it("updates cancel orders", async () => {
          expect(true).to.be.equal(await deployExchange.orderCancelled(1))
        })
        it("emit a Cancel event ", async () => {
          expect(makeorderResult.events[0].event).to.equal("CancelOrder")
          let args = makeorderResult.events[0].args
          expect(user1.address).to.equal(args.user)
          expect(deployToken2.address).to.equal(args.tokenGet)
          expect(deployToken.address).to.equal(args.tokenGive)
          expect(args.amountGive).to.equal(tokens(1))
        })
      })
      describe("Failure", async () => {
        it("Rejects invalid Order id", async () => {
          await expect(deployExchange.connect(user1).cancelOrder(0)).to.be
            .rejected
        })
        it("Rejects Unauthorize cancellation", async () => {
          await expect(deployExchange.connect(user2).cancelOrder(1)).to.be
            .rejected
        })
      })
    })
    describe("Filling orders", async () => {
      beforeEach(async () => {
        //Token transfer
        await deployToken2
          .connect(deployerAccount)
          .transfer(user2.address, tokens(2))
        //Approve token
        transcation = await deployToken2
          .connect(user2)
          .approve(deployExchange.address, tokens(2))
        approveResult = await transcation.wait()
        //Deposit Token
        transcation1 = await deployExchange
          .connect(user2)
          .depositToken(deployToken2.address, tokens(2))
        depositResult = await transcation1.wait()
      })

      describe("Success", async () => {
        it("executes trade and charge fee", async () => {
          transcation = await deployExchange.connect(user2).fillOrder(1)
          makeorderResult = await transcation.wait()
          //Token Give
          expect(
            await deployExchange.balanceof(deployToken.address, user1.address)
          ).to.equal(tokens(0))
          expect(
            await deployExchange.balanceof(deployToken.address, user2.address)
          ).to.equal(tokens(1))
          expect(
            await deployExchange.balanceof(
              deployToken.address,
              feeAccount.address
            )
          ).to.equal(tokens(0))

          //Token Get
          expect(
            await deployExchange.balanceof(deployToken2.address, user1.address)
          ).to.equal(tokens(1))
          expect(
            await deployExchange.balanceof(deployToken2.address, user2.address)
          ).to.equal(tokens(0.9))
          expect(
            await deployExchange.balanceof(
              deployToken2.address,
              feeAccount.address
            )
          ).to.equal(tokens(0.1))
        })
        it("update filled order", async () => {
          transcation = await deployExchange.connect(user2).fillOrder(1)
          makeorderResult = await transcation.wait()
          expect(await deployExchange.orderFilled(1)).to.equal(true)
        })
        it("emits Trade event", async () => {
          transcation = await deployExchange.connect(user2).fillOrder(1)
          makeorderResult = await transcation.wait()
          expect(makeorderResult.events[0].event).to.equal("Trade")
          let args = makeorderResult.events[0].args
          expect(user1.address).to.equal(args.user)
          expect(deployToken2.address).to.equal(args.tokenGet)
          expect(deployToken.address).to.equal(args.tokenGive)
          expect(args.amountGive).to.equal(tokens(1))
        })
      })
      describe("Failure", async () => {
        it("rejects invalid order id", async () => {
          transcation = await deployExchange.connect(user2).fillOrder(1)
          makeorderResult = await transcation.wait()
          await expect(deployExchange.connect(user2).fillOrder(100)).to.be
            .rejected
        })
        it("rejects already filled order", async () => {
          transcation = await deployExchange.connect(user2).fillOrder(1)
          makeorderResult = await transcation.wait()
          await expect(deployExchange.connect(user2).fillOrder(1)).to.be
            .rejected
        })
        it("rejects already cancelled order", async () => {
          transcation = await deployExchange.connect(user1).cancelOrder(1)
          makeorderResult = await transcation.wait()
          await expect(deployExchange.connect(user2).fillOrder(1)).to.be
            .rejected
        })
      })
    })
  })
})
