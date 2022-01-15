import { createAction, createSlice } from "@reduxjs/toolkit";
import { initialState } from "./state";

export const logIn = createAction<string>("logIn");
export const logOut = createAction<void>("logOut");

const slice = createSlice({
  name: "login",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logIn, (state, action) => {
        state.username = action.payload;
      })
      .addCase(logOut, (state, action) => {
        state.username = null;
      });
  },
});

export default slice.reducer;
