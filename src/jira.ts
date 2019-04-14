import * as sourcegraph from 'sourcegraph'
import { Settings } from './settings'

export interface APIParams {
    jiraUrl: string
    jiraUsername: string
    apiToken: string
}

export function getAPIParams(): APIParams | Error {
    const {
        'jira.url': jiraUrl,
        'jira.username': jiraUsername,
        'jira.apiToken': apiToken,
    } = sourcegraph.configuration.get<Settings>().value
    if (!jiraUrl) {
        return new Error('Jira URL not set (jira.url)')
    }
    if (!jiraUsername) {
        return new Error('Jira username not set (jira.username)')
    }
    if (!apiToken) {
        return new Error('Jira API token not set (jira.apiToken)')
    }
    return { jiraUrl, jiraUsername, apiToken }
}

export interface Issue {
    summary: string
    number: number
    key: string
    url: string
    status?: 'todo' | 'inprogress' | 'done'
}

// When using on Sourcegraph (not via browser extension), use cors-anywhere with PORT=9018 to bypass
// the CORS restrictions of the HubSpot API.
const URL_PREFIX = sourcegraph.internal.clientApplication === 'sourcegraph' ? 'http://localhost:9018/' : ''

const issueCache = new Map<string, any>()

export async function getIssue(
    { jiraUrl, jiraUsername, apiToken }: APIParams,
    issueKey: string
): Promise<Issue | null> {
    const cachedData = issueCache.get(issueKey)
    if (cachedData) {
        return cachedData
    }

    const data = await jiraFetch({ jiraUrl, jiraUsername, apiToken }, `/rest/api/2/issue/${issueKey}`)
    const issue = toIssue({ jiraUrl }, issueKey.replace(/-.*$/, ''), data)
    issueCache.set(issueKey, issue)
    return issue
}

const issueQueryCache = new Map<string, Issue[]>()

export async function getIssues(
    { jiraUrl, jiraUsername, apiToken }: APIParams,
    project: string,
    query: string
): Promise<Issue[]> {
    const cachedData = issueQueryCache.get(query)
    if (cachedData) {
        return cachedData
    }

    const jqlConditions: string[] = []
    if (project) {
        jqlConditions.push(`project=${JSON.stringify(project)}`)
    }
    if (query) {
        jqlConditions.push(`summary~${JSON.stringify(query)}`)
    }

    const u = new URL('https://example.com/rest/api/2/search')
    u.searchParams.set('jql', jqlConditions.join(' and '))

    const data = await jiraFetch({ jiraUrl, jiraUsername, apiToken }, u.pathname + u.search)
    const issues: Issue[] = data.issues.map((data: any) => toIssue({ jiraUrl }, project, data))
    issueQueryCache.set(query, issues)
    return issues
}

function toIssue({ jiraUrl }: Pick<APIParams, 'jiraUrl'>, project: string, data: any): Issue {
    return {
        key: data.key,
        summary: data.fields.summary,
        number: data.key.slice(project.length + 1),
        url: `${jiraUrl}/browse/${data.key}`,
        status: toStatus(data.fields.status),
    }
}

function toStatus(status: { name: string }): Issue['status'] {
    if (status.name === 'To Do') {
        return 'todo'
    }
    if (status.name === 'Done') {
        return 'done'
    }
    if (status.name === 'In Progress') {
        return 'inprogress'
    }
    return undefined
}

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'Sourcegraph',
    'X-Atlassian-Token': 'no-check',
}

function getHeaders({ jiraUsername, apiToken }: Pick<APIParams, 'jiraUsername' | 'apiToken'>): Headers {
    return new Headers({
        ...DEFAULT_HEADERS,
        Authorization: `Basic ${btoa(`${jiraUsername}:${apiToken}`)}`,
    })
}

async function jiraFetch({ jiraUrl, jiraUsername, apiToken }: APIParams, requestUri: string): Promise<any> {
    try {
        const resp = await fetch(`${URL_PREFIX}${jiraUrl}${requestUri}`, {
            headers: getHeaders({ jiraUsername, apiToken }),
        })
        if (resp.status !== 200) {
            throw new Error(await resp.text())
        }
        return resp.json()
    } catch (err) {
        showPermissionsRequestAlert({ jiraUrl })
        throw err
    }
}

let shownPermissionsRequestAlert = false
function showPermissionsRequestAlert({ jiraUrl }: Pick<APIParams, 'jiraUrl'>): void {
    if (sourcegraph.app.activeWindow && !shownPermissionsRequestAlert) {
        // Request permissions to bypass CORS.
        shownPermissionsRequestAlert = true
        sourcegraph.app.activeWindow.showNotification(
            `To see Jira info, you must visit<br>${jiraUrl} and right-click the<br> Sourcegraph toolbar icon to<br> **Enable Sourcegraph on this domain**.`,
            sourcegraph.NotificationType.Error
        )
    }
}
