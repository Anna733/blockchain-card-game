const {
  constants,
  expectEvent,
  expectRevert,
  balance,
  time,
  ether,
} = require("@openzeppelin/test-helpers");
//const balance = require("@openzeppelin/test-helpers/src/balance");
//const fromWei = web3.utils.fromWei;
//const duration = time.duration;
const BN = web3.utils.BN;
const zero = new BN("0");
// Chai
const chai = require("chai");
chai.use(require("chai-bn")(BN));
const should = require("chai").should();
// Artifacts imports
const Marketplace = artifacts.require("Marketplace");
const Cards = artifacts.require("Cards");

contract("Card marketplace test", (accounts) => {
  let [owner, seller, thirdParty] = accounts;
  let marketplaceInstance;

  describe.only("Card sale", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
      marketplaceInstance = await Marketplace.new(cardsInstance.address);
    });

    it("seller should be able to sell the card", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });
      const result = await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      expectEvent(result, "SellAd", {
        _cardId: cardId,
        _price: price,
      });

      const ad = await marketplaceInstance.getAd(cardId);
      ad.price.should.bignumber.equal(price);
    });

    it("the seller shouldn't be able to sell a card he does not own", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });
      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      await expectRevert(
        marketplaceInstance.sell(cardId, price, thirdParty),
        "Sender must be cardholder"
      );
    });

    it("the seller shouldn't sell a non-existent card", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });
      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      await expectRevert(
        marketplaceInstance.sell(3, price, thirdParty),
        "ERC721: owner query for nonexistent token"
      );
    });
  });

  describe.skip("Ad editing", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
      marketplaceInstance = await Marketplace.new(Cards.address);
    });

    it("seller should be able to edit an ad", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      const checkingForAnOwner = await cardsInstance.ownerOf(cardId);
      console.log(`----${owner}----`);
      console.log(`----${seller}----`);
      console.log(`----${thirdParty}----`);

      console.log(`----${checkingForAnOwner}-----`);

      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });

      const isApproved = await cardsInstance.isApprovedForAll(
        seller,
        marketplaceInstance.address
      );
      console.log(`----${isApproved}-----`);
      console.log(`----${marketplaceInstance.address}-----`);

      const getApprove = await cardsInstance.getApproved(cardId);
      console.log(`----${getApprove}-----`);

      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      let newPrice = new BN(4657);

      const result = await marketplaceInstance.editAd(
        cardId,
        newPrice,
        constants.ZERO_ADDRESS,
        {
          from: seller,
        }
      );

      expectEvent(result, "Edited", {
        _cardId: cardId,
        _newPrice: newPrice,
      });
    });

    it("seller shouldn't be able to edit ad with non-existent card", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });

      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      let newPrice = 4657;

      await expectRevert(
        marketplaceInstance.editAd(3, newPrice, constants.ZERO_ADDRESS, {
          from: seller,
        }),
        "ERC721: owner query for nonexistent token"
      );
    });
  });

  describe.skip("Buying card", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
      marketplaceInstance = await Marketplace.new(Cards.address);
    });

    it("buyer should be able to buy a card", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });
      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });
      const result = await marketplaceInstance.buyCards(cardId, price);

      expectEvent(result, "Bought", {
        _cardId: cardId,
        _price: price,
      });

      const ad = await marketplaceInstance.getAd(cardId);

      ad.price.should.equal(price);
    });

    it("buyer shouldn't be able to buy a non-existent card", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });
      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      await expectRevert(
        marketplaceInstance.buyCards(3, price, thirdParty),
        "ERC721: owner query for nonexistent token"
      );
    });

    it("buyer shouldn't be able to buy a card with insufficient balance", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });
      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      await expectRevert(
        marketplaceInstance.buyCards(1, 388, thirdParty),
        "Insufficient balance"
      );
    });

    it("buyer shouldn't be able to buy a card with wrong price in ad", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = new BN(0);
      let cardId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId, {
        from: seller,
      });
      await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      await expectRevert(
        marketplaceInstance.buyCards(0, 687578, thirdParty),
        "Wrong price"
      );
    });
  });
});
