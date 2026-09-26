// Temporary ambient declaration to silence "Could not find a declaration file"
// for '@tanstack/react-table'. The package ships its own types; this file
// is a non-destructive local fallback when the editor/TS server cannot
// resolve them in the workspace. Remove this once the underlying issue is
// resolved (missing package install / tsconfig typeRoots / workspace setup).

declare module '@tanstack/react-table';
