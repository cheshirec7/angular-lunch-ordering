import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

@Injectable()
export class Api {
  baseUrl: string;
  apiAcceptHeader: any;
  defaultHeaders: any = {};

  /**
   * This class will be used as a wrapper for Angular Http.
   * Only to be used for internal api (Lumen Dingo api).
   *
   * @param http
   * @param config
   */
  // private broadcaster: Broadcaster
  constructor(private http: Http) {
    let accept = 'application/';

    accept += process.env.API_STANDARDS_TREE + '.';
    accept += process.env.API_SUBTYPE + '.';
    accept += process.env.API_VERSION + '+json';

    this.apiAcceptHeader = { 'Accept': accept };
    this.baseUrl = process.env.API_URL;
  }

  /**
   * Set base uri for api requests.
   *
   * @param uri
   */
  setBaseUri(uri: string) {
    this.baseUrl = uri;
  }

  /**
   * Add new default header.
   *
   * @param key
   * @param value
   */
  addDefaultHeader(key: string, value: string) {
    let header = {};
    header[key] = value;

    Object.assign(this.defaultHeaders, header);
  }

  /**
   * Remove custom default header.
   *
   * @param key
   */
  deleteDefaultHeader(key: string) {
    delete this.defaultHeaders[key];
  }

  /**
   * Wrapper for angular http.request for our api.
   *
   * @param url
   * @param options
   * @returns {Observable<R>}
   */
  request(url: any, options: any = {}) {
    if (url.constructor === String) {
      options = this.prepareApiRequest(options);
    } else {
      url.url = this.baseUrl + '/' + url;
    }

    return this.http
      .request(this.getBuiltUrl(url), options)
      .map(this.extractData)
      .catch(this.catchError);
  }

  /**
   * Wrapper for angular http.get for our api.
   *
   * @param url
   * @param options
   * @returns {Observable<R>}
   */
  get(url: string, options: any = {}) {
    if (options && (options.data || options.search)) {
      options.search = this.serialize(options.data || options.search);
    }

    options = this.prepareApiRequest(options);

    return this.http
      .get(this.getBuiltUrl(url), options)
      .map(this.extractData)
      .catch(this.catchError);
  }

  /**
   * Wrapper for angular http.post for our api.
   *
   * @param url
   * @param data
   * @param options
   * @returns {Observable<R>}
   */
  post(url: string, data: any = {}, options: any = {}) {
    options = this.prepareApiRequest(options);
    options.headers.append('Content-Type', 'application/json');

    if (data.constructor === Object) {
      data = JSON.stringify(data);
    }

    return this.http
      .post(this.getBuiltUrl(url), data, options)
      .map(this.extractData)
      .catch(this.catchError);
  }

  /**
   * Wrapper for angular http.put for our api.
   *
   * @param url
   * @param data
   * @param options
   * @returns {Observable<R>}
   */
  put(url: string, data: any = {}, options: any = {}) {
    options = this.prepareApiRequest(options);
    options.headers.append('Content-Type', 'application/json');

    if (data.constructor === Object) {
      data = JSON.stringify(data);
    }

    return this.http
      .put(this.getBuiltUrl(url), data, options)
      .map(this.extractData)
      .catch(this.catchError);
  }

  /**
   * Wrapper for angular http.delete for our api.
   *
   * @param url
   * @param options
   * @returns {Observable<R>}
   */
  delete(url: string, options: any = {}) {
    options = this.prepareApiRequest(options);
    options.headers.append('Content-Type', 'application/json');

    let myurl = this.getBuiltUrl(url);
    return this.http
      .delete(myurl, options)
      .map(this.extractData)
      .catch(this.catchError);
  }

  /**
   * Wrapper for angular http.delete for our api.
   *
   * @param url
   * @param data
   * @param options
   * @returns {Observable<R>}
   */
  patch(url: string, data: any = {}, options: any = {}) {
    options = this.prepareApiRequest(options);
    options.headers.append('Content-Type', 'application/json');

    if (data.constructor === Object) {
      data = JSON.stringify(data);
    }

    return this.http
      .patch(this.getBuiltUrl(url), data, options)
      .map(this.extractData)
      .catch(this.catchError);
  }

  /**
   * Wrapper for angular http.delete for our api.
   *
   * @param url
   * @param options
   * @returns {Observable<R>}
   */
  head(url: string, options: any = {}) {
    options = this.prepareApiRequest(options);
    options.headers.append('Content-Type', 'application/json');

    return this.http
      .head(this.getBuiltUrl(url), options)
      .map(this.extractData)
      .catch(this.catchError);
  }

  /**
   * Extract data.
   *
   * @param response
   * @returns {any|{}}
   */
  private extractData(response: any): any {
    let body = response.json();
    ;
    return body.data;
  }

  /**
   * Catch error.
   *
   * @param error
   * @returns {ErrorObservable}
   */
  private catchError(error: any): any {
    let hdr = 'Error';
    let msg = 'Unknown error';

    if (error.status == 401) {
      hdr = 'Unauthorized';
      msg = 'Invalid email or password';
    } else if (error.hasOwnProperty('message') && error.message)
      msg = error.message;
    else if (error.hasOwnProperty('statusText') && error.statusText)
      msg = error.statusText
    else
      msg = 'Status: '+`${error.status}`;

    return Observable.throw(
       {
         err: true,
         hdr: hdr,
         msg: msg
       }
    );
  }

  /**
   * Prefix with api base.
   *
   * @param url
   * @returns {string}
   */
  private getBuiltUrl(url): string {
    if (url.startsWith('/') && this.baseUrl.endsWith('/')) {
      url = url.substr(1);
    }

    return this.baseUrl + url;
  }

  /**
   * Prepare request object for use with Lumen Dingo Api.
   *
   * @param options
   * @returns {RequestOptions}
   */
  private prepareApiRequest(options: any): RequestOptions {
    let headers = Object.assign(
      this.apiAcceptHeader,
      this.defaultHeaders,
      (options && options.headers) || {}
    );

    if (!options || options.constructor !== RequestOptions) {
      options = new RequestOptions(options);
    }

    options.headers = options.headers || new Headers(headers);

    return options;
  }

  /**
   * Recursively serialize an object/array.
   *
   * @param obj
   * @param prefix
   * @returns {URLSearchParams}
   */
  private serialize(obj: Object, prefix: string = ''): URLSearchParams {
    let str = [];

    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        let _prefix = prefix ? prefix + '[' + p + ']' : p, value = obj[p];

        str.push(typeof value === 'object'
          ? this.serialize(value, _prefix)
          : encodeURIComponent(_prefix) + '=' + encodeURIComponent(value)
        );
      }
    }

    return new URLSearchParams(str.join('&'));
  }
}
