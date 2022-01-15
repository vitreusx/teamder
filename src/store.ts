import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./Login/slice";

const store = configureStore({
  reducer: {
    login: loginReducer,
  },
  devTools: true,
});

export default store;
