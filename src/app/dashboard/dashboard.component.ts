import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AuthState, Logout} from '../store/auth/auth.actions';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  data: any[] = [];
  loading: boolean;
  error: boolean;

  constructor( private store: Store<AuthState>, private router: Router, private  httpClient: HttpClient, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.initialState();
  }

  initialState(): void {
    this.loading = true;
    // get initial data
  }

  logout(): void {
    this.router.navigate(['/login']);
    this.store.dispatch(new Logout());
  }

}
