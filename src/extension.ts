import * as sourcegraph from 'sourcegraph'
import { registerCompanyCompletionProvider as registerIssueCompletionProvider } from './completion'
import { registerLinkPreviewProvider } from './linkPreview'

export function activate(ctx: sourcegraph.ExtensionContext): void {
    ctx.subscriptions.add(registerLinkPreviewProvider())
    ctx.subscriptions.add(registerIssueCompletionProvider())
}
