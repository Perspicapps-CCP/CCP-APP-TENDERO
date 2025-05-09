import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SignUp } from '../interfaces/signup.interface';
import { Address } from '../interfaces/address.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private apiUrl = environment.apiUrlCCP;
  private apiKey = environment.apiUrlCCP;

  constructor(private http: HttpClient) {}

  signUp(signUp: SignUp) {
    return this.http.post<SignUp>(`${this.apiUrl}/api/v1/users/clients/`, signUp);
  }

  getCoordinates(address: string): Observable<Address> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;

    return this.http.get<any>(url).pipe(
      map(data => {
        if (data.status !== 'OK' || data.results.length === 0) {
          throw new Error('Dirección no encontrada');
        }

        const result = data.results[0];
        const location = result.geometry.location;
        const components = result.address_components;

        const get = (type: string): string =>
          components.find((c: any) => c.types.includes(type))?.long_name || '';

        return {
          line: `${get('route')} ${get('street_number')}`,
          neighborhood: get('sublocality') || get('neighborhood'),
          city: get('locality'),
          state: get('administrative_area_level_1'),
          country: get('country'),
          latitude: location.lat,
          longitude: location.lng,
        };
      }),
    );
  }
}
