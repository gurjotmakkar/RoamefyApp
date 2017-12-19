import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpProvider {
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR?=500';

  constructor(public http: HttpClient) {
    console.log('Hello HttpProvider Provider');
  }

  getJsonData(){
    return new Promise(resolve => {
      this.http.get(this.api).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
  }

}
