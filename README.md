# ResQ AI

[![Build Status](https://img.shields.io/travis/shreenxdhi/resq-ai/master.svg?style=flat-square)](https://travis-ci.org/shreenxdhi/resq-ai)
[![Deploy Status](https://img.shields.io/github/workflow/status/shreenxdhi/resq-ai/deploy?style=flat-square)](https://github.com/shreenxdhi/resq-ai/actions)

ResQ AI is an intelligent emergency response assistance platform that helps first responders make critical decisions faster. It leverages AI to analyze emergency situations and provide actionable insights in real-time. 

---

## 🚀 Deploying the Frontend as a Static Site on Render

To deploy the ResQ AI frontend as a static site on [Render](https://render.com):

1. **Build Command:**
   ```
   npm run build
   ```
2. **Publish Directory:**
   ```
   dist
   ```
3. **Start Command:**
   - _Leave this blank for static sites._
4. **Environment Variables:**
   - Only set these if your frontend requires them (e.g., API URLs). Otherwise, leave empty.

Render will automatically serve the files in the `dist` directory after building. No backend or server process is required for static hosting.

---

## Development & Build

### Prerequisites

*   Node.js (check `client/package.json` or Render settings for version, e.g., >=16.0.0)
*   npm or yarn

### Client Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```
    This includes `@types/react` which is necessary for TypeScript compilation with JSX.

3.  To run the development server:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```

4.  To build the client application:
    ```bash
    npm run build
    # or
    # yarn build
    ```

### Troubleshooting Build Issues

*   **TypeScript JSX/React Errors (TS7016, TS7026):**
    *   Ensure `@types/react` is installed in `client/devDependencies`.
    *   Verify `client/tsconfig.json` is correctly configured for `react-jsx`. Refer to the `tsconfig.json` in the repository for a working example.

---