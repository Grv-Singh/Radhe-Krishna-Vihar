import { useState, useMemo, useRef, useEffect } from 'react'
import { plotsData } from './data'
import './App.css'

const FORMAT_INR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

const SECTION_TYPES = [
  { key: 'Residential',    label: '🏠 Residential Plots',    prefix: 'Plot' },
  { key: 'Commercial',     label: '🏢 Commercial Plots',     prefix: 'C-' },
  { key: 'Shop',           label: '🛒 Shop Plots',           prefix: 'S-' },
]

const STATUS_COLORS = {
  Available: 'rgba(34, 197, 94, 0.4)',
  Booked: 'rgba(245, 158, 11, 0.4)',
  Sold: 'rgba(239, 68, 68, 0.4)'
};

const STATUS_STROKES = {
  Available: '#22c55e',
  Booked: '#f59e0b',
  Sold: '#ef4444'
};

function PlotCard({ plot, onToggle }) {
  const statusClass = plot.status.toLowerCase()
  const value = plot.sqyd * plot.rate

  return (
    <div 
      className={`plot-card ${statusClass}`} 
      title={`${plot.id} — ${plot.type}\n${plot.size} | ${plot.sqyd} Sq.Yd\n${FORMAT_INR(value)}${plot.buyer ? `\nBuyer: ${plot.buyer}` : ''}`}
      onClick={onToggle}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <div className="plot-id">{plot.id}</div>
      <div className="plot-size">{plot.size}</div>
      <div className="plot-status">{plot.status}</div>
      {plot.buyer && <div className="plot-buyer">👤 {plot.buyer}</div>}
      <div className="plot-value">{FORMAT_INR(value)}</div>
    </div>
  )
}

export default function App() {
  const [authStatus, setAuthStatus] = useState('pending'); // 'pending' | 'view' | 'edit'
  const [pin, setPin] = useState('');
  
  const [plots, setPlots] = useState(plotsData);
  const [statusFilter, setStatusFilter] = useState('All');

  const [imageSize, setImageSize] = useState({ width: 2000, height: 1500 });
  const imgRef = useRef(null);

  // Editor states
  const [editMode, setEditMode] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

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
      const statuses = ['Available', 'Booked', 'Sold'];
      const nextIdx = (statuses.indexOf(p.status) + 1) % statuses.length;
      return { ...p, status: statuses[nextIdx] };
    }))
  };

  // Editor Functions
  const handleMapClick = (e) => {
    if (!editMode || !isDrawing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imageSize.width;
    const y = ((e.clientY - rect.top) / rect.height) * imageSize.height;
    
    setDrawingPoints([...drawingPoints, { x: Math.round(x), y: Math.round(y) }]);
  };

  const startDrawing = () => {
    if (!selectedPlotId) return;
    setDrawingPoints([]);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (drawingPoints.length > 2 && selectedPlotId) {
      setPlots(prev => prev.map(p => 
        p.id === selectedPlotId ? { ...p, points: drawingPoints } : p
      ));
    }
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  const cancelDrawing = () => {
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  const exportDataJS = () => {
    const fileContent = `export const plotsData = ${JSON.stringify(plots, null, 2)};`;
    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(fileContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "data.js");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const stats = useMemo(() => ({
    total:     plots.length,
    available: plots.filter(p => p.status === 'Available').length,
    booked:    plots.filter(p => p.status === 'Booked').length,
    sold:      plots.filter(p => p.status === 'Sold').length,
  }), [plots])

  const sections = useMemo(() => {
    const filtered = statusFilter === 'All'
      ? plots
      : plots.filter(p => p.status === statusFilter)

    return SECTION_TYPES.map(sec => ({
      ...sec,
      plots: filtered.filter(p => p.type.includes(sec.key)),
    })).filter(s => s.plots.length > 0)
  }, [plots, statusFilter])

  const STATUS_BTNS = [
    { value: 'All',       label: 'All',       cls: 'all' },
    { value: 'Available', label: '🟢 Available', cls: 'available' },
    { value: 'Booked',    label: '🟡 Booked',    cls: 'booked' },
    { value: 'Sold',      label: '🔴 Sold',       cls: 'sold' },
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
          <div className="legend-item"><span className="legend-dot sold" />Sold</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
           <span style={{ fontSize: '0.8rem', marginRight: '10px' }}>Mode: {authStatus === 'edit' ? 'Edit' : 'View'}</span>
           <button onClick={() => { setAuthStatus('pending'); setEditMode(false); }} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #fff', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {/* Editor Toolbar */}
      {authStatus === 'edit' && (
        <div className="editor-toolbar">
          <button 
            className={`edit-toggle-btn ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Exit Mapping Mode' : 'Enter Mapping Mode'}
          </button>
          
          {editMode && (
            <div className="editor-controls">
              <select 
                value={selectedPlotId} 
                onChange={e => setSelectedPlotId(e.target.value)}
                className="plot-select"
              >
                <option value="">-- Select Plot to Map --</option>
                {plots.map(p => (
                  <option key={p.id} value={p.id}>{p.id} {p.points?.length ? '(Mapped)' : ''}</option>
                ))}
              </select>
              
              {!isDrawing ? (
                <button className="tool-btn" onClick={startDrawing} disabled={!selectedPlotId}>
                  Draw Polygon
                </button>
              ) : (
                <>
                  <button className="tool-btn success" onClick={finishDrawing}>Finish</button>
                  <button className="tool-btn cancel" onClick={cancelDrawing}>Cancel</button>
                  <span className="draw-hint">Click on map to add points...</span>
                </>
              )}
              
              <button className="tool-btn export" onClick={exportDataJS}>Export data.js</button>
            </div>
          )}
        </div>
      )}

      {/* Map UI */}
      <div className="map-wrapper">
        <div className="map-inner" onClick={handleMapClick} style={{ cursor: isDrawing ? 'crosshair' : 'default' }}>
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
              const isSelected = selectedPlotId === plot.id && editMode;
              return (
                <polygon 
                  key={plot.id}
                  points={pointsStr}
                  fill={STATUS_COLORS[plot.status] || 'rgba(0,0,0,0.1)'}
                  stroke={isSelected ? '#3b82f6' : (STATUS_STROKES[plot.status] || '#ccc')}
                  strokeWidth={isSelected ? 4 : 2}
                  style={{ cursor: authStatus === 'edit' && !isDrawing ? 'pointer' : 'default', transition: 'all 0.2s' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editMode && isDrawing) {
                       handleMapClick(e);
                    } else if (editMode && !isDrawing) {
                       setSelectedPlotId(plot.id);
                    } else if (authStatus === 'edit') {
                       togglePlotStatus(plot.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if(!isDrawing) {
                      e.currentTarget.setAttribute('stroke-width', '4');
                      e.currentTarget.setAttribute('stroke', '#fff');
                    }
                  }}
                  onMouseLeave={(e) => {
                    if(!isDrawing) {
                      e.currentTarget.setAttribute('stroke-width', isSelected ? '4' : '2');
                      e.currentTarget.setAttribute('stroke', isSelected ? '#3b82f6' : (STATUS_STROKES[plot.status] || '#ccc'));
                    }
                  }}
                >
                  <title>{plot.id} - {plot.status}</title>
                </polygon>
              );
            })}

            {isDrawing && drawingPoints.length > 0 && (
              <>
                <polygon 
                  points={drawingPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
                {drawingPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="6" fill="#3b82f6" />
                ))}
              </>
            )}
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
          <span className="dot green" />
          <span className="stat-num">{stats.available}</span>
          Available
        </div>
        <div className="stat-chip">
          <span className="dot yellow" />
          <span className="stat-num">{stats.booked}</span>
          Booked
        </div>
        <div className="stat-chip">
          <span className="dot red" />
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
        {sections.length === 0 && (
          <div className="no-results">No plots match the selected filter.</div>
        )}

        {sections.map(sec => (
          <div className="section" key={sec.key}>
            <div className="section-title">
              {sec.label}
              <span className="section-count">{sec.plots.length}</span>
            </div>
            <div className={`plot-grid ${sec.key === 'Shop' ? 'shops' : ''}`}>
              {sec.plots.map(plot => (
                <PlotCard 
                  key={plot.id} 
                  plot={plot} 
                  onToggle={() => togglePlotStatus(plot.id)} 
                />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
