import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {Api, NavHelper} from "./_services";
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

@Injectable()
export class DataResolver implements Resolve<any> {

  constructor(private api: Api, private nav: NavHelper) {
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    switch (route.url[0].path) {
      case 'orders':
        return this.api.get(this.nav.getOrdersURL())
          .catch(e => Observable.of({error: e}));
      case 'orderdetails':
        return this.api.get('menu/' + route.params['ts'] + '/' + route.params['uid'])
          .catch(e => Observable.of({error: e}));
    }
  }
}

export const APP_RESOLVER_PROVIDERS = [
  DataResolver
];
