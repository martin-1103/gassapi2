<?php

/**
 * Database Seeder for GASS API
 *
 * Usage:
 * php seed.php                     # Run all pending seeds
 * php seed.php --refresh           # Refresh all seed data
 * php seed.php --class=UsersSeeder # Run specific seeder
 * php seed.php --status            # Show seeding status
 * php seed.php --rollback          # Rollback last seed batch
 *
 * This script handles individual SQL seed files with tracking similar to migrations.
 */

class Seeder {
    private $pdo;
    private $seedsPath;
    private $dbName = 'gassapi';

    public function __construct() {
        $this->seedsPath = __DIR__;
        $this->connect();
        $this->ensureSeedsTable();
    }

    private function connect() {
        try {
            // Load database configuration
            $config = $this->getDatabaseConfig();

            // Connect to MySQL server
            $dsn = "mysql:host={$config['host']};charset=utf8mb4";
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            // Switch to the database
            $this->pdo->exec("USE `{$this->dbName}`");

        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    private function getDatabaseConfig() {
        // Try to load from .env file first
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '#') === 0) continue;
                if (strpos($line, '=') === false) continue;

                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }

        return [
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'username' => $_ENV['DB_USERNAME'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
            'database' => $_ENV['DB_DATABASE'] ?? $this->dbName,
            'port' => $_ENV['DB_PORT'] ?? '3306'
        ];
    }

    private function ensureSeedsTable() {
        $this->pdo->exec("
            CREATE TABLE IF NOT EXISTS `seeds` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `seed` VARCHAR(255) NOT NULL,
                `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `batch` INT NOT NULL,
                UNIQUE KEY `seeds_seed_unique` (`seed`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    }

    private function getSeedFiles() {
        $files = glob($this->seedsPath . '/*.sql');
        sort($files);
        return $files;
    }

    private function getExecutedSeeds() {
        $stmt = $this->pdo->query("SELECT seed FROM seeds ORDER BY seed");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    private function runSeedFile($file, $batch = null) {
        $seed = basename($file);
        echo "Running seed: {$seed}\n";

        $sql = file_get_contents($file);

        try {
            // Execute the seed SQL
            $this->pdo->exec($sql);

            // Record the seed execution
            if ($batch === null) {
                $batch = $this->getNextBatchNumber();
            }

            $stmt = $this->pdo->prepare("INSERT INTO seeds (seed, batch) VALUES (?, ?)");
            $stmt->execute([$seed, $batch]);

            echo "Seed completed: {$seed}\n";
            return true;
        } catch (PDOException $e) {
            echo "Error in seed {$seed}: " . $e->getMessage() . "\n";
            return false;
        }
    }

    private function getNextBatchNumber() {
        $stmt = $this->pdo->query("SELECT MAX(batch) as max_batch FROM seeds");
        $result = $stmt->fetch();
        return ($result['max_batch'] ?? 0) + 1;
    }

    public function seed() {
        echo "Starting database seeding...\n";

        $executed = $this->getExecutedSeeds();
        $files = $this->getSeedFiles();

        $pending = array_filter($files, function($file) use ($executed) {
            $seed = basename($file);
            return !in_array($seed, $executed);
        });

        if (empty($pending)) {
            echo "No pending seeds.\n";
            return;
        }

        $batch = $this->getNextBatchNumber();
        $successCount = 0;

        foreach ($pending as $file) {
            if ($this->runSeedFile($file, $batch)) {
                $successCount++;
            } else {
                echo "Seeding failed. Stopping.\n";
                return;
            }
        }

        echo "Seeding completed successfully! {$successCount} seed(s) executed.\n";
    }

    public function refresh() {
        echo "Refreshing seed data...\n";

        // Get all executed seeds
        $stmt = $this->pdo->query("SELECT seed FROM seeds ORDER BY batch DESC, seed DESC");
        $executedSeeds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($executedSeeds)) {
            echo "No seeds to refresh.\n";
            $this->seed();
            return;
        }

        echo "Clearing existing seed data...\n";
        // Note: Individual seed files should handle their own cleanup

        // Clear seeds tracking
        $this->pdo->exec("TRUNCATE TABLE seeds");

        echo "Re-running all seeds...\n";
        $this->seed();
    }

    public function rollback() {
        echo "Rolling back last seed batch...\n";

        $stmt = $this->pdo->query("SELECT MAX(batch) as max_batch FROM seeds");
        $result = $stmt->fetch();

        if (!$result['max_batch']) {
            echo "No seeds to rollback.\n";
            return;
        }

        $maxBatch = $result['max_batch'];

        // Get seeds in the last batch
        $stmt = $this->pdo->prepare("SELECT seed FROM seeds WHERE batch = ? ORDER BY seed DESC");
        $stmt->execute([$maxBatch]);
        $seedsInBatch = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo "Rolling back batch {$maxBatch} (" . count($seedsInBatch) . " seeds)...\n";

        // Remove seed records (note: actual data cleanup should be handled by seed files)
        $stmt = $this->pdo->prepare("DELETE FROM seeds WHERE batch = ?");
        $stmt->execute([$maxBatch]);

        echo "Rollback completed. Note: You may need to manually clean up data created by seeds.\n";
    }

    public function status() {
        echo "Seeding Status:\n";
        echo "===============\n";

        $executed = $this->getExecutedSeeds();
        $files = $this->getSeedFiles();

        foreach ($files as $file) {
            $seed = basename($file);
            $status = in_array($seed, $executed) ? "✅ Executed" : "⏳ Pending";
            echo "{$status}: {$seed}\n";
        }

        echo "\nTotal: " . count($executed) . "/" . count($files) . " seeds executed\n";

        // Show batch information
        $stmt = $this->pdo->query("
            SELECT batch, COUNT(*) as count, MAX(executed_at) as last_executed
            FROM seeds
            GROUP BY batch
            ORDER BY batch DESC
        ");
        $batches = $stmt->fetchAll();

        if (!empty($batches)) {
            echo "\nBatch History:\n";
            foreach ($batches as $batch) {
                echo "Batch {$batch['batch']}: {$batch['count']} seed(s) - " .
                     date('Y-m-d H:i:s', strtotime($batch['last_executed'])) . "\n";
            }
        }
    }

    public function runSpecificSeeder($className) {
        echo "Running specific seeder: {$className}\n";

        // Map class names to seed files
        $classMap = [
            'UsersSeeder' => '001_seed_users.sql',
            'ProjectsSeeder' => '002_seed_projects.sql',
            'CollectionsSeeder' => '003_seed_collections.sql',
            'EndpointsSeeder' => '004_seed_endpoints.sql',
            'EnvironmentsSeeder' => '005_seed_environments.sql',
            'FlowsSeeder' => '006_seed_flows.sql',
            'ProjectMembersSeeder' => '007_seed_project_members.sql',
            'TestFlowsSeeder' => '008_seed_test_flows.sql',
            'McpClientTokensSeeder' => '009_seed_mcp_client_tokens.sql',
        ];

        if (!isset($classMap[$className])) {
            echo "Unknown seeder: {$className}\n";
            echo "Available seeders: " . implode(', ', array_keys($classMap)) . "\n";
            return;
        }

        $seedFile = $this->seedsPath . '/' . $classMap[$className];

        if (!file_exists($seedFile)) {
            echo "Seed file not found: {$seedFile}\n";
            return;
        }

        $executed = $this->getExecutedSeeds();
        $seed = basename($seedFile);

        if (in_array($seed, $executed)) {
            echo "Seed already executed: {$seed}\n";
            echo "Use --refresh to re-run all seeds\n";
            return;
        }

        if ($this->runSeedFile($seedFile)) {
            echo "Seeder completed successfully!\n";
        } else {
            echo "Seeder failed!\n";
        }
    }
}

// CLI interface
if (php_sapi_name() === 'cli') {
    $command = $argv[1] ?? 'seed';

    $seeder = new Seeder();

    switch ($command) {
        case 'seed':
            $seeder->seed();
            break;
        case '--refresh':
            $seeder->refresh();
            break;
        case '--rollback':
            $seeder->rollback();
            break;
        case '--status':
            $seeder->status();
            break;
        case '--class':
            $className = $argv[2] ?? null;
            if (!$className) {
                echo "Error: --class requires a seeder class name\n";
                echo "Example: php seed.php --class=UsersSeeder\n";
                exit(1);
            }
            $seeder->runSpecificSeeder($className);
            break;
        default:
            echo "Unknown command: {$command}\n";
            echo "Available commands: seed, --refresh, --rollback, --status, --class=ClassName\n";
            break;
    }
}