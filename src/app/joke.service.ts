import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Joke, JokeResponse } from './types';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Observable, Subject, timer } from 'rxjs';

const API_ENDPOINT = 'https://api.icndb.com/jokes/random/5?limitTo=[nerdy]';
const CACHE_SIZE = 1;
const REFRESH_INTERVAL = 5000;
@Injectable({
  providedIn: 'root'
})
export class JokeService {
  private reload$ = new Subject<void>();

  private cache$: Observable<Array<Joke>>;

  constructor(private http: HttpClient) { }

  get jokes(): Observable<Joke[]> {
    if (!this.cache$) {
      // Set up timer that ticks every X milliseconds
      const timer$ = timer(0, REFRESH_INTERVAL)

      // For each tick make an http request to fetch new data
      this.cache$ = timer$.pipe(
        switchMap(_ => this.requestJokes()),
        takeUntil(this.reload$),
        shareReplay(CACHE_SIZE)
      );
    }
    return this.cache$;
  }

  private requestJokes(): Observable<Joke[]> {
    return this.http.get<JokeResponse>(API_ENDPOINT).pipe(
      map(response => response.value)
    );
  }

  forceReload() {
    this.reload$.next();
    this.cache$ = null;
  }
}
