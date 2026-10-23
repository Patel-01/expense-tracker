import React from 'react';

type ButtonVariant = 'default' | 'primary' | 'quiet';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
}

/** Shared button behavior and styling contract for feature components. */
export default class Button extends React.Component<ButtonProps> {
  render(): React.ReactNode {
    const { variant = 'default', type = 'button', children, ...attributes } = this.props;
    const classes = ['button'];
    if (variant !== 'default') classes.push(`button-${variant}`);

    return <button {...attributes} type={type} className={classes.join(' ')}>{children}</button>;
  }
}
