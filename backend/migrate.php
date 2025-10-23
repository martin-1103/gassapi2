#!/usr/bin/env php
<?php

/**
 * Migration Script for GASS API
 *
 * This is a convenience wrapper that calls the actual migration script
 * in the migrations directory.
 *
 * Usage:
 * php migrate.php                    # Run all pending migrations
 * php migrate.php --rollback         # Rollback last migration batch
 * php migrate.php --fresh            # Drop all tables and re-run
 * php migrate.php --status           # Show migration status
 * php migrate.php --seed             # Run migrations and seed data
 */

// Change to migrations directory and run the actual migration script
$migrationsDir = __DIR__ . '/migrations';
$migrationScript = $migrationsDir . '/migrate.php';

if (!file_exists($migrationScript)) {
    fwrite(STDERR, "Migration script not found: {$migrationScript}\n");
    exit(1);
}

// Pass all command line arguments to the actual migration script
$command = implode(' ', array_map('escapeshellarg', array_slice($argv, 1)));

// Change directory to migrations and execute
chdir($migrationsDir);
passthru("php migrate.php {$command}", $exitCode);

exit($exitCode);