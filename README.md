# Jira extension for Sourcegraph

A [Sourcegraph extension](https://docs.sourcegraph.com/extensions) that enhances GitHub with better [Jira](https://www.atlassian.com/software/jira) integration.

[**🗃️ Source code**](https://github.com/sourcegraph/sourcegraph-jira)

[**➕ Add to Sourcegraph**](https://sourcegraph.com/extensions/sourcegraph/jira)

**Status:** beta

## Usage

This extension currently only works on GitHub (and GitHub Enterprise), not on Sourcegraph or other code hosts.

1. Install the [Sourcegraph browser extension](https://docs.sourcegraph.com/integration/browser_extension).
   - In the Sourcegraph browser extension options menu, click the gear (⚙️) and enable **Experimental link previews** and **Experimental text field completion**.
1. [Enable the Jira extension](https://sourcegraph.com/extensions/sourcegraph/jira) in the Sourcegraph extension registry (requires sign-in to Sourcegraph).
1. Configure the Jira extension in [Sourcegraph user settings](https://sourcegraph.com/user/settings): `jira.apiToken`, `jira.url`, and `jira.username`. See info below.
1. Visit any text area, comment, PR, or issue on GitHub and try the [features](#features) below.

If using GitHub Enterprise, right-click on the Sourcegraph browser extension icon when you're on a GitHub Enterprise page and select **Enable Sourcegraph on this domain**.

## Configuring user settings

The `jira.apiToken`, `jira.url`, and `jira.username` values should be added as top-level strings in the user settings (outside of the `extensions` object), eg:

```
{
	"extensions": {
		"sourcegraph/jira": true
	},
	"jira.apiToken": "token",
	"jira.url": "https://example.atlassian.net",
	"jira.username": "user@example.com"
}
```

Follow [these instructions](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) to generate a Jira Cloud API token. The `jira.url` should be the base URL for your Jira instance, eg `https://example.atlassian.net/`. The `jira.username` is the email address you use to authenticate with Jira.

## Features

### Autocompletion of Jira issues

Just start typing a Jira issue key (like `DEMO-123`) to complete it! You can type the issue number or words that appear in the issue summary. Select an issue to insert its URL into the text area. It works just like GitHub's built-in autocompletion for issues, PRs, and users.

![Jira issue autocompletion](https://storage.googleapis.com/sourcegraph-assets/extensions/sourcegraph/jira/jira-autocomplete.png)

### Link previews for Jira issue links

For any Jira issue link that appears on GitHub (in a comment, issue, PR, or rendered Markdown file), you'll see a preview with the title and status.

![Jira issue link previews](https://storage.googleapis.com/sourcegraph-assets/extensions/sourcegraph/jira/jira-linkpreview.png)
