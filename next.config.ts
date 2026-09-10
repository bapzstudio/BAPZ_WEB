import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    // Obligatoire depuis Next 16 : toute qualité non listée ici est ramenée à
    // la valeur autorisée la plus proche. 90 pour les portraits des profs, qui
    // ont déjà subi une compression à l'extraction depuis la maquette.
    qualities: [75, 90],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    // Les fichiers vivent chez UploadThing (`xthjbjqeai.ufs.sh/f/<clé>`) mais
    // Payload les sert derrière `/api/media/file/...` : c'est `localPatterns`
    // ci-dessus qui s'applique. Ce motif n'est utile que si l'on passe un jour
    // le plugin en `disablePayloadAccessControl`, où l'URL stockée devient
    // l'URL UploadThing directe.
    remotePatterns: [
      { protocol: 'https', hostname: '**.ufs.sh', pathname: '/f/**' },
    ],
  },
  // Les salles ont rejoint la page Tarifs (maquette du 2026-09-10) : l'ancienne
  // adresse, déjà présente dans le sitemap, mène à leur section.
  async redirects() {
    return [
      { source: '/location', destination: '/tarifs#locations', permanent: true },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
