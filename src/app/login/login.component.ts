import {
  Component,
  OnInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth, Broadcaster } from '../_services';
import { NotificationsService } from 'angular2-notifications';
import { User } from './user.interface';
import { EVENTS } from '../events';

@Component({
  selector: 'login',
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  public user: User = {
    email: '',
    password: ''
  };
  public loading = false;
  public returnUrl: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private auth: Auth,
    private broadcaster: Broadcaster,
    private _notificationsService: NotificationsService) {
  }

  public ngOnInit() {
    this.auth.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/orders';
  }

  public login(model: User, isValid: boolean) {

    if (!isValid) {
      this._notificationsService.error(
        'Alert',
        'Invalid email or password',
        {
          timeOut: 5000,
          showProgressBar: true,
          pauseOnHover: false,
          clickToClose: true
        }
      );
      return false;
    }

    this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, true);
    this.loading = true;
    //this.model.email, this.model.password
    this.auth.login(model)
      .subscribe(
      data => {
        this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, false);
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error => {
        this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, false);
        this.loading = false;
        this._notificationsService.error(
          error.hdr,
          error.msg,
          {
            timeOut: 4000,
            showProgressBar: true,
            pauseOnHover: false,
            clickToClose: true,
            maxLength: 100
          }
        );
      });
  }
}
