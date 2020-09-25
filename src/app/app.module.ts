import {BrowserModule} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {routerReducer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {ActionReducer, ActionReducerMap, MetaReducer, StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {AppRoutingModule} from './router/app-routing.module';
import {RouterSerializer} from './router/router.serializer';
import {LostComponent} from './lost/lost.component';
import {AuthReducer} from './store/auth/auth.reducer';
import {EffectsModule} from '@ngrx/effects';
import {AuthEffects} from './store/auth/auth.effects';
import {localStorageSync} from 'ngrx-store-localstorage';
import localeEsCl from '@angular/common/locales/es-CL';
import {registerLocaleData} from '@angular/common';
import {MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';

registerLocaleData(localeEsCl, 'es-Cl');

interface IState {
  router;
  auth;
}
const reducers: ActionReducerMap<IState> = {auth: AuthReducer, router: routerReducer};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['auth'], rehydrate: true})(reducer);
}
const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

@NgModule({
  declarations: [
    AppComponent,
    LostComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    AppRoutingModule,
    StoreDevtoolsModule.instrument({
      logOnly: true, // Restrict extension to log-only mode
    }),
    // Connects RouterModule with StoreModule
    StoreRouterConnectingModule.forRoot({
      serializer: RouterSerializer,
    }),
    EffectsModule.forRoot([AuthEffects])
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-Cl' },
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
    ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
