import { ethers, BigNumber } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Story from "../abi/Story.json";

export class ContractClient {
  provider: ethers.providers.Web3Provider;
  contract: ethers.Contract;
  constructor(provider, contract) {
    this.provider = provider;
    this.contract = contract;
  }

  static async initContract() {
    // @ts-ignore checked below
    let { ethereum } = window;
    if (!ethereum) throw new Error("No wallet detected");

    let provider;
    if (ethereum.isMetaMask) {
      const networkId = await ethereum.request({
        method: "net_version",
      });
      if (networkId !== process.env.NEXT_PUBLIC_NETWORK_ID) {
        const networkStr =
          process.env.NEXT_PUBLIC_NETWORK_ID === "8453"
            ? "Base mainnet"
            : "Base Goerli";
        throw new Error(
          `Unsupported network. Please make sure that your are on ${networkStr}.`
        );
      }
      provider = new ethers.providers.Web3Provider(ethereum);
    } else if (ethereum.isCoinbaseWallet) {
      const coinbaseWallet = new CoinbaseWalletSDK({ appName: "StoryBase" });
      ethereum = coinbaseWallet.makeWeb3Provider();
      provider = new ethers.providers.Web3Provider(ethereum);

      const networkId = await ethereum.request({
        method: "eth_chainId",
      });
      if (
        parseInt(networkId).toString() !== process.env.NEXT_PUBLIC_NETWORK_ID
      ) {
        const networkStr =
          process.env.NEXT_PUBLIC_NETWORK_ID === "8453"
            ? "Base mainnet"
            : "Base Goerli";
        throw new Error(
          `Unsupported network. Please make sure that your are on ${networkStr}.`
        );
      }
    } else {
      throw new Error(
        "No supported wallet detected. Please connect with Metamask or Coinbase Wallet"
      );
    }

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      Story.abi,
      provider
    );

    return { provider, contract };
  }
  static async connectWallet() {
    // @ts-ignore checked below
    let { ethereum } = window;
    let provider;
    if (ethereum.isMetaMask) {
      const networkId = await ethereum.request({
        method: "net_version",
      });
      if (networkId !== process.env.NEXT_PUBLIC_NETWORK_ID) {
        const networkStr =
          process.env.NEXT_PUBLIC_NETWORK_ID === "8453"
            ? "Base mainnet"
            : "Base Goerli";
        throw new Error(
          `Unsupported network. Please make sure that your are on ${networkStr}.`
        );
      }
      provider = new ethers.providers.Web3Provider(ethereum);
    } else if (ethereum.isCoinbaseWallet) {
      const coinbaseWallet = new CoinbaseWalletSDK({ appName: "StoryBase" });
      ethereum = coinbaseWallet.makeWeb3Provider();
      provider = new ethers.providers.Web3Provider(ethereum);

      const networkId = await ethereum.request({
        method: "eth_chainId",
      });
      if (
        parseInt(networkId).toString() !== process.env.NEXT_PUBLIC_NETWORK_ID
      ) {
        const networkStr =
          process.env.NEXT_PUBLIC_NETWORK_ID === "8453"
            ? "Base mainnet"
            : "Base Goerli";
        throw new Error(
          `Unsupported network. Please make sure that your are on ${networkStr}.`
        );
      }
    } else {
      throw new Error(
        "No supported wallet detected. Please connect with Metamask or Coinbase Wallet"
      );
    }

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  }

  async getAllTokens() {
    return this.contract.getAllTokens();
  }

  async getPricePerChar(): Promise<BigNumber> {
    return this.contract.pricePerChar();
  }

  async getBalanceOf(tokenId: BigNumber): Promise<BigNumber> {
    return this.contract.getBalanceOf(tokenId);
  }

  async canMintWithTitle(nextTokenId: BigNumber, account): Promise<Boolean> {
    return this.contract.canMintWithTitle(nextTokenId, { from: account });
  }

  async withdraw(tokenId: number, balance: BigNumber): Promise<BigNumber> {
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    const txn = await contractWithSigner.withdraw(tokenId, balance);
    await txn.wait();
    return txn;
  }

  async getNumberOfOwnedTokens(account): Promise<BigNumber> {
    return this.contract.balanceOf(account);
  }

  async generateSvg(
    text: string,
    creator: string,
    title: string
  ): Promise<BigNumber> {
    return this.contract.generateSvg(
      text,
      creator,
      ethers.utils.formatBytes32String(title)
    );
  }

  async mint(text: string, parentId: number) {
    if (!text || !text.length || text.length > 280) {
      throw new Error("Invalid text length");
    }
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    const pricePerChar = await this.getPricePerChar();
    const mintCost = pricePerChar.mul(ethers.BigNumber.from(text.length));
    const txn = await contractWithSigner.mint(text, parentId, {
      value: mintCost,
    });
    await txn.wait();
    return txn;
  }

  async mintWithTitle(title: string, text: string) {
    // TODO make constant
    if (!title || !title.length || title.length > 32) {
      throw new Error("Invalid title length");
    }
    if (!text || !text.length || text.length > 280) {
      throw new Error("Invalid text length");
    }
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    const pricePerChar = await this.getPricePerChar();
    const mintCost = pricePerChar.mul(ethers.BigNumber.from(text.length));
    const titleBytes = ethers.utils.formatBytes32String(title);
    const txn = await contractWithSigner.mintWithTitle(titleBytes, text, {
      value: mintCost,
    });
    await txn.wait();
    return txn;
  }
}
