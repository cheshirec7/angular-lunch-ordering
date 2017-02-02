import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {Auth, Broadcaster} from "./_services";
import {EVENTS} from "./events";

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.css'
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public ccaLogo = 'assets/img/ccalogo.png';
  public name = 'Chandler Christian Academy';
  public url = 'http://chandlerchristianacademy.org';
  public loading = false;

  public notifyOptions = {
    position: ["bottom", "right"],
    timeOut: 5000,
    lastOnBottom: true
  };

  menuItems = [
    {text: 'Home', icon: 'home', url: './'},
    {text: 'My orders', icon: 'event', disabled: false, url: './orders'},
    // {text: 'My account', icon: 'account_balance', disabled: true, url: 'http://cca.lunchordering.com/myaccount'},
    {text: 'Logout', icon: 'exit_to_app', url: './logout'}
  ];

  constructor(private auth: Auth,
              private broadcaster: Broadcaster) {
  }

  public ngOnInit() {

    this.broadcaster.subscribe(EVENTS.SPINNER.SPINNING, (data) => {
      this.loading = data;
    });

    if (this.auth.getUser()) {
      let test = this.auth.verify().subscribe(
        data => {
          //console.log('after verify data, app.component');
          //console.log(data);
        },
        error => {
          //console.log('after verify error, app.component');
          //console.log(error);
        });
    }
  }

}
