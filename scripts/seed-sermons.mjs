#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyEnvFile(fileName) {
  const filePath = path.resolve(process.cwd(), fileName);
  try {
    const raw = await readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const match = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      const value = rawValue.replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function loadEnvironment() {
  await applyEnvFile('.env.local');
  await applyEnvFile('.env');
}

function resolveSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      'Supabase URL is not configured. Set SUPABASE_URL or VITE_SUPABASE_URL before running this script.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Supabase service role key is required to import sermons. Set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return { url, key: serviceRoleKey };
}

async function readSermonFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const data = JSON.parse(content);
  if (!Array.isArray(data)) {
    throw new Error('Sermon data file must contain a JSON array.');
  }

  return data.map((item, index) => {
    const { title, date, location, paragraphs } = item;
    if (!title || !date || !location) {
      throw new Error(`Sermon at index ${index} is missing title, date, or location.`);
    }
    const normalizedParagraphs = Array.isArray(paragraphs) ? paragraphs : [];
    return { title, date, location, paragraphs: normalizedParagraphs };
  });
}

async function importSermons(supabase, sermons) {
  let importedCount = 0;

  for (const sermon of sermons) {
    const { title, date, location, paragraphs } = sermon;
    console.log(`\nProcessing: ${title} (${date})`);

    const { data: existingSermon, error: fetchError } = await supabase
      .from('sermons')
      .select('id')
      .eq('title', title)
      .eq('date', date)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to check existing sermon "${title}": ${fetchError.message}`);
    }

    let sermonId = existingSermon?.id;

    if (sermonId) {
      const { error: updateError } = await supabase
        .from('sermons')
        .update({ location })
        .eq('id', sermonId);

      if (updateError) {
        throw new Error(`Failed to update sermon "${title}": ${updateError.message}`);
      }

      const { error: deleteError } = await supabase
        .from('sermon_paragraphs')
        .delete()
        .eq('sermon_id', sermonId);

      if (deleteError) {
        throw new Error(
          `Failed to clear existing paragraphs for sermon "${title}": ${deleteError.message}`
        );
      }
    } else {
      const { data: insertedSermon, error: insertError } = await supabase
        .from('sermons')
        .insert({ title, date, location })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to insert sermon "${title}": ${insertError.message}`);
      }

      sermonId = insertedSermon.id;
    }

    if (paragraphs.length > 0) {
      const paragraphRows = paragraphs.map((content, idx) => ({
        sermon_id: sermonId,
        paragraph_number: idx + 1,
        content,
      }));

      const { error: insertParagraphError } = await supabase
        .from('sermon_paragraphs')
        .insert(paragraphRows);

      if (insertParagraphError) {
        throw new Error(
          `Failed to insert paragraphs for sermon "${title}": ${insertParagraphError.message}`
        );
      }
    }

    importedCount += 1;
    console.log(`Imported ${paragraphs.length} paragraphs for "${title}".`);
  }

  return importedCount;
}

async function main() {
  await loadEnvironment();

  const { url, key } = resolveSupabaseConfig();
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const inputPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.resolve(__dirname, '../public/sample-data/sermons-sample.json');

  console.log(`Loading sermons from ${inputPath}`);
  const sermons = await readSermonFile(inputPath);

  if (sermons.length === 0) {
    console.log('No sermons found in the provided file. Nothing to import.');
    return;
  }

  const count = await importSermons(supabase, sermons);
  console.log(`\n✅ Successfully imported ${count} sermon${count === 1 ? '' : 's'}.`);
}

main().catch((error) => {
  console.error('\n❌ Import failed:', error.message);
  process.exit(1);
});
