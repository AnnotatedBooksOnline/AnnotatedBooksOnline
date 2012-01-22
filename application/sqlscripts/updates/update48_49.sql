BEGIN TRANSACTION;

-- Add a visibility column to to Settings indicating the value of a setting can be requested by the client.
ALTER TABLE "Settings" ADD COLUMN "visible" bit NOT NULL DEFAULT '0';

-- Indicate which existing columns are visible.
UPDATE "Settings" SET "visible" = '1'
  WHERE "settingName" = 'project-title' 
     OR "settingName" = 'welcome-page'
     OR "settingName" = 'info-page'
     OR "settingName" = 'terms-of-use'
     OR "settingName" = 'auto-user-acceptance';

COMMIT;
