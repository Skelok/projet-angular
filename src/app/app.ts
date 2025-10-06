import { Component, signal } from '@angular/core';
import { Map } from './map/component/map/map';
import { SearchArea } from './search/component/search-area/search-area';
import { DataFooter } from './map/component/data-footer/data-footer';
import { HttpClientModule } from '@angular/common/http';
import { NominatimServices } from './core/services/nominatim.services';

@Component({
  selector: 'app-root',
  imports: [
    HttpClientModule,
    Map,
    SearchArea,
    DataFooter
  ],
  providers: [
    NominatimServices
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('mac_donald');

  selectedRestaurant: any = null;

  receiveSelection(selectedRestaurant: any){
    this.selectedRestaurant = selectedRestaurant;
  }
}
