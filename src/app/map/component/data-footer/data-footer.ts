import { Component, Input, OnChanges } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-data-footer',
  imports: [
    NgIf,
  ],
  templateUrl: './data-footer.html',
  styleUrl: './data-footer.scss'
})
export class DataFooter implements OnChanges{

  @Input() selection: any = null;
  selectedRestaurant: any;

  ngOnChanges(): void {
    if(this.selection){
      this.selectedRestaurant = {
        title: this.selection.title,
        details: this.selection.details
      }
    }
  }
  
  //Retour à l'overlay par défaut
  closeDetails() : void {
    this.selectedRestaurant = null;
  }
}
