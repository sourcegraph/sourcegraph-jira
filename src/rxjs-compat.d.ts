declare module 'rxjs' {
    export interface Observer<T> {
        next(value: T): void
    }

    export interface SubscriptionLike {
        unsubscribe(): void
    }

    export type TeardownLogic = SubscriptionLike | (() => void) | void

    export interface OperatorFunction<T, R> {
        (source: Observable<T>): Observable<R>
    }

    export class Observable<T> {
        constructor(subscribe?: (observer: Observer<T>) => TeardownLogic)
        pipe<A>(op1: OperatorFunction<T, A>): Observable<A>
        pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>
        pipe<A, B, C>(
            op1: OperatorFunction<T, A>,
            op2: OperatorFunction<A, B>,
            op3: OperatorFunction<B, C>
        ): Observable<C>
        pipe<A, B, C, D>(
            op1: OperatorFunction<T, A>,
            op2: OperatorFunction<A, B>,
            op3: OperatorFunction<B, C>,
            op4: OperatorFunction<C, D>
        ): Observable<D>
        subscribe(next?: (value: T) => void): SubscriptionLike
    }

    export function from<T>(input: Observable<T>): Observable<T>
    export function map<T, R>(project: (value: T) => R): OperatorFunction<T, R>
    export function distinctUntilChanged<T>(compare?: (a: T, b: T) => boolean): OperatorFunction<T, T>
    export function finalize<T>(callback: () => void): OperatorFunction<T, T>
}
