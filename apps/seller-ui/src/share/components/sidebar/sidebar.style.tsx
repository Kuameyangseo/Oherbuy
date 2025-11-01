'use client';
import styled, { createGlobalStyle } from "styled-components";

// Global CSS variables used by the sidebar styles
export const SidebarVariables = createGlobalStyle`
  :root {
    /* spacing scale (adjust values as needed) */
    --space-4: 1rem;      /* 16px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-10: 2.5rem;   /* 40px */
    --space-12: 3rem;     /* 48px */
    --space-13: 3.25rem;  /* 52px */
    --space-18: 4.5rem;   /* 72px */

    /* theme tokens used in sidebar */
    --background: #ffffff;
    --border: #e6e6e6;
  }
`;

export const sidebarWrapper = styled.div`
  background-color: red;
  transition: transform 0.2s ease;
  height: 100%;
  position: fixed;
  transform: translateX(-100%);
  width: 16rem;
  flex-shrink: 0;
  z-index: 202;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding-top: var(--space-10);
  padding-bottom: var(--space-10);
  padding-left: var(--space-6);
  padding-right: var(--space-6);

  ::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    /* update breakpoint as necessary */
    margin-left: 0;
    display: flex;
    position: static;
    height: 100vh;
    transform: translateX(0);
  }

  /* variants for collapsed */
  ${(props: any) => props.collapsed && `display: inherit; margin-left: 0; transform: translateX(0);`}
`;

//overlay component

export const Overlay = styled.div`
  background-color: rgba(15, 23, 42, 0.3);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 201;
  transition: opacity 0.3s ease;
  opacity: 0.8;

  @media (min-width: 768px) {
    display: none;
    z-index: auto;
    opacity: 1;
  }
`;

//Header component
export const Header = styled.div`
  display: flex;
  gap: var(--space-8);
  align-items: center;
  padding-left: var(--space-10);
  padding-right: var(--space-10);

`;

//Body component
export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  margin-top: var(--space-13);
  padding-left: var(--space-4);
  padding-right: var(--space-4);
`; 

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-12);
  padding-top: var(--space-18);
  padding-bottom: var(--space-8);
  padding-left: var(--space-8);
  padding-right: var(--space-8);

  @media (min-width: 768px) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export const Sidebar = {
  Header,
  Body,
  Overlay,
  Footer,
};