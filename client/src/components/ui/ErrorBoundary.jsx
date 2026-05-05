import PropTypes from 'prop-types';
import { Component } from 'react';
import Button from './Button';
import styles from './ErrorBoundary.module.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className={styles.screen} role="alert">
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.desc}>
            We hit an unexpected error. You can try refreshing the page.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className={styles.btn}
          >
            Refresh
          </Button>
          <details className={styles.details}>
            <summary className={styles.summary}>Technical details</summary>
            <pre className={styles.pre}>{String(error?.stack || error?.message || error)}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};
