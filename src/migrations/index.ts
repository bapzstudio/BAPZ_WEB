import * as migration_20260908_135429_initial from './20260908_135429_initial';
import * as migration_20260909_131815_ajout_slug_profs from './20260909_131815_ajout_slug_profs';

export const migrations = [
  {
    up: migration_20260908_135429_initial.up,
    down: migration_20260908_135429_initial.down,
    name: '20260908_135429_initial',
  },
  {
    up: migration_20260909_131815_ajout_slug_profs.up,
    down: migration_20260909_131815_ajout_slug_profs.down,
    name: '20260909_131815_ajout_slug_profs'
  },
];
