import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  username: number;
  avatar: string;
  features?: string[];
}

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: {} as UserInfo,
    loading: false,
  },
  reducers: {
    requestLogin(state, action: PayloadAction<{ username: string; password: string }>) {},
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    showLoading: (state) => {
      state.loading = true;
      console.log('asd');
    },
    hideLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { requestLogin, setUserInfo, showLoading, hideLoading } = userSlice.actions;

export default userSlice.reducer;
