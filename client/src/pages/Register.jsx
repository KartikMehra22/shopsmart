import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Auth.module.css';

function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});

  const score = useMemo(() => strengthScore(password), [password]);
  const barColor =
    score <= 1
      ? 'var(--color-text-danger)'
      : score === 2
        ? 'var(--color-text-warning)'
        : 'var(--color-text-success)';

  const validate = useCallback(() => {
    const e = {};
    if (name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required.';
    if (strengthScore(password) < 3) e.password = 'Use a stronger password.';
    if (password !== confirm) e.confirm = 'Passwords must match.';
    if (!agree) e.agree = 'You must accept the terms.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, email, password, confirm, agree]);

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
        <h1 className={styles.h1}>Create account</h1>
        <p className={styles.sub}>Join ShopSmart in a minute</p>
        <form className={styles.stack} onSubmit={onSubmit} noValidate>
          <Input
            label="Full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: undefined }));
            }}
            onBlur={() => name && name.trim().length < 2 && setErrors((x) => ({ ...x, name: 'Enter your full name.' }))}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((x) => ({ ...x, email: undefined }));
            }}
            onBlur={() =>
              email &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
              setErrors((x) => ({ ...x, email: 'Valid email required.' }))
            }
            error={errors.email}
            autoComplete="email"
          />
          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((x) => ({ ...x, password: undefined }));
              }}
              onBlur={() =>
                password &&
                strengthScore(password) < 3 &&
                setErrors((x) => ({ ...x, password: 'Use a stronger password.' }))
              }
              error={errors.password}
              autoComplete="new-password"
            />
            <div className={styles.strength}>
              <div
                className={styles.strengthBar}
                style={{ width: `${(score / 4) * 100}%`, background: barColor }}
              />
            </div>
            <ul className={styles.checklist}>
              <li>8+ characters</li>
              <li>Uppercase letter</li>
              <li>Number</li>
              <li>Symbol</li>
            </ul>
          </div>
          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((x) => ({ ...x, confirm: undefined }));
            }}
            onBlur={() =>
              confirm &&
              confirm !== password &&
              setErrors((x) => ({ ...x, confirm: 'Passwords must match.' }))
            }
            error={errors.confirm}
            autoComplete="new-password"
          />
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                setErrors((x) => ({ ...x, agree: undefined }));
              }}
            />
            <span>
              I agree to the Terms of Service and Privacy Policy
              {errors.agree && <span className={styles.fieldError}>{errors.agree}</span>}
            </span>
          </label>
          <Button type="submit" variant="primary" fullWidth>
            Create account
          </Button>
        </form>
        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
