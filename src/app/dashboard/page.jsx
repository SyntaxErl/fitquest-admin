import StatCard from '@/components/ui/statCard'
import ProgressChart from '@/components/charts/progressChart'
import ActivityChart from '@/components/charts/activityChart'

export default function DashboardPage() {
  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      <style>{`
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 1024px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .chart-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 4px' }}>
          Welcome back, Coach! 👋
        </h2>
        <p style={{ fontSize: '14px', color: '#A0A0A0', margin: 0 }}>
          Here's what's happening with your clients today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard title="Total Clients" value="24" icon="👤" change="+3" changeType="up" />
        <StatCard title="Active Plans" value="18" icon="💪" change="+2" changeType="up" />
        <StatCard title="Workouts Today" value="9" icon="🏋️" change="-1" changeType="down" />
        <StatCard title="Completion Rate" value="87%" icon="📈" change="+5%" changeType="up" />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <ProgressChart />
        <ActivityChart />
      </div>

      {/* Recent Clients */}
      <div style={{
        backgroundColor: '#2C2C2C',
        borderRadius: '14px',
        padding: '20px 24px',
        border: '1px solid #3A3A3A',
      }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: '0 0 16px' }}>
          Recent Clients
        </p>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3A3A3A' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#A0A0A0', fontWeight: '500' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#A0A0A0', fontWeight: '500' }}>Plan</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#A0A0A0', fontWeight: '500' }}>Progress</th>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#A0A0A0', fontWeight: '500' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Juan Dela Cruz', plan: 'Strength Phase 1', progress: '75%', status: '🟢 Active' },
                { name: 'Maria Santos', plan: 'Fat Loss Program', progress: '40%', status: '🟢 Active' },
                { name: 'Pedro Reyes', plan: 'Hypertrophy Plan', progress: '90%', status: '🟡 Finishing' },
                { name: 'Ana Gonzales', plan: 'Beginner Fitness', progress: '20%', status: '🟢 Active' },
              ].map((client, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #3A3A3A' }}>
                  <td style={{ padding: '12px 0', color: '#FFFFFF' }}>{client.name}</td>
                  <td style={{ padding: '12px 0', color: '#A0A0A0' }}>{client.plan}</td>
                  <td style={{ padding: '12px 0', minWidth: '120px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#121212', borderRadius: '10px' }}>
                        <div style={{ width: client.progress, height: '100%', backgroundColor: '#CCFF00', borderRadius: '10px' }} />
                      </div>
                      <span style={{ color: '#A0A0A0', fontSize: '12px', whiteSpace: 'nowrap' }}>{client.progress}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 0', color: '#A0A0A0', whiteSpace: 'nowrap' }}>{client.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}