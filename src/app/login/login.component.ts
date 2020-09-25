import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AuthState, Login} from '../store/auth/auth.actions';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm: FormGroup;
  loading: boolean;
  controlsAccessor: {
    login: FormControl;
    password: FormControl;
  };

  constructor(private fb: FormBuilder, private store: Store<AuthState>, private router: Router) { }

  ngOnInit(): void {
    this.initialState();
  }

  initialState(): void {
    // Setup form
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.email]],
      password: [null , [Validators.required, Validators.minLength(4)]]
    });
    // Set controls safe typed accessor
    this.controlsAccessor = {
      login: this.loginForm.get('login') as FormControl,
      password: this.loginForm.get('password') as FormControl
    };
  }

  login(): void {
    console.log('login');
    this.loading = true;
    this.controlsAccessor.password.disable();
    this.controlsAccessor.login.disable();
    setTimeout(() => {
      this.loading = false;
      this.store.dispatch(new Login({
        token: 'test-token',
        login: this.controlsAccessor.login.value
      }));
      this.router.navigateByUrl('/dashboard');
    }, 3000);
  }
}
