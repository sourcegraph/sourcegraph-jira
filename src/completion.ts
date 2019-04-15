import escapeHTML from 'escape-html'
import * as sourcegraph from 'sourcegraph'
import { getAPIParams, getIssues } from './jira'

export function registerCompanyCompletionProvider(): sourcegraph.Unsubscribable {
    return sourcegraph.languages.registerCompletionItemProvider([{ scheme: 'comment' }, { scheme: 'snippet' }], {
        provideCompletionItems: async (doc, pos) => {
            const apiParams = getAPIParams()
            if (apiParams instanceof Error) {
                throw new Error(`Error: ${apiParams.message}`)
            }

            if (!doc.text) {
                return null
            }

            const wordRange = doc.getWordRangeAtPosition(pos)
            if (!wordRange) {
                return null
            }
            let word = doc.text.slice(doc.offsetAt(wordRange.start), doc.offsetAt(wordRange.end))

            // Support completion of full URLs like "https://example.atlassian.net/browse/KEY-" and just "KEY-".
            const fullURLPrefix = `${apiParams.jiraUrl.replace(/\/$/, '')}/browse/`
            if (word.startsWith(fullURLPrefix)) {
                word = word.slice(fullURLPrefix.length)
            }

            // Look for "KEY-", where KEY is a possibly valid Jira issue key ([A-Z]{2,}).
            const m = word.match(/^([A-Z]{2,})-/)
            if (!m) {
                return null
            }
            const project = m[1]
            const query = word.slice(m[0].length)

            const issues = await getIssues(apiParams, project, query)
            return {
                items: issues.map(issue => ({
                    label: issue.key,
                    description: issue.summary,
                    insertText: escapeHTML(issue.url) + ' ',
                })),
            }
        },
    })
}
