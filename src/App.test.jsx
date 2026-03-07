/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from './App';

test('renders login page for unauthenticated users', async () => {
  localStorage.clear();
  render(<App />);
  expect(await screen.findByText(/welcome back/i)).toBeTruthy();
  expect(screen.getByText(/sign in to your account/i)).toBeTruthy();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  expect(screen.getByRole('link', { name: /create one/i })).toBeTruthy();
});
