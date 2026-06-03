"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Client } = require('@elastic/elasticsearch');
const config = require('../config/environment');
let esClient;
let initAttempted;
function buildClientOptions() {
    const elasticsearch = config.elasticsearch || {};
    const { node, apiKey, username, password, tlsInsecure } = elasticsearch;
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
    const elasticsearch = config.elasticsearch || {};
    const { node } = elasticsearch;
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
 * Indexa un documento de auditoría en Elasticsearch
 * No bloqueante desde el caller si se usa .catch()
 */
async function sendAuditToElasticsearch(doc) {
    const client = getClient();
    if (!client)
        return;
    const elasticsearch = config.elasticsearch || {};
    const { index } = elasticsearch;
    const document = {
        '@timestamp': doc.ts || new Date().toISOString(),
        service: 'auth',
        environment: process.env.NODE_ENV || 'development',
        ...doc
    };
    await client.index({ index, document });
}
module.exports = {
    sendAuditToElasticsearch
};
