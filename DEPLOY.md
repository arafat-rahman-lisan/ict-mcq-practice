# Update your existing GitHub repository

Your Git-connected working copy was:

`C:\Users\lenovo\OneDrive\Desktop\right\projects\ict-mcq-practice-github`

1. Extract this ZIP.
2. Copy the **contents** of `ict-mcq-practice-main/` into that `ict-mcq-practice-github` folder; replace existing files when prompted. **Do not delete the hidden `.git` directory.**
3. Open Git Bash in the `ict-mcq-practice-github` directory and run:

```bash
git status
git add -A
git commit -m "Redesign ICT Practice UI and improve AI learning flow"
git push origin main
```

4. Visit https://arafat-rahman-lisan.github.io/ict-mcq-practice/ and refresh.

The deployed Cloudflare Worker is **not** updated by this frontend push. `config.js` should only contain the public API endpoint, never a secret key.
