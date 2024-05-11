const Migrations = artifacts.require("Voting");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
