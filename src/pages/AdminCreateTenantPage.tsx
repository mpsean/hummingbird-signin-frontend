import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/authApi'
import styles from './Auth.module.css'

export default function AdminCreateTenantPage() {
  const [form, setForm] = useState({ slug: '', name: '', frontendUrl: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authApi.createTenant(form)
      setSuccess(`Tenant "${form.name}" created successfully.`)
      setForm({ slug: '', name: '', frontendUrl: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant.')
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
          <h1 className={styles.title}>New tenant</h1>
          <p className={styles.subtitle}>Admin — create a tenant</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Tenant name</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Hotel Grand Bangkok"
              value={form.name}
              onChange={set('name')}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slug</label>
            <input
              className={styles.input}
              type="text"
              placeholder="hotel-grand"
              value={form.slug}
              onChange={set('slug')}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Frontend URL</label>
            <input
              className={styles.input}
              type="url"
              placeholder="https://grand.yourdomain.com"
              value={form.frontendUrl}
              onChange={set('frontendUrl')}
              required
              autoComplete="off"
            />
          </div>

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create tenant'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </div>
    </div>
  )
}
