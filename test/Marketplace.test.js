const {
  constants,
  expectEvent,
  expectRevert,
  balance,
  time,
  ether,
} = require("@openzeppelin/test-helpers");
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

  describe("Card sale", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
      marketplaceInstance = await Marketplace.new(cardsInstance.address);
    });

    it.only("seller should be able to sell the card", async () => {
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";
      let cardImageId = 0;
      let cardId = 1;

      await cardsInstance.createCardImage(name, strength, cardType);
      await cardsInstance.mintCard(seller, tokenURI, cardImageId);
      await cardsInstance.approve(marketplaceInstance.address, cardId);
      const result = await marketplaceInstance.sell(cardId, price, thirdParty, {
        from: seller,
      });

      expectEvent(result, "SellAd", {
        _cardId: cardId,
        _price: price,
      });
    });

    it("the seller shouldn't sell a card he does not own", async () => {
      let cardId = new BN(0);
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardId);

      await marketplaceInstance.sell(cardId, price, thirdParty);

      await expectRevert(
        marketplaceInstance.sell(cardId, price, thirdParty),
        "Card isn't seller's"
      );
    });

    it("the seller shouldn't sell a non-existent card", async () => {
      let cardId = new BN(0);
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardId);

      await marketplaceInstance.sell(cardId, price, thirdParty);

      await expectRevert(
        marketplaceInstance.sell(3, price, thirdParty),
        "Non-existent card"
      );
    });
  });

  describe("Ad editing", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
      marketplaceInstance = await Marketplace.new(Cards.address);
    });

    it("seller should be able to edit an ad", async () => {
      let cardId = new BN(0);
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardId);
      await marketplaceInstance.sell(cardId, price, thirdParty);

      let newPrice = 4657;

      const result = await marketplaceInstance.editAd(
        cardId,
        newPrice,
        constants.ZERO_ADDRESS
      );

      expectEvent(result, "Edited", {
        _cardId: cardId,
        _newPrice: newPrice,
      });
    });

    it("seller shouldn't be able to edit ad with non-existent card", async () => {
      let cardId = new BN(0);
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardId);

      await marketplaceInstance.sell(cardId, price, thirdParty);

      let newPrice = 4657;

      await expectRevert(
        marketplaceInstance.editAd(3, newPrice, constants.ZERO_ADDRESS),
        "Non-existent card"
      );
    });
  });

  describe("Buying card", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
      marketplaceInstance = await Marketplace.new(Cards.address);
    });

    it("buyer should be able to buy a card", async () => {
      let cardId = new BN(0);
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardId);

      await marketplaceInstance.sell(cardId, price, thirdParty);

      const result = await marketplaceInstance.buyCards(cardId, price);

      expectEvent(result, "Bought", {
        _cardId: cardId,
        _price: price,
      });
    });

    it("buyer shouldn't be able to buy a non-existent card", async () => {
      let cardId = new BN(0);
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardId);

      await marketplaceInstance.sell(cardId, price, thirdParty);

      await expectRevert(
        marketplaceInstance.buyCards(3, price, thirdParty),
        "Non-existent card"
      );
    });

    //it("buyer shouldn't be able to buy a card with insufficient balance", async () => {});

    it("buyer shouldn't be able to buy a card with wrong price in ad", async () => {
      let cardId = new BN(0);
      let price = new BN(400);
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);
      let tokenURI = "Bermuda";

      await cardsInstance.createCardImage(name, strength, cardType);

      await cardsInstance.mintCard(seller, tokenURI, cardId);

      await marketplaceInstance.sell(cardId, price, thirdParty);

      await expectRevert(
        marketplaceInstance.buyCards(0, 687578, thirdParty),
        "Wrong price"
      );
    });
  });
});
