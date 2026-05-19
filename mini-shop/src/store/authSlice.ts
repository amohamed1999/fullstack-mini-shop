import { createSlice } from "@reduxjs/toolkit";


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
};

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },

    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } =
  authSlice.actions;

export default authSlice.reducer;