// Poor man's Mocks and Spies //FIXME use some framework for this
top = {};
chrome = {};
chrome.runtime = {};
chrome.runtime.onInstalled = {};
chrome.storage = {};
chrome.storage.sync = {};

chrome.runtime.onInstalled.addListener = (func) => func();
let migrationTrigger;
chrome.storage.sync.get = (property, migrationFunction) => {
  migrationTrigger = migrationFunction;
};
let migratedConfig;
chrome.storage.sync.set = (cfg) => {
  migratedConfig = cfg.configuration;
};

// Requires
require('../scripts/logger');
require('../scripts/configStoreMigration');

const equal = require('deep-equal');
const assert = require('assert');

const getCfg_pre_1_1_2 = () => require('./json/config.pre1.1.2');
const getCfg_1_1_2 = () => require('./json/config.1.1.2');
const getCfg_1_3_0 = () => require('./json/config.1.3.0');

//Test
const migrationClass = top.TEST.MIGRATION.Migration;
describe('Migrations', () => {
  it('should migrate config from pre-1.1.2 version to the newest one', () => {
    const migrated_pre_1_1_2 = migrationClass.migrate(getCfg_pre_1_1_2());
    assert.ok(equal(migrated_pre_1_1_2, getCfg_1_3_0()));
  });

  it('should migrate config from 1.1.2 version to the newest one', () => {
    const migrated_1_1_2 = migrationClass.migrate(getCfg_1_1_2());
    assert.ok(equal(migrated_1_1_2, getCfg_1_3_0()));
  });

  it('should not migrate the newest config', () => {
    const migrated_1_3_0 = migrationClass.migrate(getCfg_1_3_0());
    assert.ok(equal(migrated_1_3_0, getCfg_1_3_0()));
  });

  it('should register migration trigger into chrome.storage.sync.get', () => {
    console.log(typeof migrationTrigger);
    assert.equal(typeof migrationTrigger, 'function');
  });

  it('migration trigger should migrate config upon invocation', () => {
    const configuration = getCfg_pre_1_1_2();

    migrationTrigger({'configuration': configuration});

    assert.ok(equal(configuration, getCfg_1_3_0()));
    assert.ok(equal(migratedConfig, getCfg_1_3_0()));
  });

  it('migration trigger should return default config if config does not exist', () => {
    migrationTrigger({'configuration': undefined});

    assert.ok(equal(migratedConfig, top.TEST.MIGRATION.defaultConfig));
  });
});