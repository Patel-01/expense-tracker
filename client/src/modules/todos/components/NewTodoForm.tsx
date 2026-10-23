import React from 'react';
import Button from '../../../shared/components/Button.js';

interface NewTodoFormProps {
  onSubmit(task: string): Promise<void>;
}

interface NewTodoFormState {
  task: string;
  submitting: boolean;
}

export default class NewTodoForm extends React.Component<NewTodoFormProps, NewTodoFormState> {
  state: NewTodoFormState = { task: '', submitting: false };

  private readonly submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    const task = this.state.task.trim();
    if (!task || this.state.submitting) return;

    this.setState({ submitting: true });
    try {
      await this.props.onSubmit(task);
      this.setState({ task: '' });
    } catch {
      // The page shows the error; keep the draft so the user can retry
    } finally {
      this.setState({ submitting: false });
    }
  };

  render(): React.ReactNode {
    const { task, submitting } = this.state;
    return <form className="line compose" onSubmit={event => void this.submit(event)}>
      <label htmlFor="new-task" className="visually-hidden">New task</label>
      <input
        id="new-task"
        value={task}
        onChange={event => this.setState({ task: event.currentTarget.value })}
        placeholder="Write a task and press Enter"
        autoComplete="off"
        autoFocus
      />
      <Button variant="primary" type="submit" disabled={!task.trim() || submitting}>Add task</Button>
    </form>;
  }
}
