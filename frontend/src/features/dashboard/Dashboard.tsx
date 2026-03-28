import React, { useEffect, useState } from 'react';
import { apiDashboard, DashboardSummary } from '../../api/apiDashboard';
import { useAuth } from '../auth/AuthProvider';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPERATOR';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiDashboard.getSummary();
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-state">Syncing Dashboard Analytics...</div>;
  if (!summary) return <div className="error-state">Failed to load dashboard data.</div>;

  const pieData = Object.entries(summary.statusDistribution)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({ name: key, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="dashboard-root">
      {/* Top Metric Cards */}
      <div className="metric-grid">
        {isAdmin && (
          <>
            <div className="metric-card glass-card">
              <span className="label">Total Managed Companies</span>
              <span className="value">{summary.companyCount}</span>
            </div>
            <div className="metric-card glass-card">
              <span className="label">Active Users</span>
              <span className="value">{summary.userCount}</span>
            </div>
          </>
        )}
        <div className="metric-card glass-card highlight">
          <span className="label">Service Requests (Total)</span>
          <span className="value">{summary.totalRequests}</span>
        </div>
        <div className="metric-card glass-card">
          <span className="label">Created Today</span>
          <span className="value accent">{summary.createdToday}</span>
        </div>
        <div className="metric-card glass-card">
          <span className="label">Resolved Today</span>
          <span className="value success">{summary.closedToday}</span>
        </div>
      </div>

      <div className="chart-grid">
        {/* Status Distribution */}
        <div className="chart-container glass-card">
          <h3>Request Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Stats placeholder */}
        <div className="chart-container glass-card">
          <h3>Request Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
