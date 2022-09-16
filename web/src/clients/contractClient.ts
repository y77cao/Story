import { ethers } from "ethers";
import Story from "contracts/Story.sol/Story.json";

// @ts-ignore
export class ContractClient {
  provider;
  contract;
  constructor(provider, contract) {
    this.provider = provider;
    this.contract = contract;
  }

  static async initContract() {
    // @ts-ignore checked below
    const { ethereum } = window;
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    if (!metamaskIsInstalled) throw new Error("Please install Metamask");

    try {
      const networkId = await ethereum.request({
        method: "net_version"
      });
      if (networkId !== process.env.NEXT_PUBLIC_NETWORK_ID)
        throw new Error(
          `Unsupported network. Please make sure that your are on ethereum mainnet.`
        );
      const provider = new ethers.providers.Web3Provider(ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        Story.abi,
        provider
      );

      return { provider, contract };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  static async connectWallet() {
    // @ts-ignore checked below
    const { ethereum } = window;
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    if (!metamaskIsInstalled) throw new Error("Please install Metamask");

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });

      return accounts[0];
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getAllTokens() {}
}
