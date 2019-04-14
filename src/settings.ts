import { isEqual } from 'lodash'
import { from, Observable } from 'rxjs'
import { distinctUntilChanged, finalize, map } from 'rxjs/operators'
import * as sourcegraph from 'sourcegraph'

export interface Settings {
    'jira.url'?: string
    'jira.username'?: string
    'jira.apiToken'?: string
}

const settingsSubscribable = new Observable<Settings>(sub => {
    sub.next(sourcegraph.configuration.get().value)
    return sourcegraph.configuration.subscribe(() => sub.next(sourcegraph.configuration.get().value))
})

/**
 * Keep at most one registration active based on the latest value of a settings property.
 */
export function settingsRegistration(
    key: keyof Settings,
    register: () => sourcegraph.Unsubscribable | undefined
): sourcegraph.Unsubscribable {
    let registration: sourcegraph.Unsubscribable | undefined
    return from(settingsSubscribable)
        .pipe(
            map(settings => settings[key]),
            distinctUntilChanged((a, b) => isEqual(a, b)),
            map(() => {
                if (registration) {
                    registration.unsubscribe()
                }
                registration = register()
            }),
            finalize(() => {
                if (registration) {
                    registration.unsubscribe()
                    registration = undefined
                }
            })
        )
        .subscribe()
}
