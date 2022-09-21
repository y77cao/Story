import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  errorMsg: ""
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    appError: (state, action) => {
      state.errorMsg = action.payload;
    },
    clearAppError: state => {
      state.errorMsg = "";
    }
  }
});

export const { appError, clearAppError } = appSlice.actions;

export default appSlice.reducer;
