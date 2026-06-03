"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Client } = require('@elastic/elasticsearch');
const config = require('../config');
let esClient;
let initAttempted;
function buildClientOptions() {
    const { node, apiKey, username, password, tlsInsecure } = config.elasticsearch;
    const opts = { node };
    if (apiKey) {
        opts.auth = { apiKey };
    }
    else if (username) {
        opts.auth = { username, password: password || '' };
    }
    if (tlsInsecure) {
        opts.tls = { rejectUnauthorized: false };
    }
    return opts;
}
function getClient() {
    if (initAttempted)
        return esClient || null;
    initAttempted = true;
    const { node } = config.elasticsearch;
    if (!node) {
        esClient = null;
        return null;
    }
    try {
        esClient = new Client(buildClientOptions());
        return esClient;
    }
    catch (err) {
        console.error('[audit-es] Client init failed:', err.message);
        esClient = null;
        return null;
    }
}
/**
 * Indexa un documento de auditoría (no bloqueante desde el caller si se usa .catch).
 */
async function sendAuditToElasticsearch(doc) {
    const client = getClient();
    if (!client)
        return;
    const { index } = config.elasticsearch;
    const document = {
        '@timestamp': doc.ts,
        service: 'project-manager',
        ...doc
    };
    await client.index({ index, document });
}
module.exports = {
    sendAuditToElasticsearch
};
