import { createSlice } from "@reduxjs/toolkit";
import { ContractClient } from "../clients/contractClient";

const initialState = {
  loading: false,
  account: null,
  contractClient: null,
  stories: null,
  pricePerChar: 0,
  errorMsg: "",
  transaction: null
};

export const blockchainSlice = createSlice({
  name: "blockchain",
  initialState,
  reducers: {
    initSuccess: (state, action) => {
      state.contractClient = action.payload.contractClient;
      state.stories = action.payload.stories;
      state.pricePerChar = action.payload.pricePerChar;
    },
    connectRequest: state => {
      state.loading = true;
    },
    connectSuccess: (state, action) => {
      state.loading = false;
      state.account = action.payload.account;
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
      state.transaction = action.payload.transaction;
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

export const mint =
  (text: string, parentId: number) => async (dispatch, getState) => {
    dispatch(mintRequest());
    try {
      const state = getState();
      const { contractClient } = state.blockchain;
      const txn = await contractClient.mint(text, parentId);
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
