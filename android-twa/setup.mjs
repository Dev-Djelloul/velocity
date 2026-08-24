import { createRequire } from 'module'
import { resolve, join } from 'path'
import { promises as fs } from 'fs'

const require = createRequire(import.meta.url)
const CORE_PATH = '/Users/digitalblueskye/.npm/_npx/881cef4662d2c421/node_modules/@bubblewrap/core'

const { TwaManifest, TwaGenerator, JdkHelper, KeyTool, Config, ConsoleLog, BufferedLog } = require(CORE_PATH)

const targetDirectory = resolve('.')
const manifestUrl = 'https://velocity.digitalblueskye.com/manifest.webmanifest'

const config = Config.deserialize(await fs.readFile('/Users/digitalblueskye/.bubblewrap/config.json', 'utf8'))

let twaManifest = await TwaManifest.fromWebManifest(manifestUrl)

twaManifest.packageId = 'com.digitalblueskye.velocitylaunch'
twaManifest.name = 'VelocityLaunch AI'
twaManifest.launcherName = 'Velocity'
twaManifest.appVersionCode = 1
twaManifest.appVersionName = '1'
twaManifest.display = 'standalone'
twaManifest.orientation = 'default'
twaManifest.signingKey.path = join(targetDirectory, 'android.keystore')
twaManifest.signingKey.alias = 'android'
twaManifest.generatorApp = 'bubblewrap-cli'

await twaManifest.saveToFile(join(targetDirectory, 'twa-manifest.json'))

const twaGenerator = new TwaGenerator()
const log = new BufferedLog(new ConsoleLog('Generating TWA'))
await twaGenerator.createTwaProject(targetDirectory, twaManifest, log, () => {})
log.flush()

// Checksum file (same as bubblewrap's own generateManifestChecksumFile)
const crypto = await import('crypto')
const manifestContents = await fs.readFile(join(targetDirectory, 'twa-manifest.json'))
const sum = crypto.createHash('sha1').update(manifestContents).digest('hex')
await fs.writeFile(join(targetDirectory, 'manifest-checksum.txt'), sum)

// Signing key
const jdkHelper = new JdkHelper(process, config)
const keytool = new KeyTool(jdkHelper)

const keystorePassword = process.env.KEYSTORE_PASSWORD
const keyPassword = process.env.KEY_PASSWORD

await keytool.createSigningKey({
  fullName: 'Djelloul Abid',
  organizationalUnit: 'VelocityLaunch',
  organization: 'DigitalBlueSkye',
  country: 'FR',
  password: keystorePassword,
  keypassword: keyPassword,
  alias: twaManifest.signingKey.alias,
  path: twaManifest.signingKey.path,
})

console.log('DONE: TWA project + signing key generated successfully.')
