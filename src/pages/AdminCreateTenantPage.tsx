import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authApi, HbTenant } from '../services/authApi'
import styles from './Auth.module.css'

type SyncState = 'idle' | 'loading' | 'done' | 'error'

export default function AdminCreateTenantPage() {
  const [tenants, setTenants] = useState<HbTenant[]>([])
  const [loadError, setLoadError] = useState('')
  const [fetching, setFetching] = useState(true)
  const [syncState, setSyncState] = useState<Record<number, SyncState>>({})
  const [syncMsg, setSyncMsg] = useState<Record<number, string>>({})

  useEffect(() => {
    authApi.getHbTenants()
      .then(data => setTenants(data.filter(t => t.isActive)))
      .catch(() => setLoadError('Failed to load tenants from HummingbirdHR.'))
      .finally(() => setFetching(false))
  }, [])

  const addToSignin = async (t: HbTenant) => {
    setSyncState(s => ({ ...s, [t.id]: 'loading' }))
    try {
      await authApi.createTenant({
        slug: t.subdomain,
        name: t.name,
        frontendUrl: `http://${t.subdomain}.hmmbird.xyz`
      })
      setSyncState(s => ({ ...s, [t.id]: 'done' }))
      setSyncMsg(m => ({ ...m, [t.id]: 'Added' }))
    } catch (err: any) {
      setSyncState(s => ({ ...s, [t.id]: 'error' }))
      setSyncMsg(m => ({ ...m, [t.id]: err.response?.data?.message || 'Failed' }))
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.noise} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.card} style={{ maxWidth: 560 }}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>HM</div>
          <span className={styles.brandName}>Hummingbird</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Sync tenants</h1>
          <p className={styles.subtitle}>Admin — import tenants from HummingbirdHR</p>
        </div>

        {loadError && <div className={styles.errorBanner}>{loadError}</div>}

        {fetching && !loadError && (
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Loading tenants…</p>
        )}

        {!fetching && !loadError && tenants.length === 0 && (
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>No active tenants found.</p>
        )}

        {tenants.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {tenants.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text)' }}>
                    {t.name}
                  </div>
                  <div style={{ color: 'var(--text-2)', fontSize: '0.78rem', marginTop: 2 }}>
                    {t.subdomain}
                  </div>
                </div>

                {syncState[t.id] === 'done' && (
                  <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 500 }}>
                    {syncMsg[t.id]}
                  </span>
                )}
                {syncState[t.id] === 'error' && (
                  <span style={{ color: 'var(--error)', fontSize: '0.82rem', maxWidth: 140, textAlign: 'right' }}>
                    {syncMsg[t.id]}
                  </span>
                )}
                {(syncState[t.id] === 'idle' || syncState[t.id] === undefined) && (
                  <button
                    className={styles.btn}
                    style={{ margin: 0, padding: '0.4rem 0.9rem', fontSize: '0.85rem', minHeight: 'unset' }}
                    onClick={() => addToSignin(t)}
                  >
                    Add →
                  </button>
                )}
                {syncState[t.id] === 'loading' && (
                  <button className={styles.btn}
                    style={{ margin: 0, padding: '0.4rem 0.9rem', minHeight: 'unset' }}
                    disabled
                  >
                    <span className={styles.spinner} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <p className={styles.footer}>
          <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </div>
    </div>
  )
}
