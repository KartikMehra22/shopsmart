import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Auth.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
    if (password.length < 8) e.password = 'At least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password]);

  const onBlurEmail = useCallback(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((x) => ({ ...x, email: 'Enter a valid email.' }));
    }
  }, [email]);

  const onBlurPass = useCallback(() => {
    if (password && password.length < 8) {
      setErrors((x) => ({ ...x, password: 'At least 8 characters.' }));
    }
  }, [password]);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      if (!validate()) return;
      navigate('/');
    },
    [validate, navigate]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>ShopSmart</div>
        <h1 className={styles.h1}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account</p>
        <form className={styles.stack} onSubmit={onSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((x) => ({ ...x, email: undefined }));
            }}
            onBlur={onBlurEmail}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((x) => ({ ...x, password: undefined }));
            }}
            onBlur={onBlurPass}
            error={errors.password}
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            }
          />
          <div className={styles.rowBetween}>
            <Link to="/forgot" className={styles.linkSm}>
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Sign in
          </Button>
        </form>
        <div className={styles.divider}>or continue with</div>
        <div className={styles.stack}>
          <Button variant="ghost" fullWidth type="button">
            Google
          </Button>
          <Button variant="ghost" fullWidth type="button">
            GitHub
          </Button>
        </div>
        <p className={styles.footer}>
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
