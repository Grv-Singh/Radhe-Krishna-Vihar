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

      <div 
        className="wa-btn"
        onClick={(e) => {
          e.stopPropagation();
          window.open(`https://wa.me/?text=Plot%20${plot.id}%20(${plot.sqyd}%20Sq.Yd)%20is%20currently%20${plot.status}.`, '_blank');
        }}
        title="Share on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </div>
    </div>
  )
}

const CircularProgress = ({ percent, color, label, value }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px' }}>
      <div style={{ position: 'relative', width: '70px', height: '70px' }}>
        <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="35" cy="35" r={radius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle cx="35" cy="35" r={radius} fill="transparent" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s ease', strokeLinecap: 'round' }} />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', marginTop: '8px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>{label}</div>
    </div>
  )
}

export default function App() {
  const [authStatus, setAuthStatus] = useState('view'); // 'pending' | 'view' | 'edit'
  const [pin, setPin] = useState('');
  
  const [plots, setPlots] = useState(plotsData);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
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

  const handleDownloadCSV = () => {
    const headers = ['Plot ID', 'Type', 'Sq.Yd', 'Status'];
    const rows = plots.map(p => [p.id, p.type, p.sqyd, p.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plots_status.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const stats = useMemo(() => ({
    total:     plots.length,
    available: plots.filter(p => p.status === 'Available').length,
    booked:    plots.filter(p => p.status === 'Booked').length,
    hold:      plots.filter(p => p.status === 'Hold').length,
    sold:      plots.filter(p => p.status === 'Sold').length,
  }), [plots])

  const sortedPlots = useMemo(() => {
    let filtered = statusFilter === 'All'
      ? plots
      : plots.filter(p => p.status === statusFilter)

    if (sizeFilter !== 'All') {
      if (sizeFilter === '< 100') filtered = filtered.filter(p => p.sqyd < 100);
      else if (sizeFilter === '100 - 150') filtered = filtered.filter(p => p.sqyd >= 100 && p.sqyd <= 150);
      else if (sizeFilter === '> 150') filtered = filtered.filter(p => p.sqyd > 150);
    }

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
  }, [plots, statusFilter, sizeFilter])

  const groupedPlots = useMemo(() => {
    const groups = [
      { title: 'Commercial Plots', prefix: 'C', items: [] },
      { title: 'Shops', prefix: 'S', items: [] },
      { title: 'Residential Plots', prefix: 'Plot', items: [] }
    ];
    sortedPlots.forEach(p => {
      if (p.id.startsWith('C')) groups[0].items.push(p);
      else if (p.id.startsWith('S')) groups[1].items.push(p);
      else groups[2].items.push(p);
    });
    return groups.filter(g => g.items.length > 0);
  }, [sortedPlots]);

  const STATUS_BTNS = [
    { value: 'All',       label: 'All',       cls: 'all', dot: null },
    { value: 'Available', label: 'Available', cls: 'available', dot: '#d1d5db' },
    { value: 'Booked',    label: 'Booked',    cls: 'booked', dot: '#22c55e' },
    { value: 'Hold',      label: 'Hold',      cls: 'hold', dot: '#eab308' },
    { value: 'Sold',      label: 'Sold',      cls: 'sold', dot: '#ec4899' },
  ]

  const SIZE_BTNS = ['All', '< 100', '100 - 150', '> 150'];

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Salemabad Road, Village Roopangarh, Dist. Ajmer (Raj.)</span>
            <button onClick={() => window.open('https://maps.google.com/?q=Salemabad+Road,+Village+Roopangarh,+Dist.+Ajmer', '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', padding: '2px 6px', color: '#fff', fontSize: '0.7rem', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              View on Map
            </button>
          </div>
        </div>
        <div className="legend">
          <div className="legend-item"><span className="legend-dot available" />Available</div>
          <div className="legend-item"><span className="legend-dot booked" />Booked</div>
          <div className="legend-item"><span className="legend-dot hold" />Hold</div>
          <div className="legend-item"><span className="legend-dot sold" />Sold</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
           <span style={{ fontSize: '0.8rem', marginRight: '10px' }}>Mode: {authStatus === 'edit' ? 'Edit' : 'View'}</span>
           <button onClick={() => { 
             if (authStatus === 'edit') {
               setAuthStatus('view');
             } else {
               setAuthStatus('pending');
             }
           }} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #fff', background: 'transparent', color: '#fff', cursor: 'pointer', marginRight: '10px' }}>
             {authStatus === 'edit' ? 'Logout' : 'Admin Login'}
           </button>
           <button onClick={handleDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #10b981', background: '#10b981', color: '#fff', cursor: 'pointer' }}>
             <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
               <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
             </svg>
             Export CSV
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

      {/* Dashboard */}
      <div className="dashboard" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px 10px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <CircularProgress percent={100} color="#64748b" label="Total Plots" value={stats.total} />
        <CircularProgress percent={(stats.available / stats.total) * 100 || 0} color="#d1d5db" label="Available" value={stats.available} />
        <CircularProgress percent={(stats.booked / stats.total) * 100 || 0} color="#22c55e" label="Booked" value={stats.booked} />
        <CircularProgress percent={(stats.hold / stats.total) * 100 || 0} color="#eab308" label="Hold" value={stats.hold} />
        <CircularProgress percent={(stats.sold / stats.total) * 100 || 0} color="#ec4899" label="Sold" value={stats.sold} />
      </div>

      {/* Filters */}
      <div className="controls" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <div className="filter-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="controls-label">Status Filter:</span>
          {STATUS_BTNS.map(btn => (
            <button
              key={btn.value}
              className={`filter-btn ${btn.cls} ${statusFilter === btn.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(btn.value)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {btn.dot && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: btn.dot, display: 'inline-block' }}></span>}
              {btn.label}
            </button>
          ))}
        </div>
        
        <div className="filter-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="controls-label">Size (Gaj):</span>
          {SIZE_BTNS.map(btn => (
            <button
              key={btn}
              className={`filter-btn ${sizeFilter === btn ? 'active all' : ''}`}
              onClick={() => setSizeFilter(btn)}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* Plot Grid by section */}
      <main className="content">
        {sortedPlots.length === 0 && (
          <div className="no-results">No plots match the selected filter.</div>
        )}

        {groupedPlots.map((group, idx) => (
          <div className="section" key={idx} style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', fontSize: '1.2rem', textAlign: 'left' }}>{group.title}</h2>
            <div className="plot-grid">
              {group.items.map(plot => (
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
        ))}
      </main>
    </div>
  )
}
