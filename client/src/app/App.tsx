import React from 'react';
import ExpensesPage from '../modules/expenses/pages/ExpensesPage.js';
import '../shared/styles.css';

/** Application composition point for cross-feature providers and routing. */
export default class App extends React.Component {
  render(): React.ReactNode {
    return <ExpensesPage />;
  }
}
