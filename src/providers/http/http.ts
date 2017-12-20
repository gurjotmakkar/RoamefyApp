import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Response {
  loc: any;
  name: any;
  webSite: any;
  description: any;
  orgPhone: any;
  categories: any;
}

@Injectable()
export class HttpProvider {
  api: string = 'http://app.toronto.ca/cc_sr_v1_app/data/edc_eventcal_APR?=500';

  constructor(public http: HttpClient) {
    console.log('Hello HttpProvider Provider');
  }

  getJsonData(){
    return this.http.get<Response>(this.api).subscribe(data => {
        data;
      }, err => {
        console.log(err);
      });
  }

}
