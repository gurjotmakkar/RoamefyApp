import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class HttpProvider {
  eventData: any;
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR';

  constructor(public http: HttpClient) {
    console.log('Hello HttpProvider Provider');
    this.http.get(this.api)
    .subscribe(data => {
        this.eventData = data;
      }, err => {
        console.log(err);
      });
  }

  getJsonData(){
    return this.eventData;
  }
  

}
