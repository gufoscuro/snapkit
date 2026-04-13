import { execSync } from 'node:child_process'
import { createInterface } from 'node:readline'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((resolve) => rl.question(q, resolve))

async function main() {
  // Check current branch
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()

  if (branch !== 'master') {
    const answer = await ask(
      `⚠ You are on branch "${branch}", not "master". Continue? (y/N) `
    )
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.')
      process.exit(0)
    }
  }

  // Read current version
  const pkg = JSON.parse(
    execSync('cat package.json', { encoding: 'utf-8' })
  )
  const current = pkg.version
  console.log(`\nCurrent version: ${current}\n`)

  // Ask release type
  console.log('Select release type:')
  console.log('  1. development  (x.x.x-dev.N)')
  console.log('  2. patch        (x.x.PATCH)')
  console.log('  3. minor        (x.MINOR.0)')
  console.log('  4. major        (MAJOR.0.0)')

  const choice = await ask('\nRelease type (1-4): ')

  let newVersion

  switch (choice) {
    case '1': {
      // Development pre-release
      const [base] = current.split('-')
      const devMatch = current.match(/-dev\.(\d+)$/)
      const devNum = devMatch ? parseInt(devMatch[1]) + 1 : 0
      newVersion = `${base}-dev.${devNum}`
      break
    }
    case '2':
      newVersion = bumpVersion(current, 'patch')
      break
    case '3':
      newVersion = bumpVersion(current, 'minor')
      break
    case '4':
      newVersion = bumpVersion(current, 'major')
      break
    default:
      console.log('Invalid choice. Aborted.')
      process.exit(1)
  }

  console.log(`\nBumping version: ${current} → ${newVersion}\n`)

  // Update package.json via npm version (no git tag)
  execSync(`npm version ${newVersion} --no-git-tag-version`, { stdio: 'inherit' })

  // Commit the change
  execSync('git add package.json package-lock.json', { stdio: 'inherit' })
  execSync(`git commit -m "chore: Bump app version to ${newVersion}"`, { stdio: 'inherit' })

  console.log(`\n✓ Version bumped to ${newVersion} and committed.`)

  rl.close()
}

function bumpVersion(version, type) {
  const [base] = version.split('-')
  const parts = base.split('.').map(Number)

  switch (type) {
    case 'patch':
      parts[2]++
      break
    case 'minor':
      parts[1]++
      parts[2] = 0
      break
    case 'major':
      parts[0]++
      parts[1] = 0
      parts[2] = 0
      break
  }

  return parts.join('.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
