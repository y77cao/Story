import { createSlice } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import Story from "contracts/Story.sol/Story.json";

const initialState = {
  loading: false,
  account: null,
  contract: null,
  provider: null,
  errorMsg: ""
};

export const blockchainSlice = createSlice({
  name: "blockchain",
  initialState,
  reducers: {
    connectRequest: state => {
      state.loading = true;
    },
    connectSuccess: (state, action) => {
      state.loading = false;
      state.account = action.payload.account;
      state.contract = action.payload.contract;
      state.provider = action.payload.provider;
      state.errorMsg = "";
    },
    connectFailed: (state, action) => {
      state.loading = false;
      state.errorMsg = action.payload;
    },
    mintRequest: state => {
      state.loading = true;
    },
    mintSuccess: (state, action) => {
      state.loading = false;
      state.account = action.payload.account;
      state.contract = action.payload.contract;
      state.provider = action.payload.provider;
      state.errorMsg = "";
    },
    mintFailed: (state, action) => {
      state.loading = false;
      state.errorMsg = action.payload;
    },
    updateAccount: (state, action) => {
      state.account = action.payload.account;
    }
  }
});

export const {
  connectRequest,
  connectSuccess,
  connectFailed,
  mintRequest,
  mintSuccess,
  mintFailed,
  updateAccount
} = blockchainSlice.actions;

export const connect = () => async dispatch => {
  dispatch(connectRequest());
  const { ethereum } = window;
  const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
  if (metamaskIsInstalled) {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      const networkId = await ethereum.request({
        method: "net_version"
      });
      if (networkId == process.env.REACT_APP_NETWORK_ID) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(
          process.env.REACT_APP_CONTRACT_ADDRESS,
          Story.abi,
          provider
        );
        dispatch(
          connectSuccess({
            account: accounts[0],
            contract: contract,
            provider: provider
          })
        );

        // Add listeners start
        ethereum.on("accountsChanged", accounts => {
          dispatch(updateAccount({ account: accounts[0] }));
        });
        ethereum.on("chainChanged", () => {
          window.location.reload();
        });
        // Add listeners end
      } else {
        dispatch(
          connectFailed(
            `Unsupported network. Please make sure that your are on ethereum mainnet.`
          )
        );
      }
    } catch (err) {
      console.log(err);
      dispatch(connectFailed("Something went wrong."));
    }
  } else {
    dispatch(connectFailed("Unable to find your wallet. Install Metamask?"));
  }
};

export const mint = contentLength => async (dispatch, getState) => {
  dispatch(mintRequest());
  const { ethereum } = window;
  const state = getState();
  const { provider, account, contract } = state.blockchain;

  const metamaskIsInstalled = ethereum && ethereum.isMetaMask;

  if (!account) {
    dispatch(mintFailed("Please connect your wallet."));
    return;
  }

  if (!metamaskIsInstalled) {
    dispatch(mintFailed("Please install Metamask."));
    return;
  }

  try {
    const signer = provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    const mintCost = (contentLength * 0.001).toFixed(5);
    const txn = await contractWithSigner.mint(contentLength, {
      value: ethers.utils.parseEther(`${mintCost}`)
    });
    await txn.wait();
  } catch (err) {
    dispatch(mintFailed(err.message));
  }
};

export default blockchainSlice.reducer;
