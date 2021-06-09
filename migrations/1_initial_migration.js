const Cards = artifacts.require("Cards");

module.exports = function (deployer) {
  deployer.deploy(Cards);
};
