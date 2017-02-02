import {
  Component,
  OnInit
} from '@angular/core';
import {Auth} from '../_services';

@Component({
  selector: 'logout',
  styleUrls: ['./logout.component.css'],
  templateUrl: './logout.component.html'
})
export class LogoutComponent implements OnInit {

  constructor(public auth: Auth) {
  }

  public ngOnInit() {
    this.auth.logout();
  }
}
