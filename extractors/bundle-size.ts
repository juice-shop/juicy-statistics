/*
 * Copyright (c) 2024-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const collectData = async (): Promise<void> => {
  const juiceShopPath = process.env.JUICE_SHOP_PATH ?? path.resolve(__dirname, '../../../juice-shop')
  const frontendPath = path.join(juiceShopPath, 'frontend')

  if (!fs.existsSync(frontendPath)) {
    console.log(`Juice Shop frontend not found at ${frontendPath}. Skipping bundle analysis.`)
    return
  }

  console.log(`Generating Webpack Bundle Analysis for ${frontendPath}...`)

  try {
    // Install dependencies if needed (assuming CI environment might need it)
    // using npm ci for clean install or npm install
    console.log('Installing frontend dependencies...')
    execSync('npm install', { cwd: frontendPath, stdio: 'inherit' })

    // Build with stats-json
    console.log('Building frontend with stats...')
    // Use npx to use local ng CLI
    execSync('npx ng build --stats-json', { cwd: frontendPath, stdio: 'inherit' })

    // Find stats.json
    // Angular usually outputs to dist/frontend/stats.json or just dist/stats.json
    // We check common locations
    const possibleStatsPaths = [
      path.join(frontendPath, 'dist', 'frontend', 'stats.json'),
      path.join(frontendPath, 'dist', 'juice-shop', 'stats.json'),
      path.join(frontendPath, 'stats.json')
    ]

    const statsFile = possibleStatsPaths.find(p => fs.existsSync(p))

    if (!statsFile) {
      console.error('Could not find stats.json after build.')
      return
    }

    // Generate static report
    // Destination: we want it in juicy-statistics/public/stats.html so it gets picked up by express (or dist/public/stats.html)
    // The 'collect' script runs from dist/, so process.cwd() is project root if run via npm run collect
    // But better to be explicit.
    
    // We target 'dist/public' because that's where the running server looks for static files.
    // We also might want to copy it to 'public' so it persists in source? 
    // Usually 'public' is source. 'dist/public' is build artifact.
    // If we generate into 'dist/public', it will be served.
    
    const outputDir = path.resolve('dist/public')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const reportPath = path.join(outputDir, 'stats.html')

    console.log(`Generating report to ${reportPath}...`)
    execSync(`npx webpack-bundle-analyzer "${statsFile}" -m static -r "${reportPath}" --no-open`, { stdio: 'inherit' })

    console.log('Webpack Bundle Analysis generated successfully.')

  } catch (error) {
    console.error('Failed to generate bundle analysis:', error)
  }
}

export { collectData }
