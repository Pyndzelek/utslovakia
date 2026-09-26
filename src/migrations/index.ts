import * as migration_20260926_020142_baseline from './20260926_020142_baseline';
import * as migration_20260926_020508_roles_versions_site_settings from './20260926_020508_roles_versions_site_settings';
import * as migration_20260926_111101_remove_versions from './20260926_111101_remove_versions';
import * as migration_20260926_113021_remove_company_id_registration from './20260926_113021_remove_company_id_registration';
import * as migration_20260926_123539_search_unaccent from './20260926_123539_search_unaccent';

export const migrations = [
  {
    up: migration_20260926_020142_baseline.up,
    down: migration_20260926_020142_baseline.down,
    name: '20260926_020142_baseline',
  },
  {
    up: migration_20260926_020508_roles_versions_site_settings.up,
    down: migration_20260926_020508_roles_versions_site_settings.down,
    name: '20260926_020508_roles_versions_site_settings',
  },
  {
    up: migration_20260926_111101_remove_versions.up,
    down: migration_20260926_111101_remove_versions.down,
    name: '20260926_111101_remove_versions',
  },
  {
    up: migration_20260926_113021_remove_company_id_registration.up,
    down: migration_20260926_113021_remove_company_id_registration.down,
    name: '20260926_113021_remove_company_id_registration',
  },
  {
    up: migration_20260926_123539_search_unaccent.up,
    down: migration_20260926_123539_search_unaccent.down,
    name: '20260926_123539_search_unaccent'
  },
];
