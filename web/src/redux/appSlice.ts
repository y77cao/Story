import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  text: "",
  errorMsg: ""
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateContent: (state, action) => {
      state.text = action.payload.text;
    },
    claimSuccess: (state, action) => {}
  }
});

export const { updateContent, claimSuccess } = appSlice.actions;

// export const upload = (dataUrl, id) => async dispatch => {
//   dispatch(uploadRequest());
//   try {
//     const blob = await (await fetch(dataUrl)).blob();
//     //  const resp = await pinToIPFS(blob, id);
//     dispatch(uploadSuccess({}));
//   } catch (err) {
//     console.log(err);
//     dispatch(uploadFailed(err));
//   }
// };

export default appSlice.reducer;
