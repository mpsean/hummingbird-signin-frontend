import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import styles from './Dashboard.module.css'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean).map(s => s![0].toUpperCase()).join('') ||
    user?.username.slice(0, 2).toUpperCase() || '?'

  return (
    <div className={styles.page}>
      <div className={styles.noise} />

      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.brandIcon}>HM</span>
          <span>Hummingbird</span>
        </div>
        <div className={styles.navRight}>
          <div className={styles.avatar}>{initials}</div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.heroText}>
          <p className={styles.greeting}>Good to see you</p>
          <h1 className={styles.name}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username}
          </h1>
        </div>

        {user?.role === 'admin' ? (
          <div className={styles.adminActions}>
            <Link to="/admin/add-user" className={styles.adminActionBtn}>
              <div className={styles.navBrand}>
                <span className={styles.brandIcon}>HM</span>
                <span>Hummingbird</span>
              </div>
              <span className={styles.adminActionLabel}>Add user →</span>
            </Link>
            <Link to="/admin/remove-user" className={`${styles.adminActionBtn} ${styles.adminActionBtnDanger}`}>
              <div className={styles.navBrand}>
                <span className={styles.brandIcon}>HM</span>
                <span>Hummingbird</span>
              </div>
              <span className={styles.adminActionLabel}>Remove user →</span>
            </Link>
            <Link to="/admin/create-tenant" className={styles.adminActionBtn}>
              <div className={styles.navBrand}>
                <span className={styles.brandIcon}>HM</span>
                <span>Hummingbird</span>
              </div>
              <span className={styles.adminActionLabel}>New tenant →</span>
            </Link>
          </div>
        ) : (
          <a href="https://www.hmmingbird.xyz/home" target="_blank" rel="noreferrer" className={styles.appBtn}>
            <div className={styles.navBrand}>
              <span className={styles.brandIcon}>HM</span>
              <span>Hummingbird</span>
            </div>
            <span className={styles.appBtnLabel}>Open app →</span>
          </a>
        )}

        <div className={styles.grid}>
          <div className={styles.profileCard}>
            <h2 className={styles.cardTitle}>Profile</h2>
            <div className={styles.profileRows}>
              <ProfileRow label="Email" value={user?.email} />
              <ProfileRow label="Username" value={`@${user?.username}`} />
              <ProfileRow label="Role" value={user?.role} badge />
              <ProfileRow label="Member since"
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                }) : '—'} />
              <ProfileRow label="Last login"
                value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'} />
            </div>
          </div>

          <div className={styles.tokenCard}>
            <h2 className={styles.cardTitle}>JWT Token</h2>
            <p className={styles.tokenDesc}>Your current session token</p>
            <code className={styles.token}>
              {localStorage.getItem('token')?.slice(0, 80)}…
            </code>
          </div>
        </div>
      </main>
    </div>
  )
}

function ProfileRow({ label, value, badge }: { label: string; value?: string; badge?: boolean }) {
  return (
    <div className={styles.profileRow}>
      <span className={styles.profileLabel}>{label}</span>
      {badge
        ? <span className={styles.badge}>{value}</span>
        : <span className={styles.profileValue}>{value || '—'}</span>
      }
    </div>
  )
}
