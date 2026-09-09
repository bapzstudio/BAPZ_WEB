import * as migration_20260908_135429_initial from './20260908_135429_initial';
import * as migration_20260909_131815_ajout_slug_profs from './20260909_131815_ajout_slug_profs';
import * as migration_20260909_181704_cours_inclus_tarifs from './20260909_181704_cours_inclus_tarifs';

export const migrations = [
  {
    up: migration_20260908_135429_initial.up,
    down: migration_20260908_135429_initial.down,
    name: '20260908_135429_initial',
  },
  {
    up: migration_20260909_131815_ajout_slug_profs.up,
    down: migration_20260909_131815_ajout_slug_profs.down,
    name: '20260909_131815_ajout_slug_profs',
  },
  {
    up: migration_20260909_181704_cours_inclus_tarifs.up,
    down: migration_20260909_181704_cours_inclus_tarifs.down,
    name: '20260909_181704_cours_inclus_tarifs'
  },
];
