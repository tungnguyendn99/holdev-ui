import { call, put, takeLatest } from 'redux-saga/effects';
import { requestLogin, setUserInfo } from '../slices/user.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../utils/api';

// 🧩 Hàm gọi API login
function loginApi({ username, password }: { username: string; password: string }) {
  return API.post('/users/login', {
    username,
    password,
  });
}

// 🧠 Saga chính xử lý login
function* handleLogin(action: PayloadAction<{ username: string; password: string }>): any {
  try {
    const response = yield call(loginApi, action.payload);
    const data = response.data;

    // Dispatch setUserInfo khi login thành công
    yield put(setUserInfo(data.user));
  } catch (error: any) {
    console.error('Login failed:', error);
    // Có thể dispatch thêm action khác, ví dụ: setError, showToast, ...
  }
}

// 👂 Watcher saga
export function* userSaga() {
  yield takeLatest(requestLogin.type, handleLogin);
}
