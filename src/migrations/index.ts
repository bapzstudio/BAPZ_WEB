import * as migration_20260908_135429_initial from './20260908_135429_initial';
import * as migration_20260909_131815_ajout_slug_profs from './20260909_131815_ajout_slug_profs';
import * as migration_20260909_181704_cours_inclus_tarifs from './20260909_181704_cours_inclus_tarifs';
import * as migration_20260910_082126_parcours_reservation from './20260910_082126_parcours_reservation';
import * as migration_20260910_090517_salles_photo_tarif from './20260910_090517_salles_photo_tarif';
import * as migration_20260910_104950_reglages_telephone_horaires from './20260910_104950_reglages_telephone_horaires';
import * as migration_20260910_130815_reglages_informations_legales from './20260910_130815_reglages_informations_legales';
import * as migration_20260911_074738_retrait_bouton_essai from './20260911_074738_retrait_bouton_essai';

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
    name: '20260910_090517_salles_photo_tarif',
  },
  {
    up: migration_20260910_104950_reglages_telephone_horaires.up,
    down: migration_20260910_104950_reglages_telephone_horaires.down,
    name: '20260910_104950_reglages_telephone_horaires',
  },
  {
    up: migration_20260910_130815_reglages_informations_legales.up,
    down: migration_20260910_130815_reglages_informations_legales.down,
    name: '20260910_130815_reglages_informations_legales',
  },
  {
    up: migration_20260911_074738_retrait_bouton_essai.up,
    down: migration_20260911_074738_retrait_bouton_essai.down,
    name: '20260911_074738_retrait_bouton_essai'
  },
];
