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
    // Seule source d'images du site : Payload, qui sert les fichiers
    // UploadThing derrière `/api/media/file/...`.
    //
    // Pas de `remotePatterns`. Il en existait un pour `**.ufs.sh`, jamais
    // utilisé : il laissait n'importe qui faire traiter par notre optimiseur
    // une image hébergée sur son propre compte UploadThing — donc exposer à
    // Internet les failles de la bibliothèque d'images (sharp / libvips).
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      // Éléments d'identité du studio (planète, mot du logo), fixes et hors
      // de l'admin.
      {
        pathname: '/images/marque/**',
      },
    ],
  },
  // En-têtes de sécurité, sur toutes les réponses. HTTPS strict (HSTS) est
  // posé par l'hébergeur.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Le navigateur ne devine pas le type d'un fichier : un fichier
          // servi comme image ne peut pas s'exécuter comme script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Les sites vers lesquels on renvoie ne voient que le domaine, pas
          // l'adresse complète de la page.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Le site ne peut être affiché dans un cadre que par lui-même
          // (l'aperçu de l'admin) : empêche le « clickjacking ».
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          // Aucune page n'utilise caméra, micro ou géolocalisation.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
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
