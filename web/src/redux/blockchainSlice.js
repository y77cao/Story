import { createSlice } from '@reduxjs/toolkit'
import { ethers } from 'ethers';
import Story from 'contracts/Story.sol/Story.json';

const initialState = {
    loading: false,
    account: null,
    contract: null,
    provider: null,
    errorMsg: ''
}

export const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState,
  reducers: {
    connectRequest: (state) => {
        state.loading = true;
    },
    connectSuccess: (state, action) => {
        state.loading = false;
        state.account = action.payload.account;
        state.contract = action.payload.contract;
        state.provider = action.payload.provider;
    },
    connectFailed: (state, action) => {
        state.loading = false;
        state.errorMsg = action.payload;
    },
    updateAccount: (state, action) => {
        state.account = action.payload.account;
    }
  },
})

export const { connectRequest, connectSuccess, connectFailed, updateAccount } = blockchainSlice.actions

export const connect = () => async (dispatch) => {
      dispatch(connectRequest());
      const abi = '';
      const { ethereum } = window;
      const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
      if (metamaskIsInstalled) {
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          const networkId = await ethereum.request({
            method: "net_version",
          });
          if (networkId == process.env.REACT_APP_NETWORK_ID) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const contract = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, Story.abi, provider);
            dispatch(
              connectSuccess({
                account: accounts[0],
                contract: contract,
                provider: provider,
              })
            );

            // Add listeners start
            ethereum.on("accountsChanged", (accounts) => {
              dispatch(updateAccount(accounts[0]));
            });
            ethereum.on("chainChanged", () => {
              window.location.reload();
            });
            // Add listeners end
          } else {
            dispatch(connectFailed(`Unsupported network. Please make sure that your are on ethereum mainnet.`));
          }
        } catch (err) {
            console.log(err);
          dispatch(connectFailed("Something went wrong."));
        }
      } else {
        dispatch(connectFailed("Unable to find your wallet. Install Metamask?"));
      }
  };

export default blockchainSlice.reducer