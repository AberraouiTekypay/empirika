import { BigQuery } from '@google-cloud/bigquery';
import { logger } from './logger.js';

let _client = null;

/** Returns a singleton BigQuery client. */
export function getBigQueryClient() {
  if (!_client) {
    const opts = { projectId: process.env.GCP_PROJECT_ID };
    if (process.env.GCP_KEY_FILE) opts.keyFilename = process.env.GCP_KEY_FILE;
    _client = new BigQuery(opts);
  }
  return _client;
}

const DATASET = () => process.env.BIGQUERY_DATASET || 'empirika';
const LOCATION = () => process.env.BIGQUERY_LOCATION || 'US';

/** Ensure the dataset exists, creating it if needed. */
export async function ensureDataset() {
  const bq = getBigQueryClient();
  const ds = bq.dataset(DATASET());
  const [exists] = await ds.exists();
  if (!exists) {
    await bq.createDataset(DATASET(), { location: LOCATION() });
    logger.info('Created BigQuery dataset', { dataset: DATASET() });
  }
  return ds;
}

/**
 * Insert rows into a BigQuery table using streaming inserts.
 * Partial failures are logged but do not throw.
 *
 * @param {string} tableName
 * @param {object[]} rows
 */
export async function insertRows(tableName, rows) {
  if (!rows || rows.length === 0) return;

  const bq = getBigQueryClient();
  const table = bq.dataset(DATASET()).table(tableName);

  try {
    await table.insert(rows, { skipInvalidRows: false, ignoreUnknownValues: true });
    logger.info('Inserted rows', { table: tableName, count: rows.length });
  } catch (err) {
    if (err.name === 'PartialFailureError' && err.errors) {
      const details = err.errors.map(e => ({
        index: e.index,
        errors: e.errors?.map(e2 => e2.message),
      }));
      logger.warn('Partial insert failure — some rows skipped', { table: tableName, details });
    } else {
      logger.error('Insert failed', err, { table: tableName });
      throw err;
    }
  }
}

/**
 * Delete rows for a channel within a date range before re-inserting.
 * Use this to avoid duplicate engagement rows.
 *
 * @param {string} tableName
 * @param {string} channelId
 * @param {string} startDate  YYYY-MM-DD
 * @param {string} endDate    YYYY-MM-DD
 */
export async function deleteEngagementRange(tableName, channelId, startDate, endDate) {
  const bq = getBigQueryClient();
  const query = `
    DELETE FROM \`${process.env.GCP_PROJECT_ID}.${DATASET()}.${tableName}\`
    WHERE channel_id = @channelId
      AND date BETWEEN @startDate AND @endDate
  `;
  await bq.query({
    query,
    params: { channelId, startDate, endDate },
    location: LOCATION(),
  });
  logger.info('Deleted existing rows', { table: tableName, channelId, startDate, endDate });
}

/**
 * Execute a parameterised BigQuery query and return rows.
 *
 * @param {string} query
 * @param {object} params
 * @returns {Promise<object[]>}
 */
export async function runQuery(query, params = {}) {
  const bq = getBigQueryClient();
  const options = { query, location: LOCATION() };
  if (Object.keys(params).length > 0) options.params = params;
  const [rows] = await bq.query(options);
  return rows;
}

/**
 * Upsert channel metadata: delete existing row then insert.
 *
 * @param {object} channelData
 */
export async function upsertChannel(channelData) {
  const bq = getBigQueryClient();

  // Delete existing record for this channel
  await bq.query({
    query: `DELETE FROM \`${process.env.GCP_PROJECT_ID}.${DATASET()}.raw_youtube_channels\` WHERE channel_id = @channelId`,
    params: { channelId: channelData.channel_id },
    location: LOCATION(),
  });

  await insertRows('raw_youtube_channels', [{
    ...channelData,
    last_updated: new Date().toISOString(),
  }]);
}
