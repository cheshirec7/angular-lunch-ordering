import {Component, OnInit, trigger, state, style, transition, animate, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {MdTabGroup} from "@angular/material";
import {Api, NavHelper, Broadcaster} from "../_services";
import {EVENTS} from '../events';

@Component({
  selector: 'orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  animations: [
    trigger('sliderState', [
      state('left', style({transform: 'translate3d(-100%, 0, 0)', opacity: 1})),
      state('center', style({transform: 'translate3d(0, 0, 0)', opacity: 1})),
      state('right', style({transform: 'translate3d(100%, 0, 0)', opacity: 1})),
      transition('center => left, center => right, left => center, right => center', animate('500ms cubic-bezier(0.35, 0, 0.25, 1)')),
      //transition('left => right, right => left', [animate('250ms cubic-bezier(0.35, 0, 0.25, 1)'),style({opacity: 0})]),
    ]),
    trigger('visibilityChanged', [
      state('shown', style({opacity: 1})),
      state('hidden', style({opacity: 0})),
      transition('* => *', animate('500ms'))
    ])
  ]
})
export class OrdersComponent implements OnInit {

  public orders: any;
  public curPeriod: string = 'This week';
  public isPast = false;
  public sliderstate = 'center';
  public visibilityChanged = 'shown';
  private obsOrders: any;
  private obsTabChange: any;

  @ViewChild(MdTabGroup) tabGroup: MdTabGroup;

  constructor(private api: Api,
              private route: ActivatedRoute,
              private nav: NavHelper,
              private broadcaster: Broadcaster) {
  }

  public ngOnInit() {
    let test = this.route.snapshot.data['orders'];

    if (test.hasOwnProperty('err'))
      this.nav.redirectToLogin();
    else {
      this.orders = test;
      // console.log(this.orders);
      // this._getData(0,'center','center');
      this.obsTabChange = this.tabGroup.selectedIndexChange.subscribe((num) => {
          this.nav.selectedTab = num;
        }
      )
    }
  }

  ngAfterViewInit() {
    this.tabGroup.selectedIndex = this.nav.selectedTab;
    this.curPeriod = this.nav.getPeriod();
  }

  // ngAfterContentInit() {
  //this.tabGroup.selectedIndex = 1;
  // }

  public animationDone(event) {
    if ((event.fromState == 'left' && event.toState == 'right') ||
      (event.fromState == 'right' && event.toState == 'left'))
      this.sliderstate = 'center';
  }

  private _getData(periodOffset, slideTo, slideFrom) {
    this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, true);
    this.nav.curPeriodNo += periodOffset;
    this.isPast = this.nav.curPeriodNo < 0;
    this.sliderstate = slideTo;
    this.visibilityChanged = 'hidden';
    this.obsOrders = this.api.get(this.nav.getOrdersURL()).subscribe(
      (response) => {
        if (response.hasOwnProperty('err'))
          this.nav.redirectToLogin();
        else {
          // console.log(this.orders);
          this.broadcaster.broadcast(EVENTS.SPINNER.SPINNING, false);
          this.orders = response;
          this.curPeriod = this.nav.getPeriod();
          this.sliderstate = slideFrom;
          this.visibilityChanged = 'shown';
          this.tabGroup.selectedIndex = this.nav.selectedTab;
        }
      }
    );
  }

  public prev() {
    this._getData(-1, 'right', 'left');
  }

  public next() {
    this._getData(1, 'left', 'right');
  }

  ngOnDestroy() {
    if (this.obsOrders)
      this.obsOrders.unsubscribe();
    if (this.obsTabChange)
      this.obsTabChange.unsubscribe();
  }
}
