import React, { useState, useEffect, useRef } from 'react';
import { Download, Edit2, CheckCircle, X, MapPin, MousePointer2 } from 'lucide-react';
import initialData from './data/plots.json';

const STATUS_COLORS = {
  Available: 'rgba(34, 197, 94, 0.4)',
  Booked: 'rgba(245, 158, 11, 0.4)',
  Sold: 'rgba(100, 116, 139, 0.4)'
};

const STATUS_STROKES = {
  Available: '#22c55e',
  Booked: '#f59e0b',
  Sold: '#64748b'
};

export default function App() {
  const [plots, setPlots] = useState(initialData);
  const [editMode, setEditMode] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [imageSize, setImageSize] = useState({ width: 2000, height: 1500 }); // Default fallback
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

  const handleMapClick = (e) => {
    if (!editMode || !isDrawing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imageSize.width;
    const y = ((e.clientY - rect.top) / rect.height) * imageSize.height;
    
    setDrawingPoints([...drawingPoints, { x: Math.round(x), y: Math.round(y) }]);
  };

  const startDrawing = (plotId) => {
    setSelectedPlot(plots[plotId]);
    setDrawingPoints([]);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (drawingPoints.length > 2 && selectedPlot) {
      setPlots({
        ...plots,
        [selectedPlot.id]: {
          ...selectedPlot,
          points: drawingPoints
        }
      });
    }
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  const cancelDrawing = () => {
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  const updatePlotField = (id, field, value) => {
    setPlots({
      ...plots,
      [id]: {
        ...plots[id],
        [field]: value
      }
    });
    
    if (selectedPlot && selectedPlot.id === id) {
      setSelectedPlot({ ...selectedPlot, [field]: value });
    }
  };

  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plots, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "plots.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Stats
  const plotsArray = Object.values(plots);
  const total = plotsArray.length;
  const available = plotsArray.filter(p => p.status === 'Available').length;
  const booked = plotsArray.filter(p => p.status === 'Booked').length;
  const sold = plotsArray.filter(p => p.status === 'Sold').length;

  return (
    <div className="app-container">
      {/* Map View */}
      <div className="map-container" onClick={handleMapClick}>
        <div style={{ position: 'relative', width: 'max-content' }}>
          <img 
            ref={imgRef}
            src="./site_plan.png" 
            className="map-image" 
            alt="Site Plan" 
            onLoad={handleImageLoad}
          />
          <svg 
            className="svg-overlay"
            viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
            width="100%" 
            height="100%"
          >
            {/* Render saved plots */}
            {plotsArray.map(plot => {
              if (!plot.points || plot.points.length === 0) return null;
              
              const pointsStr = plot.points.map(p => `${p.x},${p.y}`).join(' ');
              const isSelected = selectedPlot && selectedPlot.id === plot.id;
              
              return (
                <polygon 
                  key={plot.id}
                  points={pointsStr}
                  fill={STATUS_COLORS[plot.status] || 'rgba(0,0,0,0.1)'}
                  stroke={isSelected ? '#fff' : (STATUS_STROKES[plot.status] || '#ccc')}
                  strokeWidth={isSelected ? 4 : 2}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlot(plot);
                  }}
                />
              );
            })}
            
            {/* Render currently drawing polygon */}
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
                  <circle key={i} cx={p.x} cy={p.y} r="6" className="editor-point" />
                ))}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Side Panel Dashboard */}
      <div className="side-panel glass">
        <div className="panel-header">
          <h1>Radha Krishna Vihar</h1>
          <p>Interactive Plot Tracker</p>
        </div>

        {!editMode ? (
          <>
            <div className="status-grid">
              <div className="status-card">
                <h3>{total}</h3>
                <p>Total Plots</p>
              </div>
              <div className="status-card">
                <h3 className="color-available">{available}</h3>
                <p>Available</p>
              </div>
              <div className="status-card">
                <h3 className="color-booked">{booked}</h3>
                <p>Booked</p>
              </div>
              <div className="status-card">
                <h3 className="color-sold">{sold}</h3>
                <p>Sold</p>
              </div>
            </div>

            {selectedPlot && (
              <div className="glass" style={{ padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedPlot.id}</h2>
                  <span className={`badge bg-${selectedPlot.status.toLowerCase()}`}>
                    {selectedPlot.status}
                  </span>
                </div>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label>Type / Category</label>
                  <div style={{ fontWeight: 500 }}>{selectedPlot.category}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div className="form-group">
                    <label>Dimensions</label>
                    <div style={{ fontWeight: 500 }}>{selectedPlot.dimensions}</div>
                  </div>
                  <div className="form-group">
                    <label>Area (Sq.Yds)</label>
                    <div style={{ fontWeight: 500 }}>{selectedPlot.area}</div>
                  </div>
                </div>
                {selectedPlot.buyer && (
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label>Buyer Name</label>
                    <div style={{ fontWeight: 500 }}>{selectedPlot.buyer}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setEditMode(true)}>
                <Edit2 size={18} /> Enter Editor Mode
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Editor Mode */}
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Edit2 size={16} /> <strong>Editor Mode Active</strong>
            </div>

            <div className="form-group">
              <label>Select Plot to Edit</label>
              <select 
                className="form-control"
                value={selectedPlot ? selectedPlot.id : ''}
                onChange={(e) => setSelectedPlot(plots[e.target.value])}
              >
                <option value="">-- Choose Plot --</option>
                {Object.values(plots).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} ({p.status}) {p.points?.length ? '✓ Mapped' : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlot && (
              <div className="glass" style={{ padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="form-control"
                    value={selectedPlot.status}
                    onChange={(e) => updatePlotField(selectedPlot.id, 'status', e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Buyer Name (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedPlot.buyer || ''}
                    onChange={(e) => updatePlotField(selectedPlot.id, 'buyer', e.target.value)}
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Map Coordinates</label>
                  
                  {isDrawing ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={finishDrawing}>
                        <CheckCircle size={16} /> Finish
                      </button>
                      <button className="btn btn-outline" onClick={cancelDrawing}>
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => startDrawing(selectedPlot.id)}>
                      <MousePointer2 size={16} /> {selectedPlot.points?.length ? 'Redraw Polygon' : 'Draw Polygon'}
                    </button>
                  )}
                  {isDrawing && <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>Click on the map to add points. Click Finish when done.</p>}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={exportJson}>
                <Download size={18} /> Export JSON Data
              </button>
              <button className="btn btn-outline" onClick={() => {
                setEditMode(false);
                setIsDrawing(false);
              }}>
                <X size={18} /> Exit Editor Mode
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
