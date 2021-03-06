import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AgncyApiCall, AgncyData } from 'src/app/common/requests/agncy.data';
import { JsonStringifyReplacer, Status } from 'src/app/common/types';
import { environment } from 'src/environments/environment';
import { SeshService } from '../sesh/sesh.service';

@Injectable({
  providedIn: 'root'
})
export class AgncyService {
  private url: string = environment.serverUrl;

  constructor(
    private http: HttpClient,
    private session: SeshService,
  ) { }

  // ------------------------------------------------------------- //
  // POST   async get(): Promise<[ Status, AgncyData? ]>
  async get(): Promise<[ Status, AgncyData? ]>
  {
    try
    {
      AgncyApiCall.ensureValid( this.session.acc_type, "get" );

      let headers = new HttpHeaders().set( "Content-Type", "application/json" );
      let res = await this.http.post( `${this.url}/agncy/get`, JSON.stringify( {}, JsonStringifyReplacer ), { headers, withCredentials: true, } ).toPromise() as [ Status, AgncyData? ];

      return res;
    }
    catch( err )
    {
      if( err instanceof Status ) return [ err ];
      throw err;
    }
  }

  // PUT   async update( updated_agncy: AgncyData ): Promise<Status>
  async update( updated_agncy: AgncyData ): Promise<Status>
  {
    try
    {
      AgncyApiCall.ensureValid( this.session.acc_type, "update", updated_agncy );

      let headers = new HttpHeaders().set( "Content-Type", "application/json" );
      let res = await this.http.put( `${this.url}/agncy/update`, JSON.stringify( updated_agncy, JsonStringifyReplacer ), { headers, withCredentials: true, } ).toPromise() as Status;

      return res;
    }
    catch( err )
    {
      if( err instanceof Status ) return err;
      throw err;
    }
  }
}
