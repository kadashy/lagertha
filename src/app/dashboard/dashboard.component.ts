import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {AuthState, Logout} from '../store/auth/auth.actions';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {csvJSON} from './utils';
import DirectionsResult = google.maps.DirectionsResult;

export interface OrderPoint {
  nro_oc: string;
  lat: number;
  lng: number;
  transport_id: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('mapContainer', {static: false}) gmap: ElementRef;
  map: google.maps.Map;
  markers: google.maps.Marker[] = [];
  directionsService: any = new google.maps.DirectionsService();
  directionsRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();

  data: any[] = [];
  loading: boolean;
  error: boolean;
  transports: string[] = [];
  orders: OrderPoint [] = [];

  lat = -33.436997;
  lng = -70.6366117;

  origen = new google.maps.LatLng(-33.5282431, -70.7108787);
  private coordinates: google.maps.LatLng;

  constructor( private store: Store<AuthState>, private router: Router, private  httpClient: HttpClient, public dialog: MatDialog) { }

  drawPoint(point: OrderPoint, mapRef: google.maps.Map): void {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(point.lat, point.lng),
      map: mapRef,
      title: point.nro_oc
    });
    marker.setMap(mapRef);
    this.markers.push(marker);
  }

  loadRoutes(): void {
    this.httpClient.get('assets/lat-lng.csv',  {responseType: 'text'}).subscribe(data => {
      this.orders = JSON.parse(csvJSON(data)) as OrderPoint[];
      this.orders.pop();
      this.orders.forEach((order) => {
        if (this.transports.indexOf(order.transport_id) === -1) {
          this.transports.push(order.transport_id);
        }
      });

      console.log('transportes', this.transports);

    });
  }

  drawRoute(origin: any, destination: any): void {
    const request = {
      origin,
      destination,
      travelMode: 'DRIVING'
    };
    this.directionsService.route(request, (result: DirectionsResult, status) => {
      // result.routes
      console.log('result');
      console.log(result);
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
      }
    });
  }

  drawTransportPoints(index: number): void {
    console.log(this.transports[index]);
    console.log(this.orders);
    console.log(this.orders.filter(order => order.transport_id === this.transports[index]));
    setTimeout(() => {
      this.markers.forEach( marker => {
        marker.setMap(null);
      });

      setTimeout(() => {
        this.orders.filter(order => order.transport_id === this.transports[index])
          .forEach((point) => {
            console.log('point', point);
            this.drawPoint(point, this.map);
          });
      }, 100);
    }, 200)


  }



  // Init Map

  initialState(): void {
    setTimeout(() => {
      // init Map
      this.loading = false;
      this.coordinates = new google.maps.LatLng(this.lat, this.lng);

      const mapOptions: any = {
        center: this.origen,
        zoom: 13,
      };

      this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);
      this.directionsRenderer.setMap(this.map);
      // Draw origin
      const marker = new google.maps.Marker({
        position: this.origen,
        map: this.map,
        title: 'Origen',
        label: 'Origen'
      });

      marker.setMap(this.map);

      // this.drawRoute('-33.5282431, -70.7108787', 'Catederal 4865, Santiago');

      this.loadRoutes();

    }, 200);
  }

  ngAfterViewInit(): void {
    this.initialState();
  }

  // Misc

  logout(): void {
    this.router.navigate(['/login']);
    this.store.dispatch(new Logout());
  }

}
