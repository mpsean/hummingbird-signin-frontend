import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../services/authApi'
import styles from './Auth.module.css'

export default function AdminRemoveUserPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authApi.deleteUser(username)
      setSuccess(`User "${username}" has been removed.`)
      setUsername('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove user.')
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
          <h1 className={styles.title}>Remove user</h1>
          <p className={styles.subtitle}>Admin — delete an account</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <button className={styles.btnDanger} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Remove user'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </div>
    </div>
  )
}
