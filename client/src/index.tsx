import React from 'react';
import { createRoot } from 'react-dom/client';
import TodoApp from './app/TodoApp.js';

const root = document.getElementById('root');
if (!root) throw new Error('App root element is missing');
createRoot(root).render(<TodoApp />);
