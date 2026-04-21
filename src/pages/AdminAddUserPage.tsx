import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi, Tenant } from '../services/authApi'
import styles from './Auth.module.css'

export default function AdminAddUserPage() {
  const [form, setForm] = useState({
    email: '', username: '', password: '', firstName: '', lastName: '', tenantSlug: 'default'
  })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    authApi.getTenants()
      .then(r => setTenants(r.data.filter(t => t.isActive)))
      .catch(() => setError('Failed to load tenants. Please refresh.'))
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authApi.register(form)
      setSuccess(`User "${form.username}" created successfully.`)
      setForm({ email: '', username: '', password: '', firstName: '', lastName: '', tenantSlug: 'default' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user.')
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
          <div className={styles.brandIcon}>HM</div>
          <span className={styles.brandName}>Hummingbird</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Add user</h1>
          <p className={styles.subtitle}>Admin — create a new account</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

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
            <input className={styles.input} type="email" placeholder="user@company.com"
              value={form.email} onChange={set('email')} required autoComplete="off" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} type="text" placeholder="johndoe"
              value={form.username} onChange={set('username')} required autoComplete="off" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="Min. 8 characters"
              value={form.password} onChange={set('password')} required
              minLength={8} autoComplete="new-password" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tenant Slug</label>
            <input className={styles.input} type="text" placeholder="default"
              value={form.tenantSlug} onChange={set('tenantSlug')} required autoComplete="off" />
          </div>

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create user'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </div>
    </div>
  )
}
