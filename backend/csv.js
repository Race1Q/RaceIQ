/**
 * CSV Generation Utility for Driver Standings
 * Converts standings data to CSV format without external dependencies
 */

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }

  return stringValue;
}

function generateCsv(data, headers = null) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // If headers not provided, use keys from first object
  if (!headers) {
    headers = Object.keys(data[0]);
  }

  // Create header row
  const csvRows = [headers.map(escapeCsvValue).join(',')];

  // Create data rows
  for (const row of data) {
    const csvRow = headers.map(header => {
      const value = row[header];
      return escapeCsvValue(value);
    });
    csvRows.push(csvRow.join(','));
  }

  return csvRows.join('\n') + '\n';
}

function generateDriverStandingsCsv(standingsData) {
  const headers = [
    'position',
    'driver',
    'name_acronym',
    'driver_number',
    'points',
    'wins'
  ];

  // Transform data to match CSV headers
  const csvData = standingsData.map(standing => ({
    position: standing.position,
    driver: standing.driver,
    name_acronym: standing.name_acronym,
    driver_number: standing.driver_number,
    points: standing.points,
    wins: standing.wins
  }));

  return generateCsv(csvData, headers);
}

function generateStandingsCsvWithMetadata(standingsData, season) {
  const headers = [
    'season',
    'position',
    'driver',
    'name_acronym',
    'driver_number',
    'points',
    'wins'
  ];

  // Add season to each row
  const csvData = standingsData.map(standing => ({
    season: season,
    position: standing.position,
    driver: standing.driver,
    name_acronym: standing.name_acronym,
    driver_number: standing.driver_number,
    points: standing.points,
    wins: standing.wins
  }));

  return generateCsv(csvData, headers);
}

module.exports = {
  generateCsv,
  generateDriverStandingsCsv,
  generateStandingsCsvWithMetadata,
  escapeCsvValue
};