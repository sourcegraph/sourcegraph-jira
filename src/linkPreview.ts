import * as sourcegraph from 'sourcegraph'
import { getAPIParams, getIssue, Issue } from './jira'
import { Settings, settingsRegistration } from './settings'

export function registerLinkPreviewProvider(): sourcegraph.Unsubscribable {
    return settingsRegistration('jira.url', () => {
        const jiraUrl = sourcegraph.configuration.get<Settings>().get('jira.url')
        if (!jiraUrl) {
            return undefined
        }
        return sourcegraph.content.registerLinkPreviewProvider(jiraUrl, {
            provideLinkPreview: async url => {
                const m = url.pathname.match(/^\/browse\/(\w+-\d+)/)
                if (!m) {
                    return null
                }
                const issueKey = m[1]

                const apiParams = getAPIParams()
                if (apiParams instanceof Error) {
                    return {
                        hover: {
                            kind: sourcegraph.MarkupKind.PlainText as sourcegraph.MarkupKind.PlainText,
                            value: `Error: ${apiParams.message}`,
                        },
                    }
                }

                const issue = await getIssue(apiParams, issueKey)
                if (!issue) {
                    return null
                }
                return {
                    content: {
                        kind: sourcegraph.MarkupKind.Markdown,
                        value: [issue.summary, statusIcon(issue.status)].filter(v => !!v).join(' '),
                    },
                    hover: {
                        kind: sourcegraph.MarkupKind.PlainText as sourcegraph.MarkupKind.PlainText,
                        value: `${issue.summary} (${issue.key})`,
                    },
                }
            },
        })
    })
}

function statusIcon(status: Issue['status']): string | undefined {
    switch (status) {
        case 'todo':
            return '🔨'
        case 'inprogress':
            return '💬'
        case 'done':
            return '✅'
    }
    return undefined
}
