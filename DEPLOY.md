# Update your existing GitHub Pages website

Your Git-connected working folder:

`C:\Users\lenovo\OneDrive\Desktop\right\projects\ict-mcq-practice-github`

1. Extract the new ZIP and open its `ict-mcq-practice-main/` folder.
2. Copy **everything inside** into the Git-connected folder above, replacing matching files. Keep its hidden `.git` directory.
3. Open Git Bash in the Git-connected folder and run:

```bash
pwd
git status
git add -A
git commit -m "Add bilingual light dark Three.js ICT design"
git push origin main
```

4. Verify the deployment at https://arafat-rahman-lisan.github.io/ict-mcq-practice/ . Hard refresh with Ctrl + Shift + R if needed.

**Do not upload secrets.** `config.js` needs only the public Cloudflare Worker endpoint. Your Worker code and its secret Gemini key are deployed separately.

**Included updated files:** `index.html`, `script.js`, `styles.css`, **new** `experience.js`, **new** `ambient3d.js`, **new** `theme-v4.css`, README and screenshots. Keep all of them together at the repository root alongside `data/` and `assets/`.
