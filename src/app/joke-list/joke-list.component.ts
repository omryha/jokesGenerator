import { Component, OnInit } from '@angular/core';
// import { Memoize } from 'lodash-decorators';
import { Observable, Subject, merge } from 'rxjs';
import { mapTo, mergeMap, skip, switchMap, take } from 'rxjs/operators';
import { JokeService } from '../joke.service';
import { Joke } from '../types';

@Component({
  selector: 'app-joke-list',
  templateUrl: './joke-list.component.html',
  styleUrls: ['./joke-list.component.scss']
})
export class JokeListComponent implements OnInit {
  jokes$: Observable<Array<Joke>>;
  showNotification$: Observable<boolean>;
  update$ = new Subject<void>();
  forceReload$ = new Subject<void>();

  constructor(private jokeService: JokeService) { }

  forceReload() {
    this.jokeService.forceReload();
    this.forceReload$.next();
  }

  ngOnInit(): void {
    const reload$ = this.forceReload$.pipe(
      switchMap(() => this.getNotifications())
    );
    const initialNotifications$ = this.getNotifications();
    const show$ = merge(initialNotifications$, reload$).pipe(mapTo(true));
    const hide$ = initialNotifications$.pipe(mapTo(false));
    this.showNotification$ = merge(show$, hide$);
    const initialJokes$ = this.getDataOnce();

    const updates$ = merge(this.update$, this.forceReload$).pipe(
      mergeMap(() => this.getDataOnce()));

    this.jokes$ = merge(initialJokes$, updates$);
  }

  getNotifications() {
    return this.jokeService.jokes.pipe(skip(1));
  }

  getDataOnce() {
    return this.jokeService.jokes.pipe(take(1));
  }

  // @Memoize()
  // getVotes(id: number) {
  //   return Math.floor(10 + Math.random() * (100 - 10));
  // }

}
