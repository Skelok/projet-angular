import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, of } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class NominatimServices{
    constructor(
        private http : HttpClient,
    ){}

    private map!: L.Map;

    //Met en place la carte
    setMap(map: L.Map){
        this.map = map;
    }

    //Déplace la carte à l'endroit souhaité
    goToAddress(lat: number, lng: number){
        this.map.setView([lat, lng], 12);
    }

    public placeToSearch: BehaviorSubject<any> = new BehaviorSubject([]);
    public placeToSearch$ = this.placeToSearch.asObservable();

    //Filtre de normalisation pour la comparaison
    completeFilter = (str: string) => (
    (str || '')
      .normalize('NFD') //Sépare les caractères lettre/accent
      .replace(/[\u0300-\u036f]/g, '') //Supprime les accents
      .toLowerCase() 
      .replace(/[^a-z0-9]+/g, '-') //Remplace par un tirer ce qui n'est pas alphanumérique
      .replace(/^-+|-+$/g, '') //Supprime les tirets de début et de fin
    );


    apiUrl = 'https://nominatim.openstreetmap.org/search';

    //Headers de la requête HTTP
    private httpOptions={
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    //Renvoi des suggestions trouvées selon l'input donné
    searchPlace(req: string) {
        return this.http.get<any[]>(this.apiUrl, {
            headers: this.httpOptions.headers,
            params :{
                q: req,
                format: 'json',
                addressdetails: '1',
                limit: '5',
                countrycodes: 'fr'
            }
        }).pipe(
            catchError(() => {
                this.placeToSearch.error('ERROR FOUND');
                return of([]);
            }),
            map(places =>
                places.filter(p => {
                    const name = this.completeFilter(this.getPlaceName(p.address));
                    const query = this.completeFilter(req);
                    return name.startsWith(query);
                }
                )   
            )
        )
    }

    public restaurants: BehaviorSubject<any> = new BehaviorSubject([]);
    public restaurants$ = this.restaurants.asObservable();

    //Recherche dans l'API Nominatim des restaurants selon la ville
    searchRestaurant(placeName: string) {
        const req = `McDonald's, ${placeName}`;

        return this.http.get<any[]>(this.apiUrl, {
            headers: this.httpOptions.headers,
            params: {
                q: req,
                format: 'json',
                addressdetails: '1',
                countrycodes: 'fr',
                autocomplete: '1'
            }
        });
    }

    //Retourne le nom de la ville selon le paramètre trouvé
    getPlaceName(address: any): string {
        return address.city
            || address.village
            || address.town
            || address.hamlet
            || address.municipality
            || address.state
            || address.county
    }
}