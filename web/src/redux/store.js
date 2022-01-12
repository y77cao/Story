import { configureStore } from '@reduxjs/toolkit'
import blockchainReducer from './blockchainSlice';

export default configureStore({
  reducer: {
    blockchain: blockchainReducer
  },
})