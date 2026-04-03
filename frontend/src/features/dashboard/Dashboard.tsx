import React, { useEffect, useState } from 'react';
import { apiDashboard, type DashboardSummary } from '../../api/apiDashboard';
import { useAuth } from '../auth/AuthProvider';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCompany, setSelectedCompany] = useState(user?.role === 'ROLE_USER' ? user.companyId : 'SYSTEM');

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPERATOR';

  const fetchStats = async (isManual = false, retryCount = 0) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await apiDashboard.getSummary({
        fromDate,
        toDate,
        targetCompanyId: selectedCompany
      });
      
      if (!res.data) throw new Error('Empty Payload');
      
      setSummary(res.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      // Intentionally silent during retries to avoid console clutter. 
      // Browser-level 'RED GET' error is unavoidable for real requests.
      if (retryCount < 2) {
        setTimeout(() => fetchStats(isManual, retryCount + 1), 5000);
      } else {
        console.error('Master Synchronization Failed after 3 attempts', err);
        setError('데이터를 불러오는 중 문제가 발생했습니다. 서버 연결을 확인해 주세요.');
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchStats();
      apiCompany.list({ size: 1000 }).then(res => setCompanies(res.content)).catch(console.error);
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="dashboard-loading-overlay">
        <div className="loading-content">
          <div className="clock-wrapper">
            <Clock className="spinning-clock" size={48} />
          </div>
          <div className="status-text">ITIL v5 Analytics Synchronizing...</div>
          <div className="progress-bar-container">
            <div className="progress-pulse-line"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="dashboard-loading-overlay">
        <div className="error-content glass-card">
          <AlertCircle size={48} className="tw-text-rose-500 tw-mb-4" />
          <div className="status-text">{error}</div>
          <button className="retry-btn" onClick={() => fetchStats(true)}>
            <RefreshCw size={16} /> 다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const statusOrder = ['OPEN', 'RESOLVED'];
  const statusTranslations: Record<string, string> = { 'OPEN': '진행중', 'RESOLVED': '해결됨' };
  const pieData = statusOrder.map(key => ({
    name: statusTranslations[key] || key,
    value: (summary.statusDistribution as any)[key] || 0
  })).filter(d => d.value >= 0);
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="dashboard-root">
      <div className="filter-bar glass-card">
        <div className="filter-group">
          <label>발생 일자</label>
          <div className="custom-date-container" onClick={(e) => {
             const input = e.currentTarget.querySelector('input');
             if (input && 'showPicker' in input) (input as any).showPicker();
          }}>
            <div className="display-value">{fromDate.replace(/-/g, '.')}</div>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <span>~</span>
          <div className="custom-date-container" onClick={(e) => {
             const input = e.currentTarget.querySelector('input');
             if (input && 'showPicker' in input) (input as any).showPicker();
          }}>
            <div className="display-value">{toDate.replace(/-/g, '.')}</div>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        <div className="filter-group">
          <label>고객사</label>
          {isAdmin ? (
            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
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
        <button className="search-btn" onClick={() => fetchStats(true)} disabled={refreshing}>
          {refreshing ? '조회 중...' : '검색'}
        </button>
      </div>

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
        <div className="chart-container glass-card">
          <h3>요청 상태별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.filter(d => d.value > 0).map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(21, 21, 24, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} itemStyle={{ color: 'white' }} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container glass-card">
          <h3>요청 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(21, 21, 24, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} itemStyle={{ color: 'white' }} formatter={(value: any) => [`${value} 건`, '요청 건수']} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
