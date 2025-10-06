import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NominatimServices } from '../../../core/services/nominatim.services';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-search-area',
  imports: [
    ReactiveFormsModule,
    NgStyle,
    NgIf,
    NgFor,
    AsyncPipe
],
  templateUrl: './search-area.html',
  styleUrl: './search-area.scss'
})
export class SearchArea  implements OnInit{

  selectedPlace!: any;

  //Gestion de couleur de l'input
  alarm: string = 'grey';
  req!: string;

  //Définition du formulaire réactif
  public placeForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public nomServices: NominatimServices,
  ){}

  ngOnInit(): void {
    this.placeForm = this.formBuilder.group({
      address: [null] //Initialise l'input à une valeur null
    });

    //Recherche des suggestions avec l'API Nominatim
    this.placeForm.get('address')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(place => place ?
        this.nomServices.searchPlace(place) : of([])
      )
    ).subscribe(
      (places) => {
      this.nomServices.placeToSearch.next(places); //Ajoute les données au BehaviourSubject
      });
  }

  //Requête API - Recherche des restaurants à proximité de la ville
  searchMcDo(placeName: string){
    this.nomServices.searchRestaurant(placeName).subscribe(
      restaurants => {
        this.nomServices.restaurants.next(restaurants);
      }
    )
  }

  //Renvoi le nom de la ville déterminée dans le Map Service
  getPlaceAddress(research: any): string {
    return this.nomServices.getPlaceName(research);
  }

  //Renvoi de la ville sélectionnée des suggestions vers l'input de recherche
  getAddress(place: any){
    this.selectedPlace = place;
    this.placeForm.get('address')?.setValue(place.display_name);
    this.alarm = 'grey';
  }

  //Déplacement de la carte sur la ville sélectionnée
  showAddress(){
    if(!this.selectedPlace){
      this.alarm = 'red';
      return;
    };
    this.alarm = 'grey';
    const lat = parseFloat(this.selectedPlace.lat);
    const lon = parseFloat(this.selectedPlace.lon);

    this.nomServices.goToAddress(lat, lon);

    //Recherche et transmission des données sur les restaurants trouvés
    this.searchMcDo(this.nomServices.getPlaceName(this.selectedPlace.address));
    this.selectedPlace = null;
  }
}
