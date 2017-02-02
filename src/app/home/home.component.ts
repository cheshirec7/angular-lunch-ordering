import {
  Component,
  OnInit
} from '@angular/core';

//import {AppState} from '../app.service';

@Component({
  selector: 'home',
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  public localState = {value: ''};

  // constructor(public appState: AppState) {
  // }

  public ngOnInit() {
  }
}
