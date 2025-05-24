/// <reference types="react" />
/// <reference types="react/jsx-runtime" />

declare module 'react' {
  import * as React from '@types/react';
  export = React;
  export as namespace React;
}

declare module 'react/jsx-runtime' {
  import * as JSXRuntime from '@types/react/jsx-runtime';
  export = JSXRuntime;
  export as namespace JSXRuntime;
}

declare module 'react-dom/client' {
  import * as ReactDOMClient from '@types/react-dom/client';
  export = ReactDOMClient;
  export as namespace ReactDOMClient;
} 