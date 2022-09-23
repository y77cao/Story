import { ethers, BigNumber } from "ethers";
import Story from "contracts/Story.sol/Story.json";

// @ts-ignore
export class ContractClient {
  // TODO types
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
  }
  static async connectWallet() {
    // @ts-ignore checked below
    const { ethereum } = window;
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    if (!metamaskIsInstalled) throw new Error("Please install Metamask");
    const networkId = await ethereum.request({
      method: "net_version"
    });
    if (networkId !== process.env.NEXT_PUBLIC_NETWORK_ID)
      throw new Error(
        `Unsupported network. Please make sure that your are on ethereum mainnet.`
      );

    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
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

  async withdraw(tokenId: number, balance: BigNumber): Promise<BigNumber> {
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    const txn = await contractWithSigner.withdraw(tokenId, balance);
    await txn.wait();
    return txn;
  }

  async mint(text: string, parentId: number) {
    // TODO boundary check
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    const pricePerChar = await this.getPricePerChar();
    const mintCost = pricePerChar.mul(ethers.BigNumber.from(text.length));
    const textBytes = ethers.utils.toUtf8Bytes(text);
    const txn = await contractWithSigner.mint(textBytes, parentId, {
      value: mintCost
    });
    await txn.wait();
    return txn;
  }

  async mintWithTitle(title: string, text: string) {
    // TODO boundary check
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    const pricePerChar = await this.getPricePerChar();
    const mintCost = pricePerChar.mul(ethers.BigNumber.from(text.length));
    const titleBytes = ethers.utils.formatBytes32String(title);
    const textBytes = ethers.utils.toUtf8Bytes(text);
    const txn = await contractWithSigner.mintWithTitle(titleBytes, textBytes, {
      value: ethers.utils.parseEther(`${mintCost}`)
    });
    await txn.wait();
    return txn;
  }
}
