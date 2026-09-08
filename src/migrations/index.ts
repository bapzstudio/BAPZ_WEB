import * as migration_20260908_135429_initial from './20260908_135429_initial';

export const migrations = [
  {
    up: migration_20260908_135429_initial.up,
    down: migration_20260908_135429_initial.down,
    name: '20260908_135429_initial'
  },
];
