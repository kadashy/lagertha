import {Action, createFeatureSelector} from '@ngrx/store';

export interface AuthState {
  login: string | null;
  token: string | null;
}

export const AUTH_INITIAL_STATE: AuthState = {
  login: null,
  token: null
};

export enum ActionTypes {
  Login = '[Auth] Login',
  Logout = '[Auth] Logout',
  LoginSuccess = '[Auth] Login Success'
}

export class Login implements Action {
  readonly type = ActionTypes.Login;

  constructor(public payload: AuthState) {}
}

export class LoginSuccess implements Action {
  readonly type = ActionTypes.LoginSuccess;

  constructor(public payload: AuthState) {}
}

export class Logout implements Action {
  readonly type = ActionTypes.Logout;
}

export type AuthActions = Login | Logout;
export const getAuthState = createFeatureSelector<AuthState>('auth');
