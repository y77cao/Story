import { createSlice } from "@reduxjs/toolkit";
import { ContractClient } from "../clients/contractClient";

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
    initSuccess: (state, action) => {
      state.contractClient = action.payload.contractClient;
    },
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
  initSuccess,
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
  try {
    const account = await ContractClient.connectWallet();
    dispatch(connectSuccess({ account }));
  } catch (err) {
    dispatch(connectFailed(err.message));
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
    dispatch(
      mintSuccess({
        transaction: txn
      })
    );
  } catch (err) {
    dispatch(mintFailed(err.message));
  }
};

export default blockchainSlice.reducer;
