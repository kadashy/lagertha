import {Injectable} from '@angular/core';
import {ActionTypes} from './auth.actions';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map} from 'rxjs/operators';

@Injectable()
export class AuthEffects {

  loginRedirect$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.Login),
    map(() => {
      console.log('login side effect');
      return ({type: ActionTypes.LoginSuccess});
    })
  ));

  constructor(
    private actions$: Actions,
  ) {}
}
