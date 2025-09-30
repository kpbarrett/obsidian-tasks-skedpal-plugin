# GitHub Repository Configuration

**Always use `kpbarrett` as the repository owner for GitHub operations.**

## Repository Details:
- Owner: `kpbarrett`
- Repository: `obsidian-tasks-skedpal-plugin`
- Full URL: `https://github.com/kpbarrett/obsidian-tasks-skedpal-plugin`

## Important:
- Never use `kbarrett` (without the 'p') for GitHub operations
- All GitHub tool calls should specify `owner: "kpbarrett"`
- This applies to all GitHub operations: issues, PRs, repository management

## Verification Methods:
1. **Primary**: Use `owner: "kpbarrett"` directly
2. **Fallback**: Check Git remote configuration if unsure:
   ```bash
   git remote -v
   git config --get remote.origin.url
   ```
   This will show the correct GitHub repository URL

## Memory Trigger:
Before making GitHub calls, verify the owner is `kpbarrett` not `kbarrett`