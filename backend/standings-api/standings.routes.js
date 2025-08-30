const express = require('express');
const { query } = require('./db');
const { generateDriverStandingsCsv } = require('./csv');

const router = express.Router();

// SQL query for getting latest driver standings for a season
// Replaced with a simplified query that directly uses the season column
const DRIVER_STANDINGS_QUERY = `
SELECT
  d.first_name || ' ' || d.last_name AS driver,
  ds.points::float AS points,
  ds.position,
  ds.wins::int AS wins
FROM driver_standings ds
JOIN drivers d ON d.id = ds.driver_id
WHERE ds.season = $1
ORDER BY ds.position ASC;
`;


const CURRENT_SEASON_QUERY = `
SELECT MAX(season) AS year
FROM driver_standings;
`;

// Validation helpers
function validateSeason(season) {
  if (!season) return null;
  const year = parseInt(season, 10);
  if (isNaN(year) || year < 1950 || year > 2100) {
    throw new Error('Invalid season year');
  }
  return year;
}

function validatePagination(page, limit) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100); // Max 100 per page

  if (pageNum < 1) {
    throw new Error('Page must be greater than 0');
  }

  return { page: pageNum, limit: limitNum };
}

function validateSortField(sort) {
  const allowedFields = ['points', 'wins', 'position'];
  return allowedFields.includes(sort) ? sort : 'points';
}

function validateSortDirection(dir) {
  return dir === 'asc' ? 'ASC' : 'DESC';
}

// GET /api/standings/drivers - JSON response
router.get('/drivers', async (req, res) => {
  try {
    const {
      season: seasonParam,
      page = 1,
      limit = 20,
      sort = 'points',
      dir = 'desc',
      format = 'json'
    } = req.query;

    // Validate parameters
    const season = validateSeason(seasonParam);
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);
    const sortField = validateSortField(sort);
    const sortDirection = validateSortDirection(dir);

    // Get current season if not specified
    let targetSeason = season;
    if (!targetSeason) {
      const seasonResult = await query(CURRENT_SEASON_QUERY);
      if (seasonResult.rows.length === 0) {
        return res.status(404).json({ error: 'No seasons found in database' });
      }
      targetSeason = seasonResult.rows[0].year;
    }

    // Get standings data
    const standingsResult = await query(DRIVER_STANDINGS_QUERY, [targetSeason]);

    if (standingsResult.rows.length === 0) {
      return res.status(404).json({
        error: `No standings found for season ${targetSeason}`
      });
    }

    let standings = standingsResult.rows;

    // Apply sorting
    standings.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null values
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // Numeric comparison for points, wins, position
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'ASC' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (sortDirection === 'ASC') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    // Apply pagination
    const totalItems = standings.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedStandings = standings.slice(startIndex, endIndex);

    // Handle CSV format
    if (format === 'csv') {
      const csvData = generateDriverStandingsCsv(paginatedStandings);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="driver-standings-${targetSeason}.csv"`);
      return res.send(csvData);
    }

    // JSON response
    res.json({
      season: targetSeason,
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages,
      data: paginatedStandings
    });

  } catch (error) {
    console.error('Error fetching driver standings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/standings/drivers/export - CSV download
router.get('/drivers/export', async (req, res) => {
  try {
    const { season: seasonParam } = req.query;

    // Validate season
    const season = validateSeason(seasonParam);
    let targetSeason = season;

    if (!targetSeason) {
      const seasonResult = await query(CURRENT_SEASON_QUERY);
      if (seasonResult.rows.length === 0) {
        return res.status(404).json({ error: 'No seasons found in database' });
      }
      targetSeason = seasonResult.rows[0].year;
    }

    // Get all standings (no pagination for export)
    const standingsResult = await query(DRIVER_STANDINGS_QUERY, [targetSeason]);

    if (standingsResult.rows.length === 0) {
      return res.status(404).json({
        error: `No standings found for season ${targetSeason}`
      });
    }

    const csvData = generateDriverStandingsCsv(standingsResult.rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="driver-standings-${targetSeason}-full.csv"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    res.send(csvData);

  } catch (error) {
    console.error('Error exporting driver standings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
