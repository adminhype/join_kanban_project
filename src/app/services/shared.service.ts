import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }
  
  reloadPage(){
    window.location.reload();
  }
}
