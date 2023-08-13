const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ensReverseRegistrarAddress =
    "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb"; // <-mainnet, goerli: 0x4f7A657451358a22dc397d5eE7981FfC526cd856

  const Story = await hre.ethers.getContractFactory("Story");
  const story = await Story.deploy(ensReverseRegistrarAddress);

  await story.deployed();

  console.log("Story deployed to:", story.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
