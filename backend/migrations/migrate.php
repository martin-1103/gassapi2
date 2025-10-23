<?php

/**
 * Migration Script for GASS API
 *
 * Usage:
 * php migrate.php                    # Run all pending migrations
 * php migrate.php --rollback         # Rollback last migration batch
 * php migrate.php --fresh            # Drop all tables and re-run
 * php migrate.php --status           # Show migration status
 * php migrate.php --seed             # Run migrations and seed data
 *
 * This script handles individual SQL migration files in the migrations directory.
 */

class Migration {
    private $pdo;
    private $migrationsPath;
    private $dbName = 'gassapi';

    public function __construct() {
        $this->migrationsPath = __DIR__;
        $this->connect();
        $this->ensureMigrationsTable();
    }

    private function connect() {
        try {
            // Connect to MySQL server (without database initially)
            $dsn = "mysql:host=localhost;charset=utf8mb4";
            $this->pdo = new PDO($dsn, 'root', '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    private function ensureMigrationsTable() {
        // Create database if not exists
        $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `{$this->dbName}` DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci");

        // Switch to the database
        $this->pdo->exec("USE `{$this->dbName}`");

        // Create migrations tracking table
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS `migrations` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `migration` VARCHAR(255) NOT NULL,
                `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function getMigrationFiles() {
        $files = glob($this->migrationsPath . '/*.sql');
        sort($files);

        // Filter out setup and complete files from regular processing
        $migrationFiles = array_filter($files, function($file) {
            $basename = basename($file);
            return !in_array($basename, ['000_setup_database.sql', '999_complete_migration.sql']);
        });

        return $migrationFiles;
    }

    private function getExecutedMigrations() {
        $stmt = $this->pdo->query("SELECT migration FROM migrations ORDER BY migration");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    private function runMigrationFile($file) {
        $migration = basename($file);
        echo "Running migration: {$migration}\n";

        $sql = file_get_contents($file);

        try {
            // Handle special files
            if ($migration === '000_setup_database.sql') {
                $this->pdo->exec($sql);
            } elseif ($migration === '999_complete_migration.sql') {
                $this->pdo->exec($sql);
            } else {
                // Regular migration files - execute in database context
                $this->pdo->exec($sql);

                // Record migration
                $stmt = $this->pdo->prepare("INSERT INTO migrations (migration) VALUES (?)");
                $stmt->execute([$migration]);
            }

            echo "Migration completed: {$migration}\n";
            return true;
        } catch (PDOException $e) {
            echo "Error in migration {$migration}: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public function migrate() {
        echo "Starting migration...\n";

        // First run setup if not already done
        $setupFile = $this->migrationsPath . '/000_setup_database.sql';
        if (file_exists($setupFile)) {
            $this->runMigrationFile($setupFile);
        }

        $executed = $this->getExecutedMigrations();
        $files = $this->getMigrationFiles();

        $pending = array_filter($files, function($file) use ($executed) {
            $migration = basename($file);
            return !in_array($migration, $executed);
        });

        if (empty($pending)) {
            echo "No pending migrations.\n";
            return;
        }

        foreach ($pending as $file) {
            if (!$this->runMigrationFile($file)) {
                echo "Migration failed. Stopping.\n";
                return;
            }
        }

        // Finally run completion
        $completeFile = $this->migrationsPath . '/999_complete_migration.sql';
        if (file_exists($completeFile)) {
            $this->runMigrationFile($completeFile);
        }

        echo "All migrations completed successfully!\n";
    }

    public function rollback() {
        echo "Rollback functionality not implemented for SQL files.\n";
        echo "Consider using --fresh to drop and recreate all tables.\n";
    }

    public function fresh() {
        echo "Dropping all tables...\n";

        // Get all tables
        $stmt = $this->pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Disable foreign key checks
        $this->pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

        // Drop all tables except migrations
        foreach ($tables as $table) {
            if ($table !== 'migrations') {
                $this->pdo->exec("DROP TABLE IF EXISTS `{$table}`");
                echo "Dropped table: {$table}\n";
            }
        }

        // Clear migrations log
        $this->pdo->exec("TRUNCATE TABLE migrations");

        // Re-enable foreign key checks
        $this->pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

        echo "Running fresh migration...\n";
        $this->migrate();
    }

    public function status() {
        echo "Migration Status:\n";
        echo "================\n";

        $executed = $this->getExecutedMigrations();
        $files = $this->getMigrationFiles();

        foreach ($files as $file) {
            $migration = basename($file);
            $status = in_array($migration, $executed) ? "✅ Executed" : "⏳ Pending";
            echo "{$status}: {$migration}\n";
        }

        echo "\nTotal: " . count($executed) . "/" . count($files) . " migrations executed\n";
    }

    public function runSeeder() {
        echo "\nRunning database seeder...\n";

        $seederScript = __DIR__ . '/../seeds/seed.php';

        if (!file_exists($seederScript)) {
            echo "Warning: Seeder script not found at {$seederScript}\n";
            echo "Please ensure the seeds directory and seed.php exist.\n";
            return false;
        }

        // Change to parent directory to run seeder
        $originalDir = getcwd();
        chdir(dirname($seederScript));

        // Execute seeder
        $output = [];
        $exitCode = 0;
        exec("php " . basename($seederScript) . " seed", $output, $exitCode);

        // Restore original directory
        chdir($originalDir);

        if ($exitCode === 0) {
            echo "Seeder completed successfully!\n";
            return true;
        } else {
            echo "Seeder failed with exit code: {$exitCode}\n";
            if (!empty($output)) {
                echo "Output:\n" . implode("\n", $output) . "\n";
            }
            return false;
        }
    }

    public function migrateAndSeed() {
        echo "Running migrations and seeding database...\n";

        // First run migrations
        $this->migrate();

        // Then run seeder
        $this->runSeeder();

        echo "Migration and seeding completed!\n";
    }
}

// CLI interface
if (php_sapi_name() === 'cli') {
    $command = $argv[1] ?? 'migrate';

    $migration = new Migration();

    switch ($command) {
        case 'migrate':
            $migration->migrate();
            break;
        case '--rollback':
            $migration->rollback();
            break;
        case '--fresh':
            $migration->fresh();
            break;
        case '--status':
            $migration->status();
            break;
        case '--seed':
            $migration->migrateAndSeed();
            break;
        default:
            echo "Unknown command: {$command}\n";
            echo "Available commands: migrate, --rollback, --fresh, --status, --seed\n";
            break;
    }
}