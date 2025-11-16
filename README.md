# Global Gateway Group · Sermon Scrolls

This application is crafted with care by **Global Gateway Group**, blending Lovable's rapid ideation workflow with our team's product craftsmanship.

## Project info

**URL**: https://lovable.dev/projects/2b8d1d03-cc26-4d9c-a044-ce3c979231db

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2b8d1d03-cc26-4d9c-a044-ce3c979231db) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Test & Quality Assurance

Global Gateway Group keeps Sermon Scrolls stable with a concise but effective test plan. Run each command from the project root:

| Quality Gate | Command | What it verifies |
| --- | --- | --- |
| [![Node Test Icon](https://img.shields.io/badge/Node.js-Tests-339933?logo=node.js&logoColor=white)](tests/crossReferenceSearch.test.ts) | `npm run test` | Executes the Node test suite (currently focused on `crossReferenceSearch`) using the custom TypeScript loader located in `tests/tsLoader.mjs`. |
| [![ESLint Icon](https://img.shields.io/badge/ESLint-Linting-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/docs/latest/use/getting-started) | `npm run lint` | Runs ESLint across the repo to ensure style, accessibility, and best practices are respected. |
| [![TypeScript Icon](https://img.shields.io/badge/TypeScript-Types-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/docs/handbook/compiler-options.html) | `npx tsc --noEmit` | Performs a project-wide type check so regressions are caught before runtime. |

### Recommended workflow

1. **Install dependencies:** `npm install`
2. **Run tests on every change:** start with `npm run test` for fast feedback.
3. **Validate linting before committing:** `npm run lint` keeps diffs clean for reviewers.
4. **Double-check type safety prior to deployment:** `npx tsc --noEmit` ensures the generated bundles stay type-safe.

If any command fails, address the reported file(s) and rerun the suite until all badges would be "green".

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2b8d1d03-cc26-4d9c-a044-ce3c979231db) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
