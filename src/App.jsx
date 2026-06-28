import { useState, useMemo } from 'react'
import { plotsData } from './data'
import './App.css'

const FORMAT_INR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

const SECTION_TYPES = [
  { key: 'Residential',    label: '🏠 Residential Plots',    prefix: 'Plot' },
  { key: 'Commercial',     label: '🏢 Commercial Plots',     prefix: 'C-' },
  { key: 'Shop',           label: '🛒 Shop Plots',           prefix: 'S-' },
]

function PlotCard({ plot }) {
  const statusClass = plot.status.toLowerCase()
  const value = plot.sqyd * plot.rate

  return (
    <div className={`plot-card ${statusClass}`} title={`${plot.id} — ${plot.type}\n${plot.size} | ${plot.sqyd} Sq.Yd\n${FORMAT_INR(value)}${plot.buyer ? `\nBuyer: ${plot.buyer}` : ''}`}>
      <div className="plot-id">{plot.id}</div>
      <div className="plot-size">{plot.size}</div>
      <div className="plot-status">{plot.status}</div>
      {plot.buyer && <div className="plot-buyer">👤 {plot.buyer}</div>}
      <div className="plot-value">{FORMAT_INR(value)}</div>
    </div>
  )
}

export default function App() {
  const [statusFilter, setStatusFilter] = useState('All')

  const stats = useMemo(() => ({
    total:     plotsData.length,
    available: plotsData.filter(p => p.status === 'Available').length,
    booked:    plotsData.filter(p => p.status === 'Booked').length,
    sold:      plotsData.filter(p => p.status === 'Sold').length,
  }), [])

  const sections = useMemo(() => {
    const filtered = statusFilter === 'All'
      ? plotsData
      : plotsData.filter(p => p.status === statusFilter)

    return SECTION_TYPES.map(sec => ({
      ...sec,
      plots: filtered.filter(p => p.type.includes(sec.key)),
    })).filter(s => s.plots.length > 0)
  }, [statusFilter])

  const STATUS_BTNS = [
    { value: 'All',       label: 'All',       cls: 'all' },
    { value: 'Available', label: '🟢 Available', cls: 'available' },
    { value: 'Booked',    label: '🟡 Booked',    cls: 'booked' },
    { value: 'Sold',      label: '🔴 Sold',       cls: 'sold' },
  ]

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
      </header>

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
                <PlotCard key={plot.id} plot={plot} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
