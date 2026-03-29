import React, { useEffect, useState } from 'react';
import { apiDashboard, type DashboardSummary } from '../../api/apiDashboard';
import { useAuth } from '../auth/AuthProvider';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);

  // Filter States
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // 1st of current month
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCompany, setSelectedCompany] = useState(user?.role === 'ROLE_USER' ? user.companyId : 'SYSTEM');

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPERATOR';

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiDashboard.getSummary({
        fromDate,
        toDate,
        targetCompanyId: selectedCompany
      });
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Fetch companies for all roles to ensure name mapping (even for non-admins)
    apiCompany.list().then(setCompanies).catch(console.error);
  }, []);

  const handleSearch = () => {
    fetchStats(true);
  };

  if (loading) return <div className="loading-state">Syncing Dashboard Analytics...</div>;
  if (!summary) return <div className="error-state">Failed to load dashboard data.</div>;

  // Helper to get specialized pie data in specific order and localized
  const statusOrder = ['OPEN', 'RESOLVED'];
  const statusTranslations: Record<string, string> = {
    'OPEN': '진행중',
    'RESOLVED': '해결됨'
  };

  const pieData = statusOrder.map(key => ({
    name: statusTranslations[key] || key,
    value: (summary.statusDistribution as any)[key] || 0
  })).filter(d => d.value >= 0); // Keep zeros to maintain order in legend if desired, or skip

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="dashboard-root">
      {/* Filter Bar */}
      <div className="filter-bar glass-card">
        <div className="filter-group">
          <label>발생 일자</label>
          <div className="custom-date-container" onClick={(e) => {
             const input = e.currentTarget.querySelector('input');
             if (input && 'showPicker' in input) (input as any).showPicker();
          }}>
            <div className="display-value">{fromDate.replace(/-/g, '.')}</div>
            <input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
            />
          </div>
          <span>~</span>
          <div className="custom-date-container" onClick={(e) => {
             const input = e.currentTarget.querySelector('input');
             if (input && 'showPicker' in input) (input as any).showPicker();
          }}>
            <div className="display-value">{toDate.replace(/-/g, '.')}</div>
            <input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
            />
          </div>
        </div>

        <div className="filter-group">
          <label>고객사</label>
          {isAdmin ? (
            <select 
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="SYSTEM">전체 고객사</option>
              {companies.map((c: CompanyDTO) => (
                <option key={c.companyId} value={c.companyId}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div className="company-badge">
              {companies.find(c => c.companyId === user?.companyId)?.name || user?.companyId}
            </div>
          )}
        </div>

        <button 
          className="search-btn" 
          onClick={handleSearch}
          disabled={refreshing}
        >
          {refreshing ? '조회 중...' : '검색'}
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="metric-grid">
        {isAdmin && (
          <>
            <div className="metric-card glass-card">
              <span className="label">Managed Companies</span>
              <span className="value">{summary.companyCount}</span>
            </div>
            <div className="metric-card glass-card">
              <span className="label">Active Users</span>
              <span className="value">{summary.userCount}</span>
            </div>
          </>
        )}
        <div className="metric-card glass-card highlight">
          <span className="label">전체 요청 건수</span>
          <span className="value">{summary.totalRequests}</span>
        </div>
        <div className="metric-card glass-card">
          <span className="label">금일 생성 건수</span>
          <span className="value accent">{summary.createdToday}</span>
        </div>
        <div className="metric-card glass-card">
          <span className="label">금일 해결 건수</span>
          <span className="value success">{summary.closedToday}</span>
        </div>
      </div>

      <div className="chart-grid">
        {/* Status Distribution */}
        <div className="chart-container glass-card">
          <h3>요청 상태별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.filter(d => d.value > 0).map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(21, 21, 24, 0.95)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  color: 'white'
                }} 
                itemStyle={{ color: 'white' }} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Request Trends */}
        <div className="chart-container glass-card">
          <h3>요청 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                cursor={false}
                contentStyle={{ 
                  backgroundColor: 'rgba(21, 21, 24, 0.95)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  color: 'white'
                }} 
                itemStyle={{ color: 'white' }} 
                formatter={(value: any) => [`${value} 건`, '요청 건수']}
              />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
