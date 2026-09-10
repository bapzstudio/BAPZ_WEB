import * as migration_20260908_135429_initial from './20260908_135429_initial';
import * as migration_20260909_131815_ajout_slug_profs from './20260909_131815_ajout_slug_profs';
import * as migration_20260909_181704_cours_inclus_tarifs from './20260909_181704_cours_inclus_tarifs';
import * as migration_20260910_082126_parcours_reservation from './20260910_082126_parcours_reservation';
import * as migration_20260910_090517_salles_photo_tarif from './20260910_090517_salles_photo_tarif';

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
    name: '20260909_181704_cours_inclus_tarifs',
  },
  {
    up: migration_20260910_082126_parcours_reservation.up,
    down: migration_20260910_082126_parcours_reservation.down,
    name: '20260910_082126_parcours_reservation',
  },
  {
    up: migration_20260910_090517_salles_photo_tarif.up,
    down: migration_20260910_090517_salles_photo_tarif.down,
    name: '20260910_090517_salles_photo_tarif'
  },
];
