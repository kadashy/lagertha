import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {AuthState, Logout} from '../store/auth/auth.actions';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {csvJSON} from './utils';
import * as turf from '@turf/turf';
import DirectionsResult = google.maps.DirectionsResult;
import {clustersDbscan} from '@turf/turf';
import {randomPoint} from '@turf/random';
import {Feature} from 'geojson';
import concave from '@turf/concave';
import {getQueryPredicate} from '@angular/compiler/src/render3/view/util';

const MISSING = 'http://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_gray.png';
const CENTER = 'http://maps.google.com/mapfiles/kml/pal3/icon32.png';
const MARKERS = [
  'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  'http://maps.google.com/mapfiles/ms/icons/lightblue.png',
];

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
  orders: OrderPoint[] = [];

  lat = -33.436997;
  lng = -70.6366117;

  origen = new google.maps.LatLng(-33.5282431, -70.7108787);
  currentsPoints: OrderPoint[] = [];
  currentClusters = {};
  clustersTimes = [];
  clustersCentroids = [];
  rutaOptima = '';
  tramos = [];

  private coordinates: google.maps.LatLng;
  constructor(private store: Store<AuthState>, private router: Router, private  httpClient: HttpClient, public dialog: MatDialog) {
  }

  drawPoint(point: OrderPoint, mapRef: google.maps.Map, color?: number): void {
    const opts = {
      position: new google.maps.LatLng(point.lat, point.lng),
      map: mapRef,
      title: point.nro_oc ? point.nro_oc : ''
    };
    if (color !== undefined) {
      switch(color){
        case (-1):
          opts['icon'] = MISSING;
          break;
        case (-2):
          opts['icon'] = CENTER;
          break;
        default:
          opts['icon'] =  MARKERS[color > 8 ? 8 - color : color];
      }
    }
    const marker = new google.maps.Marker(opts);
    marker.setMap(mapRef);
    this.markers.push(marker);
  }

  loadRoutes(): void {
    this.httpClient.get('assets/lat-lng.csv', {responseType: 'text'}).subscribe(data => {
      this.orders = JSON.parse(csvJSON(data)) as OrderPoint[];
      this.orders.pop();
      this.orders.forEach((order) => {
        if (this.transports.indexOf(order.transport_id) === -1) {
          this.transports.push(order.transport_id);
        }
      });
    });
  }

  drawRoute(origin: any, destination: any, type?: string): void {
    const directionsRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map);
    const request = {
      origin,
      destination,
      travelMode: 'DRIVING'
    };
    this.directionsService.route(request, (result: DirectionsResult, status) => {
      // result.routes
      console.log('result');
      console.log(result);
      if (type) {
        this.clustersTimes.push({cluster: type, duration: result.routes[0].legs[0].duration.value});
      }
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });
  }

  clearAllMarkers(): void {
    // Clear all markers
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
  }

  drawTransportPoints(index: number): void {
    this.clearAllMarkers();

    // Draw transport markers
    this.currentsPoints = this.orders.filter(order => order.transport_id === this.transports[index])
      .map((point) => {
        this.drawPoint(point, this.map);
        return point;
      });
    this.clusterize();
  }


  clusterize(): void {
    this.clearAllMarkers();
    this.currentClusters = {};
    this.httpClient.post('http://localhost:8080/points', {points: this.currentsPoints}).subscribe((data: any) => {
      const pointsToDraw = data.map((x, i) => ({
        nro_oc: i,
        transport_id: x.split(',')[2],
        lat: x.split(',')[0],
        lng: x.split(',')[1]
      }));
      const found = [];
      pointsToDraw.forEach((point: OrderPoint) => {
        if (found.indexOf(point.transport_id) === -1) {
          found.push(point.transport_id);
          const color = point.transport_id !== 'Noise' ? found.length - 1 : -1;
          this.currentClusters[point.transport_id] = pointsToDraw
            .filter((toDraw: OrderPoint) => toDraw.transport_id === point.transport_id);
          this.currentClusters[point.transport_id].forEach((toDraw: OrderPoint) => this.drawPoint(toDraw, this.map, color));

        }
      });
      // pointsToDraw.forEach( x => this.drawPoint(x, this.map));
      // console.log('puntos a dibujar', pointsToDraw);
      this.routeToCenters();
    });
  }

  routeToCenters(): void {
    console.log('center');
    console.log(this.currentClusters);


    this.clustersCentroids = [];

    for (let key in this.currentClusters) {
      if (key !== 'Noise') {
        const collectionFeature = turf.featureCollection(
          this.currentClusters[key].map((point, num) => turf.point([parseFloat(point.lng), parseFloat(point.lat)], {id: key})));
        this.clustersCentroids.push({cluster: key, point: turf.center(collectionFeature)});
      }
    }

    console.log('this.clustersCentroids', this.clustersCentroids);

    this.clustersCentroids.forEach((center) => {
      this.drawRoute(
        '-33.5282431, -70.7108787',
        `${center.point.geometry.coordinates[1]}, ${center.point.geometry.coordinates[0]}`,
        center.cluster);

      // Draw centers stand Alone
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(center.point.geometry.coordinates[1], center.point.geometry.coordinates[0]),
        map: this.map,
        title: center.cluster,
        label: center.cluster
      });
    });

    this.calcRoute();
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

  calcRoute(): void {
    console.log('cluster times', this.clustersTimes);
    console.log('clusters', this.currentClusters);
    // Combinatoria Elementos
    console.log('clusters centroids', this.clustersCentroids);
    const a = [
      {id: 'origin', coordinates: [this.origen.lng(), this.origen.lat()]},
      ...this.clustersCentroids.map((m) => ({id: m.cluster, coordinates: m.point.geometry.coordinates})),
    ];
    console.log('a combinar', a);
    const matriz = [];
    a.forEach((primero) => {
      const row = [];
      a.forEach((segundo) => {
        row.push([primero, segundo]);
      });
      matriz.push(row);
    });

    console.log('matriz', matriz);


    const arrReq = [];

    matriz.forEach((primero) => {
      primero.forEach((segundo) => {
        arrReq.push(segundo);
      });
    })

    console.log('arrReq', arrReq);

    const arrBenitez = arrReq.map((req) => (
      {
        pointID: req[0].id + ',' + req[1].id,
        origin: `${req[0].coordinates[1]},${req[0].coordinates[0]}`,
        destination: `${req[1].coordinates[1]},${req[1].coordinates[0]}`,
        mode: 'driving',
        departureTime: 'now'
      }
    ));
    this.httpClient.post('http://127.0.0.1:8082/api/v1/costTravels', arrBenitez).subscribe((data: any) => {
      console.log('data req benitez', data);
      const reqBen = data;
      const res = [];
      matriz.map((primero) => {
        const row = [];
        primero.map((segundo) => {
          row.push(data.filter((chunk) => `${segundo[0]['id']},${segundo[1]['id']}` === chunk.pointID)[0]['durationSecond']);
        });
        res.push(row);
      });
      this.httpClient.post('http://localhost:8080/tsp',
        {nodes: res}
        ).subscribe((data: any) => {
        console.log('TSP data', data);
        console.log('matrix, index');
        console.log(matriz[0].map((chunk, index) => ({index, nodeName: chunk[1]['id']})));
        const matrixIndex = matriz[0].map((chunk, index) => ({index, nodeName: chunk[1]['id']}));
        console.log('split', data.split('\n')[1].split(' -> ').map(chunk => parseInt(chunk)));

        console.log('ruta optima');

        this.rutaOptima = data.split('\n')[1].split(' -> ').map(chunk => parseInt(chunk)).map((index) => {
          return matrixIndex[index]['nodeName'];
        }).join(' , ');


        const searchString = data.split('\n')[1].split(' -> ').map(chunk => parseInt(chunk)).map((index) => {
          return matrixIndex[index]['nodeName'];
        });

        console.log('ruta optima', searchString);
        const sum = [];
        searchString.forEach((item, index) => {
          if (index + 1 < searchString.length - 1) {
            sum.push(`${searchString[index]},${searchString[index+1]}`);
          }
        });

        console.log('sum', sum);

        this.tramos = [];
        sum.forEach((leg) => {
          this.tramos.push({
            legName: leg,
            cost: reqBen.filter(( reqBen) => reqBen.pointID === leg)[0]['durationSecond']
          });
        });
        console.log('tramos', this.tramos);




      });

    });
  }



}
