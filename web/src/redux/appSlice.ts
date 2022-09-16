import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  content: "",
  imageUrl: "",
  loading: false,
  errorMsg: ""
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateContent: (state, action) => {
      state.content = action.payload.content;
    },
    updateImageUrl: (state, action) => {
      state.imageUrl = action.payload.imageUrl;
    },
    uploadRequest: (state, action) => {
      state.loading = true;
    },
    uploadSuccess: (state, action) => {
      state.loading = false;
    },
    uploadFailed: (state, action) => {
      state.loading = false;
      state.errorMsg = action.payload;
    },
    claimSuccess: (state, action) => {}
  }
});

export const {
  updateContent,
  updateImageUrl,
  uploadRequest,
  uploadSuccess,
  uploadFailed,
  claimSuccess
} = appSlice.actions;

export const upload = (dataUrl, id) => async dispatch => {
  dispatch(uploadRequest());
  try {
    const blob = await (await fetch(dataUrl)).blob();
    //  const resp = await pinToIPFS(blob, id);
    dispatch(uploadSuccess({}));
  } catch (err) {
    console.log(err);
    dispatch(uploadFailed(err));
  }
};

export default appSlice.reducer;
