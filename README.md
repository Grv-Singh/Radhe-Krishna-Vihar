# Radha Krishna Vihar - Plot Tracker

## Project Overview
This project is an interactive web application designed to track and manage real estate plots for the **Radha Krishna Vihar** site. It features an interactive SVG-based map overlay, allowing users to visually see the status of various residential and commercial plots, as well as interact with them to view details or update their status.

## Tech Stack
- **Framework:** React
- **Build Tool:** Vite
- **Deployment:** GitHub Pages
- **Backend/Data:** Google Apps Script (integrates with a live Google Sheet for real-time plot statuses)

## Directory Structure
- `public/site_plan.png`: The core master image of the real estate site plan. The map coordinates perfectly align with this image.
- `src/App.jsx`: The main application logic containing the SVG rendering, map mode for drawing polygons, and UI components.
- `src/data.js`: The hardcoded configuration of plot boundaries. Each plot has an ID, area (sqyd), and an array of (x, y) points corresponding to the polygon drawn on the `site_plan.png`.
- `src/index.css` & `src/App.css`: Styling for the interactive map and cards.

## How it Works
1. The app overlays an interactive `<svg>` on top of `site_plan.png`.
2. The coordinates in `src/data.js` are drawn as invisible `<polygon>` elements over the map.
3. When hovering or clicking on a plot, the polygon highlights and displays a yellow ring at the calculated center of the plot.
4. **Admin Mode:** Users can enter a PIN to log in and toggle the status (Available, Booked, Hold, Sold) of plots by clicking them. The changes are sent to a connected Google Sheet via an Apps Script Web App.
5. **Mapping Mode:** An admin feature to manually click 4 corners on the map to generate and export new coordinate mappings for `data.js`.

## Setup & Deployment
- **Run Locally:** `npm run dev` (Starts Vite server on `localhost:5173`)
- **Build for Production:** `npm run build`
- **Deploy to GitHub Pages:** `npm run deploy` (Automatically builds and pushes to the `gh-pages` branch)

## Recent Development Notes
- Successfully cleaned up the repository by removing old OCR and PDF extraction Python scripts. The project is now purely the frontend web application.
- Plots 47-51 were recently annotated visually onto the map image, and their accurate polygonal boundaries were injected into `data.js`. Plot 52 was removed.
