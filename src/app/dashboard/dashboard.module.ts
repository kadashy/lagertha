import {NgModule} from '@angular/core';
import {DashboardComponent} from './dashboard.component';
import {DashboardRoutingModule} from './dashboard-routing.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ChartsModule} from 'ng2-charts';
import {MatListModule} from '@angular/material/list';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    DashboardRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    HttpClientModule,
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    ChartsModule,
    MatListModule
  ],
  providers: [HttpClient]
})
export class DashboardModule {}
