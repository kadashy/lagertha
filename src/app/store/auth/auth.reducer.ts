import {ActionTypes, AUTH_INITIAL_STATE, AuthActions, AuthState} from './auth.actions';

export function AuthReducer(state = AUTH_INITIAL_STATE, action: AuthActions): AuthState {
  switch (action.type) {
    case ActionTypes.Login:
      return {
        ...state,
        ...action.payload
      };
    case ActionTypes.Logout:
      return {
        ...state,
        ...AUTH_INITIAL_STATE
      };
    default:
      return state;
  }
}
