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
const Cards = artifacts.require("Cards");

contract("Card deck test", (accounts) => {
  let [owner, player, thirdParty] = accounts;
  let cardsInstance;

  describe("Card image creation", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
    });

    it("owner should be able to create a new card image with valid properties", async () => {
      let validStrengths = [new BN(5), new BN(0), constants.MAX_UINT256];
      let validNames = [
        "some text",
        "ahdgdnekfh",
        new Array(1000).join("some text"),
      ];
      let validCardTypes = [new BN(2), new BN(1), new BN(0)];

      validStrengths.length.should.equal(validNames.length);
      validNames.length.should.equal(validCardTypes.length);

      for (let i = 0; i < validNames.length; i++) {
        const name = validNames[i];
        const strength = validStrengths[i];
        const cardType = validCardTypes[i];

        const result = await cardsInstance.createCardImage(
          name,
          strength,
          cardType
        );
        expectEvent(result, "NewCardImageCreated", {
          _cardImageId: new BN(i),
          _name: name,
          _strength: strength,
          _cardType: cardType,
        });

        const cardImage = await cardsInstance.getCardImage(i);

        cardImage.name.should.equal(name);
        cardImage.strength.should.bignumber.equal(strength);
        cardImage.cardType.should.bignumber.equal(cardType);
      }
    });

    it("owner shouldn't be able to create a new card image with invalid card types", async () => {
      let invalidCardTypes = [new BN(5), new BN(7), new BN(10)];
      for (let i = 0; i < invalidCardTypes.length; i++) {
        const cardType = invalidCardTypes[i];
        await expectRevert(
          cardsInstance.createCardImage("Ben", 5, cardType),
          "invalid opcode"
        );
      }
    });

    it("owner shouldn't be able to create a new card image with existing name", async () => {
      await cardsInstance.createCardImage("Ben", 5, 1);
      await expectRevert(
        cardsInstance.createCardImage("Ben", 5, 1),
        "Existing name"
      );
    });

    it("owner shouldn't be able to create a new card image with empty name", async () => {
      await expectRevert(cardsInstance.createCardImage("", 5, 1), "Empty name");
    });
  });

  describe("Changing cards properties", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
    });

    it("owner should be able to change card name", async () => {
      let newName = "Track";

      await cardsInstance.createCardImage("Ben", 5, 0);
      await cardsInstance.changeCardImageName(0, newName);

      const result = await cardsInstance.changeCardImageName(0, newName);
      expectEvent(result, "ChangedCardImageName", {
        _cardImageId: new BN(0),
        _name: newName,
      });

      const cardImage = await cardsInstance.getCardImage(0);
      cardImage.name.should.equal(newName);
    });

    it("owner shouldn't be able to change card name with existing name", async () => {
      let newName = "Ben";
      await cardsInstance.createCardImage("Ben", 5, 0);
      await expectRevert(
        cardsInstance.changeCardImageName(0, newName),
        "Existing name"
      );
    });

    it("owner shouldn't be able to change card name with empty name", async () => {
      let newName = "";
      await cardsInstance.createCardImage("Ben", 5, 0);
      await expectRevert(
        cardsInstance.changeCardImageName(0, newName),
        "Empty name"
      );
    });

    it("owner should be able to change card strength", async () => {
      let newStrength = new BN(90);

      await cardsInstance.createCardImage("Ben", 5, 0);
      await cardsInstance.changeCardImageStrength(0, newStrength);

      const result = await cardsInstance.changeCardImageStrength(
        0,
        newStrength
      );
      expectEvent(result, "ChangedCardImageStrength", {
        _cardImageId: new BN(0),
        _strength: newStrength,
      });

      const cardImage = await cardsInstance.getCardImage(0);
      cardImage.strength.should.bignumber.equal(newStrength);
    });

    it("owner should be able to change card type", async () => {
      let newCardType = new BN(2);
      await cardsInstance.createCardImage("Ben", 5, 0);
      await cardsInstance.changeCardImageType(0, newCardType);

      const result = await cardsInstance.changeCardImageType(0, newCardType);
      expectEvent(result, "ChangedCardImageType", {
        _cardImageId: new BN(0),
        _cardType: newCardType,
      });

      const cardImage = await cardsInstance.getCardImage(0);
      cardImage.cardType.should.bignumber.equal(newCardType);
    });

    it("owner shouldn't be able to change card type with invalid type", async () => {
      let newCardType = new BN(8);
      await cardsInstance.createCardImage("Ben", 5, 0);
      await expectRevert(
        cardsInstance.changeCardImageType(0, newCardType),
        "invalid opcode"
      );
    });
  });

  describe("Card creation", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
    });

    it("owner should be able to mint card", async () => {
      let name = "Ben";
      let strength = new BN(5);
      let cardType = new BN(0);

      let tokenURI = "Bermuda";

      let cardImageId = new BN(0);
      let tokenId = new BN(1);

      await cardsInstance.createCardImage(name, strength, cardType);
      const result = await cardsInstance.mintCard(
        player,
        tokenURI,
        cardImageId
      );

      expectEvent(result, "NewCardCreated", {
        _tokenId: tokenId,
        _player: player,
      });

      const cardImageData = await cardsInstance.getCardImageDataByTokenId(0);
      cardImageData.name.should.equal(name);
      cardImageData.strength.should.bignumber.equal(strength);
      cardImageData.cardType.should.bignumber.equal(cardType);
    });

    it("owner shouldn't be able to mint non-existent card", async () => {
      await cardsInstance.createCardImage("Ben", 5, 0);
      await expectRevert(
        cardsInstance.mintCard(player, "Bermuda", 4),
        "Non-existent card image id"
      );
    });
  });

  describe("Access restriction", () => {
    beforeEach(async () => {
      cardsInstance = await Cards.new();
    });

    it("player shouldn't be able to mint card", async () => {
      await cardsInstance.createCardImage("Ben", 5, 0);
      await expectRevert(
        cardsInstance.mintCard.call(player, "Bermuda", 0, {
          from: player,
        }),
        "Ownable: caller is not the owner"
      );
    });

    it("player shouldn't be able to create card", async () => {
      await expectRevert(
        cardsInstance.createCardImage.call("Ben", 5, 0, { from: player }),
        "Ownable: caller is not the owner"
      );
    });

    it("player shouldn't be able to change card image", async () => {
      let newName = "Track";
      let newStrength = 90;
      let newCardType = 2;
      await cardsInstance.createCardImage("Ben", 5, 0);
      await expectRevert(
        cardsInstance.changeCardImageName.call(0, newName, {
          from: player,
        }),
        "Ownable: caller is not the owner"
      );
      await expectRevert(
        cardsInstance.changeCardImageStrength.call(0, newStrength, {
          from: player,
        }),
        "Ownable: caller is not the owner"
      );
      await expectRevert(
        cardsInstance.changeCardImageType.call(0, newCardType, {
          from: player,
        }),
        "Ownable: caller is not the owner"
      );
    });
  });
});
