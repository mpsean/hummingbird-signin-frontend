import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', username: '', password: '', firstName: '', lastName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.noise} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>⬡</div>
          <span className={styles.brandName}>Nexus</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Get started for free</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input className={styles.input} type="text" placeholder="John"
                value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input className={styles.input} type="text" placeholder="Doe"
                value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" placeholder="you@company.com"
              value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} type="text" placeholder="johndoe"
              value={form.username} onChange={set('username')} required autoComplete="username" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="Min. 8 characters"
              value={form.password} onChange={set('password')} required
              minLength={8} autoComplete="new-password" />
          </div>

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
