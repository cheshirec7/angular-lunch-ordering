import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {Auth} from "../auth";

@Injectable()
export class NavHelper {

  public curPeriodNo = 0;
  public selectedTab = 0;
  private displayPeriod = 'week';

  constructor(private auth: Auth, private router: Router) {
  }

  public getPeriod() {
    switch (this.curPeriodNo) {
      case 0:
        return 'This ' + this.displayPeriod;
      case 1:
        return 'Next ' + this.displayPeriod;
      case -1:
        return 'Last ' + this.displayPeriod;
      default:
        if (this.curPeriodNo > 1)
          return this.curPeriodNo + ' ' + this.displayPeriod + 's from now';
        else
          return Math.abs(this.curPeriodNo) + ' ' + this.displayPeriod + 's ago';
    }
  }

  public getOrdersURL() {
    return 'orders/' + this.auth.accID + '/' + this.curPeriodNo;
  }

  public redirectToLogin() {
    this.router.navigate(['/login'], {queryParams: {returnUrl: '/orders'}});
  }
}
