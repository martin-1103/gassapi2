#!/usr/bin/env php
<?php

/**
 * Database Seeder Wrapper for GASS API
 *
 * This is a convenience wrapper that calls the actual seeder script
 * in the seeds directory.
 *
 * Usage:
 * php seed.php                     # Run all pending seeds
 * php seed.php --refresh           # Refresh all seed data
 * php seed.php --class=UsersSeeder # Run specific seeder
 * php seed.php --status            # Show seeding status
 * php seed.php --rollback          # Rollback last seed batch
 */

// Change to seeds directory and run the actual seeder script
$seedsDir = __DIR__ . '/seeds';
$seederScript = $seedsDir . '/seed.php';

if (!file_exists($seederScript)) {
    fwrite(STDERR, "Seeder script not found: {$seederScript}\n");
    exit(1);
}

// Pass all command line arguments to the actual seeder script
$command = implode(' ', array_map('escapeshellarg', array_slice($argv, 1)));

// Change directory to seeds and execute
chdir($seedsDir);
passthru("php seed.php {$command}", $exitCode);

exit($exitCode);