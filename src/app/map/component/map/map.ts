import { ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { LeafletDirective, LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { NominatimServices } from '../../../core/services/nominatim.services';

@Component({
  selector: 'app-map',
  imports: [
    LeafletModule
  ],
  templateUrl: './map.html',
  styleUrl: './map.scss'
})

export class Map{

  constructor(
    private cdr: ChangeDetectorRef,
    private nomServices: NominatimServices
  ){}

  mapMarkers: L.Marker[] = [];

  @Output() selectedRestaurant = new EventEmitter<any>;
  selection: any = null;


  options = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 13,
    center: L.latLng(48.8566, 2.3522)
  };

  map!: L.Map;
  
  //Accès à la référence LeafletDirective
  @ViewChild(LeafletDirective, {static: false}) LeafletDirective!: LeafletDirective;

  ngAfterViewInit(): void {
    this.map = this.LeafletDirective.getMap();
    this.nomServices.setMap(this.map);

    this.markersOnMap();
  }

  //Ajout des markers à la carte à chaque changement détecté
  markersOnMap(){
    this.nomServices.restaurants$.subscribe(
      restaurants => {
        this.addMarkers(restaurants);
        this.cdr.detectChanges();
      }
    );
  }

  //Création des zones d'informations
  createPopUpContent(mcDo: any): HTMLElement {
    const button = L.DomUtil.create('button');
    button.style = "height: 30px; width: 70px; border-radius: 35px";
    button.innerHTML  = 'Choisir';

    const title = L.DomUtil.create('h1');
    title.style = "font-size: 16px;"
    title.innerHTML = `${mcDo.address.amenity} - ${this.nomServices.getPlaceName(mcDo.address)}`;

    const details = L.DomUtil.create('p');
    details.innerHTML = `${mcDo.display_name}`;

    button.addEventListener('click', () => {
      this.selection = {
        title: title.innerText,
        details: details.innerText
      }
      this.selectedRestaurant.emit(this.selection);
    this.cdr.detectChanges();
    });
    

    const container = L.DomUtil.create('div');
    container.appendChild(title);
    container.appendChild(details);
    container.appendChild(button);
    return container;
  }

  //Ajout des marqueurs à la liste à afficher
  addMarkers(markers: any[]) {
    this.mapMarkers = markers.map(
      marker => 
     L.marker([marker.lat, marker.lon], {
      icon: L.icon({
          iconSize: [25, 41],
          iconAnchor: [13,41],
          iconUrl: 'assets/marker-icon.png',
          shadowUrl: 'assets/marker-shadow.png'
      })
      }).bindPopup(this.createPopUpContent(marker)));
    }
}

