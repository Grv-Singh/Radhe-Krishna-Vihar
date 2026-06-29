import { useState, useMemo, useRef, useEffect } from 'react'
import { plotsData } from './data'
import './App.css'

const FORMAT_INR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

const STATUS_COLORS = {
  Available: 'rgba(255, 255, 255, 0.6)',
  Booked: 'rgba(34, 197, 94, 0.4)',
  Hold: 'rgba(234, 179, 8, 0.4)',
  Sold: 'rgba(236, 72, 153, 0.4)'
};

const STATUS_STROKES = {
  Available: '#d1d5db',
  Booked: '#22c55e',
  Hold: '#eab308',
  Sold: '#ec4899'
};

function PlotCard({ plot, isHighlighted, onClick }) {
  const statusClass = plot.status.toLowerCase()
  const highlightClass = isHighlighted ? 'highlighted-card' : ''

  return (
    <div 
      id={`card-${plot.id}`}
      className={`plot-card ${statusClass} ${highlightClass}`} 
      onClick={onClick}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <div className="plot-id">{plot.id}</div>
      <div className="plot-size">{plot.sqyd} Sq.Yd</div>
      <div className="plot-status">{plot.status}</div>
    </div>
  )
}

export default function App() {
  const [authStatus, setAuthStatus] = useState('view'); // 'pending' | 'view' | 'edit'
  const [pin, setPin] = useState('');
  
  const [plots, setPlots] = useState(plotsData);
  const [statusFilter, setStatusFilter] = useState('All');
  const [highlightedPlotId, setHighlightedPlotId] = useState(null);

  const [imageSize, setImageSize] = useState({ width: 2000, height: 1500 });
  const imgRef = useRef(null);



  useEffect(() => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      if (naturalWidth) setImageSize({ width: naturalWidth, height: naturalHeight });
    }
  }, []);

  const handleImageLoad = (e) => {
    setImageSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '5950') {
      setAuthStatus('edit');
    } else {
      alert('Incorrect PIN');
    }
  };

  const togglePlotStatus = (id) => {
    if (authStatus !== 'edit') return;
    setPlots(prev => prev.map(p => {
      if (p.id !== id) return p;
      const statuses = ['Available', 'Booked', 'Hold', 'Sold'];
      const nextIdx = (statuses.indexOf(p.status) + 1) % statuses.length;
      return { ...p, status: statuses[nextIdx] };
    }))
  };



  const stats = useMemo(() => ({
    total:     plots.length,
    available: plots.filter(p => p.status === 'Available').length,
    booked:    plots.filter(p => p.status === 'Booked').length,
    hold:      plots.filter(p => p.status === 'Hold').length,
    sold:      plots.filter(p => p.status === 'Sold').length,
  }), [plots])

  const sortedPlots = useMemo(() => {
    const filtered = statusFilter === 'All'
      ? plots
      : plots.filter(p => p.status === statusFilter)

    return [...filtered].sort((a, b) => {
      const getPrefixWeight = (id) => {
        if (id.startsWith('C')) return 1;
        if (id.startsWith('S')) return 2;
        return 3;
      };
      const weightA = getPrefixWeight(a.id);
      const weightB = getPrefixWeight(b.id);
      if (weightA !== weightB) return weightA - weightB;
      return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [plots, statusFilter])

  const STATUS_BTNS = [
    { value: 'All',       label: 'All',       cls: 'all' },
    { value: 'Available', label: '⚪ Available', cls: 'available' },
    { value: 'Booked',    label: '🟢 Booked',    cls: 'booked' },
    { value: 'Hold',      label: '🟡 Hold',      cls: 'hold' },
    { value: 'Sold',      label: '🩷 Sold',      cls: 'sold' },
  ]

  if (authStatus === 'pending') {
    return (
      <div className="pin-container">
        <div className="pin-box">
          <h2>Radha Krishna Vihar</h2>
          <p>Please enter PIN to edit, or proceed to View.</p>
          <form onSubmit={handlePinSubmit}>
            <input 
              type="password" 
              placeholder="Enter PIN" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="pin-input"
              autoFocus
            />
            <button type="submit" className="pin-btn">Submit PIN</button>
          </form>
          <div className="pin-divider">OR</div>
          <button className="view-btn" onClick={() => setAuthStatus('view')}>View Only</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="site-header">
        <div className="header-title">
          <h1>Radha Krishna Vihar</h1>
          <p>Salemabad Road, Village Roopangarh, Dist. Ajmer (Raj.)</p>
        </div>
        <div className="legend">
          <div className="legend-item"><span className="legend-dot available" />Available</div>
          <div className="legend-item"><span className="legend-dot booked" />Booked</div>
          <div className="legend-item"><span className="legend-dot hold" />Hold</div>
          <div className="legend-item"><span className="legend-dot sold" />Sold</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
           <span style={{ fontSize: '0.8rem', marginRight: '10px' }}>Mode: {authStatus === 'edit' ? 'Edit' : 'View'}</span>
           <button onClick={() => { 
             if (authStatus === 'edit') {
               setAuthStatus('view');
             } else {
               setAuthStatus('pending');
             }
           }} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #fff', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
             {authStatus === 'edit' ? 'Logout' : 'Admin Login'}
           </button>
        </div>
      </header>



      {/* Map UI */}
      <div className="map-wrapper">
        <div className="map-inner">
          <img 
            ref={imgRef}
            src={`${import.meta.env.BASE_URL}site_plan.png`}
            className="map-image" 
            alt="Site Plan" 
            onLoad={handleImageLoad}
            onError={(e) => {
              console.error("Failed to load map image from:", e.target.src);
              e.target.style.display = 'none';
            }}
          />
          <svg 
            className="svg-overlay"
            viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
            width="100%" 
            height="100%"
          >
            {plots.map(plot => {
              if (!plot.points || plot.points.length === 0) return null;
              const pointsStr = plot.points.map(p => `${p.x},${p.y}`).join(' ');
              const isHighlighted = highlightedPlotId === plot.id;
              return (
                <polygon 
                  key={plot.id}
                  points={pointsStr}
                  fill={isHighlighted ? 'rgba(59, 130, 246, 0.6)' : (STATUS_COLORS[plot.status] || 'rgba(0,0,0,0.1)')}
                  stroke={isHighlighted ? '#2563eb' : (STATUS_STROKES[plot.status] || '#ccc')}
                  strokeWidth={isHighlighted ? 4 : 2}
                  style={{ cursor: authStatus === 'edit' ? 'pointer' : 'default', transition: 'all 0.2s' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (authStatus === 'edit') {
                       togglePlotStatus(plot.id);
                    } else {
                       const newId = highlightedPlotId === plot.id ? null : plot.id;
                       setHighlightedPlotId(newId);
                       if (newId) {
                         const card = document.getElementById(`card-${plot.id}`);
                         if (card) {
                           const yOffset = -window.innerHeight / 2;
                           const y = card.getBoundingClientRect().top + window.pageYOffset + yOffset;
                           window.scrollTo({top: y, behavior: 'smooth'});
                         }
                       }
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.setAttribute('stroke-width', '4');
                    e.currentTarget.setAttribute('stroke', '#fff');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.setAttribute('stroke-width', isHighlighted ? '4' : '2');
                    e.currentTarget.setAttribute('stroke', isHighlighted ? '#2563eb' : (STATUS_STROKES[plot.status] || '#ccc'));
                  }}
                >
                  <title>{plot.id} - {plot.status}</title>
                </polygon>
              );
            })}


          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-chip">
          <span className="dot gray" />
          <span className="stat-num">{stats.total}</span>
          Total Plots
        </div>
        <div className="stat-chip">
          <span className="dot white" />
          <span className="stat-num">{stats.available}</span>
          Available
        </div>
        <div className="stat-chip">
          <span className="dot green" />
          <span className="stat-num">{stats.booked}</span>
          Booked
        </div>
        <div className="stat-chip">
          <span className="dot yellow" />
          <span className="stat-num">{stats.hold}</span>
          Hold
        </div>
        <div className="stat-chip">
          <span className="dot pink" />
          <span className="stat-num">{stats.sold}</span>
          Sold
        </div>
      </div>

      {/* Filters */}
      <div className="controls">
        <span className="controls-label">Filter:</span>
        {STATUS_BTNS.map(btn => (
          <button
            key={btn.value}
            className={`filter-btn ${btn.cls} ${statusFilter === btn.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(btn.value)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Plot Grid by section */}
      <main className="content">
        {sortedPlots.length === 0 && (
          <div className="no-results">No plots match the selected filter.</div>
        )}

        {sortedPlots.length > 0 && (
          <div className="section">
            <div className="plot-grid">
              {sortedPlots.map(plot => (
                <PlotCard 
                  key={plot.id} 
                  plot={plot} 
                  isHighlighted={highlightedPlotId === plot.id}
                  onClick={() => {
                    if (authStatus === 'edit') {
                      togglePlotStatus(plot.id);
                    } else {
                      const newId = highlightedPlotId === plot.id ? null : plot.id;
                      setHighlightedPlotId(newId);
                      if (newId) {
                        const mapElem = document.querySelector('.map-wrapper');
                        if (mapElem) {
                          mapElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }
                  }} 
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
