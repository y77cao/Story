import { configureStore } from "@reduxjs/toolkit";
import blockchainReducer from "./blockchainSlice";
import appReducer from "./appSlice";

export default configureStore({
  reducer: {
    blockchain: blockchainReducer,
    app: appReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
