import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Api, NavHelper, Auth, Broadcaster} from "../_services";
import {EVENTS} from '../events';

@Component({
  selector: 'orderdetails',
  templateUrl: './orderdetails.component.html',
  styleUrls: ['./orderdetails.component.css'],
})
export class OrderDetailsComponent implements OnInit {

  public menu: any;
  public total_price = '$0.00';

  constructor(private api: Api,
              private route: ActivatedRoute,
              private nav: NavHelper,
              private router: Router,
              private auth: Auth,
              private broadcaster: Broadcaster) {
  }

  public ngOnInit() {
    let test = this.route.snapshot.data['menu'];
    if (test.hasOwnProperty('err'))
      this.nav.redirectToLogin();
    else {
      this.menu = test;
      this.updateTotalPrice(0, false, false);
    }
  }

  public updateTotalPrice(id, flipCheckedState, validateQty) {
    let newprice = 0;
    this.menu.menuitems
      .map(menuitem => {
        if (menuitem.id == id) {
          if (flipCheckedState)
            menuitem.checked = !menuitem.checked;

          if (menuitem.checked)
            menuitem.qty = 1;
          else
            menuitem.qty = 0;
        }

        if (validateQty) {
          if (menuitem.qty < 1) {
            menuitem.qty = 0;
            menuitem.checked = false;
          }
        }

        newprice += (menuitem.qty * menuitem.price);
      });
    this.total_price = '$' + (newprice / 100).toFixed(2);
  }

  onSubmit() {

    this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, true);

    let data = {
      ts: this.route.snapshot.params['ts'],
      acctid: this.auth.accID,
      uid: this.route.snapshot.params['uid'],

      menuids: this.menu.menuitems
        .filter(menuitem => menuitem.checked)
        .map(menuitem => menuitem.id),

      qtys: this.menu.menuitems
        .filter(menuitem => menuitem.checked)
        .map(menuitem => menuitem.qty)
    };

    this.api.post('orders', JSON.stringify(data)).subscribe(
      (response) => {
        //console.log(response);
        this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, false);
        this.router.navigate(['/orders']);
      },
      (error) => {
        this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, false);
        //console.log(error);
        this.router.navigate(['/orders']);
      }
    );

  }

  ngOnDestroy() {
    // if (this.obsMenu)
    //   this.obsMenu.unsubscribe();
  }
}
