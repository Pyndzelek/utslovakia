import * as migration_20260926_020142_baseline from './20260926_020142_baseline';
import * as migration_20260926_020508_roles_versions_site_settings from './20260926_020508_roles_versions_site_settings';

export const migrations = [
  {
    up: migration_20260926_020142_baseline.up,
    down: migration_20260926_020142_baseline.down,
    name: '20260926_020142_baseline',
  },
  {
    up: migration_20260926_020508_roles_versions_site_settings.up,
    down: migration_20260926_020508_roles_versions_site_settings.down,
    name: '20260926_020508_roles_versions_site_settings'
  },
];
