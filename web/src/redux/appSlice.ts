import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  errorMsg: "",
  activeWindow: null,
  windows: [],
  tabs: []
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
    },
    openWindow: (state, action) => {
      if (state.windows.findIndex(w => w.id === action.payload.window.id) > -1)
        return;
      state.windows = [...state.windows, action.payload.window];
      state.activeWindow = action.payload.window;
      state.tabs = [
        ...state.tabs,
        { id: action.payload.window.id, name: action.payload.window.name }
      ];
    },
    closeWindow: (state, action) => {
      const windowIndex = state.windows.findIndex(
        w => w.id === action.payload.windowId
      );
      if (windowIndex > -1) {
        state.windows.splice(windowIndex, 1);
      }
      const tabIndex = state.tabs.findIndex(
        w => w.id === action.payload.windowId
      );
      if (tabIndex > -1) {
        state.tabs.splice(tabIndex, 1);
      }
      state.activeWindow = state.windows[state.windows.length - 1];
    },
    switchWindow: (state, action) => {
      const index = state.windows.findIndex(
        w => w.id === action.payload.windowId
      );
      let el;
      if (index > -1) {
        el = state.windows.splice(index, 1);
      }
      state.windows = [...state.windows, el[0]];
    }
  }
});

export const {
  appError,
  clearAppError,
  openWindow,
  closeWindow,
  switchWindow
} = appSlice.actions;

export default appSlice.reducer;
