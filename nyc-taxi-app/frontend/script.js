// State
let allTrips = [];
let filteredTrips = [];
let sortField = 'pickup_datetime';
let sortOrder = 'desc';
let tripsChart = null;
let heatmapChart = null;
let currentPage = 1;
let totalPages = 1;
const rowsPerPage = 100;

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate duration
function calculateDuration(pickup, dropoff) {
    const duration = (new Date(dropoff) - new Date(pickup)) / 60000;
    return `${Math.round(duration)} min`;
}

// Calculate stats
function calculateStats(trips) {
    const totalTrips = trips.length;
    const totalRevenue = trips.reduce((sum, trip) => sum + (trip.fare_amount || 0) + (trip.tip_amount || 0), 0);
    const avgDistance = totalTrips > 0 
        ? trips.reduce((sum, trip) => sum + (trip.trip_distance || 0), 0) / totalTrips 
        : 0;
    const avgFare = totalTrips > 0 
        ? trips.reduce((sum, trip) => sum + (trip.fare_amount || 0), 0) / totalTrips 
        : 0;

    // document.getElementById('total-trips').textContent = totalTrips.toLocaleString(); // This will be updated separately
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('avg-distance').textContent = `${avgDistance.toFixed(2)} mi`;
    document.getElementById('avg-fare').textContent = `$${avgFare.toFixed(2)}`;
}

// Get hourly data
function getHourlyData(trips) {
    const hourlyMap = new Map();
    
    trips.forEach(trip => {
        const hour = new Date(trip.pickup_datetime).getHours();
        const existing = hourlyMap.get(hour) || { trips: 0, revenue: 0 };
        hourlyMap.set(hour, {
            trips: existing.trips + 1,
            revenue: existing.revenue + (trip.fare_amount || 0) + (trip.tip_amount || 0)
        });
    });

    const data = Array.from({ length: 24 }, (_, i) => {
        const hourData = hourlyMap.get(i) || { trips: 0, revenue: 0 };
        return {
            hour: `${i}:00`,
            trips: hourData.trips,
            revenue: Math.round(hourData.revenue)
        };
    });

    return data;
}

// Update charts
function updateCharts(trips) {
    const hourlyData = getHourlyData(trips);
    
    // Trips chart
    if (tripsChart) {
        tripsChart.destroy();
    }
    const tripsCtx = document.getElementById('trips-chart').getContext('2d');
    tripsChart = new Chart(tripsCtx, {
        type: 'bar',
        data: {
            labels: hourlyData.map(d => d.hour),
            datasets: [{
                label: 'Number of Trips',
                data: hourlyData.map(d => d.trips),
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0' }
                }
            }
        }
    });

    // Heatmap chart (scatter plot)
    if (heatmapChart) {
        heatmapChart.destroy();
    }
    const heatmapCtx = document.getElementById('heatmap-chart').getContext('2d');
    const scatterData = trips.slice(0, 500).map(trip => ({
        x: trip.pickup_longitude,
        y: trip.pickup_latitude
    }));
    
    heatmapChart = new Chart(heatmapCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pickup Locations',
                data: scatterData,
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    title: { display: true, text: 'Latitude', color: '#e2e8f0' },
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                x: {
                    title: { display: true, text: 'Longitude', color: '#e2e8f0' },
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0' }
                }
            }
        }
    });
}

// Sort trips
function sortTrips(trips, field, order) {
    return [...trips].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];
        
        if (field === 'pickup_datetime') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// Update table view
function updateTableView(trips) {
    const tbody = document.getElementById('trips-tbody');
    tbody.innerHTML = '';
    
    const sortedTrips = sortTrips(trips, sortField, sortOrder);
    
    sortedTrips.forEach(trip => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(trip.pickup_datetime)}</td>
            <td>${calculateDuration(trip.pickup_datetime, trip.dropoff_datetime)}</td>
            <td>${(trip.trip_distance || 0).toFixed(2)} mi</td>
            <td>${trip.passenger_count}</td>
            <td>$${(trip.fare_amount || 0).toFixed(2)}</td>
            <td>$${(trip.tip_amount || 0).toFixed(2)}</td>
            <td>$${((trip.fare_amount || 0) + (trip.tip_amount || 0)).toFixed(2)}</td>
            <td>${trip.payment_type === 1 ? 'Credit' : 'Cash'}</td>
        `;
        tbody.appendChild(row);
    });
}


// Update pagination controls
function updatePaginationControls() {
    const pageInfo = document.getElementById('page-info');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Get filter values
function getFilterQuery() {
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const minFare = document.getElementById('min-fare').value;
    const maxFare = document.getElementById('max-fare').value;
    const minDistance = document.getElementById('min-distance').value;
    const maxDistance = document.getElementById('max-distance').value;

    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (minFare) params.append('min_fare', minFare);
    if (maxFare) params.append('max_fare', maxFare);
    if (minDistance) params.append('min_distance', minDistance);
    if (maxDistance) params.append('max_distance', maxDistance);

    return params.toString();
}

// Apply filters
function applyFilters() {
    fetchTotalTrips();
    refreshTable(1);
}

// Fetch trips for table
async function refreshTable(page = 1) {
    const tableBody = document.getElementById('trips-tbody');
    const originalHtml = tableBody.innerHTML;
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading...</td></tr>';

    const filterQuery = getFilterQuery();
    const query = `?page=${page}&limit=${rowsPerPage}&${filterQuery}`;

    try {
        const response = await fetch(`http://localhost:5011/api/trips${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        allTrips = data || [];
        filteredTrips = allTrips;
        currentPage = page;
        
        updateTableView(filteredTrips);
        updatePaginationControls();
        
    } catch (error) {
        console.error('Error fetching trips:', error);
        showToast('Failed to load trip data', 'error');
        tableBody.innerHTML = originalHtml;
    }
}

async function fetchTotalTrips() {
    const filterQuery = getFilterQuery();
    const query = `?${filterQuery}`;

    try {
        const response = await fetch(`http://localhost:5011/api/trips/count${query}`);
        const data = await response.json();
        const totalTrips = data.count;
        totalPages = Math.ceil(totalTrips / rowsPerPage);
        document.getElementById('total-trips').textContent = totalTrips.toLocaleString();
    } catch (error) {
        console.error('Error fetching total trips count:', error);
    }
}


// Initial data load
async function initialLoad() {
    try {
        document.getElementById('loading-screen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');

        await fetchTotalTrips();
        await refreshTable(1);

        // Initial stats and charts based on the first page
        calculateStats(filteredTrips);
        updateCharts(filteredTrips);
        
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        showToast('Trip data loaded successfully');
    } catch (error) {
        console.error('Error during initial load:', error);
        showToast('Failed to load initial data', 'error');
    }
}


// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initialLoad();
    
    // Event listeners
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            refreshTable(currentPage - 1);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            refreshTable(currentPage + 1);
        }
    });

    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const field = e.target.dataset.field;
            if (sortField === field) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortOrder = 'desc';
            }
            updateTableView(filteredTrips);
        });
    });
});