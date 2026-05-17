/**
 * Scrapes coffee brewing methods from Wikipedia and upserts them into MongoDB.
 * Run: node scripts/scraper.js
 *
 * Wikipedia page: https://en.wikipedia.org/wiki/Coffee_preparation
 * The scraper extracts h2/h3 headings inside the brewing-methods section,
 * infers filterType from surrounding text, and assigns BrewerIDs that don't
 * collide with what's already in the DB.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Brewer from "../models/Brewers.js";

dotenv.config();

const WIKIPEDIA_URL =
  "https://en.wikipedia.org/wiki/Coffee_preparation";

// Sections on the Wikipedia page that describe individual brewing devices
const BREWING_SECTIONS = [
  "Boiling",
  "Steeping",
  "Filtration",
  "Pressure",
  "Espresso",
  "Pod",
  "Drip",
  "Pour",
  "Vacuum",
  "Cold",
  "Percolat",
];

/**
 * Infers a brewer's filter type from the surrounding paragraph text on the
 * Wikipedia page. Checks for keywords in this priority order:
 *   cloth/flannel → "cloth"
 *   paper filter  → "paper"
 *   metal/stainless/wire mesh → "metal"
 *   no filter/unfiltered/grounds/pressure/boil → "N/A"
 * Defaults to "N/A" when no keyword matches.
 */
function inferFilterType(text) {
  const t = text.toLowerCase();
  if (t.includes("cloth") || t.includes("flannel")) return "cloth";
  if (t.includes("paper filter") || t.includes("paper-filter")) return "paper";
  if (
    t.includes("metal filter") ||
    t.includes("metal mesh") ||
    t.includes("stainless") ||
    t.includes("wire mesh")
  )
    return "metal";
  if (
    t.includes("no filter") ||
    t.includes("unfiltered") ||
    t.includes("grounds") ||
    t.includes("pressure") ||
    t.includes("boil")
  )
    return "N/A";
  return "N/A";
}

// Headings that are page navigation noise, not actual brewers
const SKIP_NAMES = new Set([
  "Coffee preparation",
  "Contents",
  "History",
  "See also",
  "References",
  "External links",
  "Brewing",
  "Notes",
  "Gallery",
]);

/**
 * Fetches the Wikipedia "Coffee preparation" page and extracts brewer names
 * from h2/h3/h4 headings that fall within brewing-related sections (defined by
 * BREWING_SECTIONS keywords). Falls back to a sequential scan of headings after
 * the "Brewing methods" h2 if the primary strategy finds nothing.
 * Returns an array of { name, filterType } objects ready for DB insertion.
 */
async function scrape() {
  console.log("Fetching Wikipedia page…");
  const { data: html } = await axios.get(WIKIPEDIA_URL, {
    headers: { "User-Agent": "BrewBook-scraper/1.0 (educational project)" },
  });

  const $ = cheerio.load(html);
  const candidates = [];

  // Collect every h2/h3/h4 heading and the text of the paragraph that follows it
  $("h2, h3, h4").each((_, el) => {
    const heading = $(el);
    const name = heading.find(".mw-headline").text().trim();
    if (!name || SKIP_NAMES.has(name)) return;

    // Only keep headings that fall inside a brewing-related section
    const inBrewingSection = BREWING_SECTIONS.some((kw) =>
      name.toLowerCase().includes(kw.toLowerCase())
    );

    // Walk up to the nearest section and check the parent h2 label too
    const sectionText = heading
      .closest("section, div.mw-parser-output")
      .prevAll("h2")
      .first()
      .find(".mw-headline")
      .text();

    const parentIsBrewingRelated = BREWING_SECTIONS.some((kw) =>
      sectionText.toLowerCase().includes(kw.toLowerCase())
    );

    if (!inBrewingSection && !parentIsBrewingRelated) return;

    // Grab surrounding paragraph for filter-type inference
    const context = heading.next("p").text();
    candidates.push({ name, filterType: inferFilterType(context) });
  });

  if (candidates.length === 0) {
    // Fallback: grab all h3s that sit anywhere after the "Brewing methods" h2
    let inBrewingSection = false;
    $("h2, h3").each((_, el) => {
      const name = $(el).find(".mw-headline").text().trim();
      if (name === "Brewing methods" || name === "Brewing") {
        inBrewingSection = true;
        return;
      }
      if ($(el).is("h2") && inBrewingSection) {
        inBrewingSection = false;
        return;
      }
      if (inBrewingSection && name && !SKIP_NAMES.has(name)) {
        const context = $(el).next("p").text();
        candidates.push({ name, filterType: inferFilterType(context) });
      }
    });
  }

  console.log(`Found ${candidates.length} candidate brewers from Wikipedia.`);

  if (candidates.length === 0) {
    console.warn(
      "No brewers found. Wikipedia's page structure may have changed.\n" +
        "Consider running seed.js instead, or inspect the HTML manually."
    );
    return [];
  }

  return candidates;
}

/**
 * Main entry point for the scraper script. Connects to MongoDB, determines the
 * next available BrewerID (to avoid collisions with seeded data), runs the
 * Wikipedia scraper, and upserts any new brewers by Name — skipping entries
 * that already exist in the collection. Disconnects when done.
 */
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Find the highest existing BrewerID to avoid collisions
  const last = await Brewer.findOne().sort({ BrewerID: -1 }).lean();
  let nextID = last ? last.BrewerID + 1 : 1;

  const candidates = await scrape();
  let inserted = 0;
  let skipped = 0;

  for (const { name, filterType } of candidates) {
    const exists = await Brewer.findOne({ Name: name });
    if (exists) {
      console.log(`  Skipped (already in DB): ${name}`);
      skipped++;
      continue;
    }
    await Brewer.create({ BrewerID: nextID++, Name: name, filterType, trackedParameters: {} });
    console.log(`  Inserted: ${name} [${filterType}]`);
    inserted++;
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
