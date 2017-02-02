import {Injectable} from "@angular/core";
import {Api} from "../api";
import {Broadcaster} from "../broadcaster";
import {EVENTS} from "../../events";

@Injectable()
export class Auth {

  private _currentUser = null;
  private _token = null;
  private privilege_level_super = 100;
  private privilege_level_admin = 50;
  private privilege_level_user = 1;

  constructor(private api: Api,
              private broadcaster: Broadcaster) {

    let user = localStorage.getItem('currentUser');
    this._token = localStorage.getItem('token');
    // console.log(test);
    if (user && this._token) {
      this._currentUser = JSON.parse(user);
      this.api.addDefaultHeader('Authorization', 'Bearer ' + this._token);
    } else {
      this.clearUser();
      this.clearToken();
    }
  }

  public getUser() {
    return this._currentUser;
  }

  public get accID() {
    return this._currentUser.id;
  }

  // public getPrivilegeLevel() {
  //   if (this._currentUser)
  //     return parseInt(this._currentUser.privilege_level);
  //   return 0;
  // }

  public hasUserPrivileges() {
    if (this._currentUser)
      return (this._currentUser.privilege_level >= this.privilege_level_user);
    return false;
  }
  // public getToken() {
  //   return this.token;
  // }

  private clearUser() {
    this._currentUser = null;
    localStorage.removeItem('currentUser');
  }

  private clearToken() {
    this._token = null;
    localStorage.removeItem('token');
  }

  /**
   * Authenticate the user using credentials.
   *
   * @param credentials
   * @returns {Observable<R>}
   */
  public login(credentials: any) {
    this.clearUser();
    this.clearToken();
    return this.api.post('auth', credentials).do(
      (response) => this.authSuccessTasks(response),
      (error) => this.authFailureTasks(error)
    );
  }

  /**
   * Use token to verify and get user object from server.
   *
   * @returns {Observable<R>}
   */
  public verify() {
    return this.api.get('auth', {data: {token: this._token}}).do(
      (response) => this.authSuccessTasks(response),
      (error) => this.authFailureTasks(error)
    );
  }

  /**
   * Logout user. Successful logout will blacklist the token.
   *
   * @returns {Observable<R>}
   */
  public logout() {
    this.clearUser();

    let token = this._token;
    this.clearToken();

    if (!token)
      return;

    return this.api.delete('auth', {token: token})
      .subscribe((response) => {
        this.broadcaster.broadcast(EVENTS.AUTH.LOGOUT_SUCCESS, response);
      }, (error) => {
        this.broadcaster.broadcast(EVENTS.AUTH.LOGOUT_FAILURE, error);
      });
  }

  private authSuccessTasks(response: any) {
    // login() and verify() always returns the user
    this._currentUser = response.user;
    localStorage.setItem('currentUser', JSON.stringify(response.user));

    if (response.token) {
      this._token = response.token;
      localStorage.setItem('token', response.token);
      this.api.addDefaultHeader('Authorization', 'Bearer ' + response.token);
    } else if (this._token)
      this.api.addDefaultHeader('Authorization', 'Bearer ' + this._token);

    this.broadcaster.broadcast(EVENTS.AUTH.LOGIN_SUCCESS, response);
  }

  private authFailureTasks(error: any) {
    this.clearUser();
    this.clearToken();
    this.broadcaster.broadcast(EVENTS.AUTH.LOGIN_FAILURE, error);
  }
}
