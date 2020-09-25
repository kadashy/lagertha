import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AuthState, getAuthState} from '../store/auth/auth.actions';
import {map} from 'rxjs/operators';

/**
 * Basic Routing Guard Service
 */
@Injectable()
export class RouteGuard implements CanActivate {
  constructor(private store: Store<AuthState>, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.store
      .select(getAuthState).pipe(
        map((data: AuthState) => {
          // Validate token if any
          if (!data.token) {
            this.router.navigate(['/login']);
            return false;
          }
          // try login
          return true;
        })
      );
  }
}
