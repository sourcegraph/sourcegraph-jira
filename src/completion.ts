import * as sourcegraph from 'sourcegraph'
import { getAPIParams, getIssues } from './jira'

const projectKeys = ['DEMO']

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
            const word = doc.text.slice(doc.offsetAt(wordRange.start), doc.offsetAt(wordRange.end))
            const prefix = `${projectKeys[0]}-`
            if (!word.toLowerCase().startsWith(prefix.toLowerCase())) {
                return null
            }

            const project = word.slice(0, prefix.length - 1)
            const query = word.slice(prefix.length)

            const issues = await getIssues(apiParams, project, query)
            return {
                items: issues.map(issue => ({ label: `${issue.key}: ${issue.summary}`, insertText: issue.url + ' ' })),
            }
        },
    })
}
