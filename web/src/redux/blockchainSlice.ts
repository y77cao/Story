import { createSlice } from "@reduxjs/toolkit";
import { ContractClient } from "../clients/contractClient";
import { appError, openWindow } from "./appSlice";
import { toStories } from "../utils";
import { WindowType } from "../components/App";

const initialState = {
  loading: false,
  account: null,
  contractClient: null,
  stories: null,
  pricePerChar: 0,
  transaction: null
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
    },
    fetchDataRequest: state => {
      state.loading = true;
    },
    fetchDataSuccess: (state, action) => {
      state.loading = false;
      state.stories = action.payload.stories;
      state.pricePerChar = action.payload.pricePerChar;
    },
    mintRequest: state => {
      state.loading = true;
    },
    mintSuccess: (state, action) => {
      state.loading = false;
      state.transaction = action.payload.transaction;
    },
    clearTransaction: state => {
      state.transaction = null;
    }, // TODO might be able to move this to MintConfirmation
    error: (state, action) => {
      state.loading = false;
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
  fetchDataRequest,
  fetchDataSuccess,
  mintRequest,
  mintSuccess,
  error,
  clearTransaction,
  updateAccount
} = blockchainSlice.actions;

export const connect = () => async dispatch => {
  dispatch(connectRequest());
  try {
    const account = await ContractClient.connectWallet();
    dispatch(connectSuccess({ account }));
    dispatch(
      openWindow({
        window: {
          type: WindowType.ACCOUNT,
          id: Date.now().toString(),
          name: account,
          metadata: {}
        }
      })
    );
  } catch (err) {
    dispatch(appError(err.message));
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
      dispatch(error());
      dispatch(appError(err.message));
    }
  };

export const fetchData = () => async (dispatch, getState) => {
  dispatch(fetchDataRequest());
  try {
    const state = getState();
    const { contractClient } = state.blockchain;
    const pricePerChar = (await contractClient.getPricePerChar()).toString();
    const tokens = await contractClient.getAllTokens();
    const stories = toStories(tokens);
    dispatch(fetchDataSuccess({ stories, pricePerChar }));
  } catch (err) {
    dispatch(error());
    dispatch(appError(err.message));
  }
};

export default blockchainSlice.reducer;
