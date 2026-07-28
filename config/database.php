<?php
/**
 * Database & Supabase Query Layer - Portal Dusun Jambon
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $pdo = null;

    /**
     * Get PDO PostgreSQL Instance (if extension is loaded)
     */
    public static function getPDO(): ?PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        if (!extension_loaded('pdo_pgsql')) {
            return null;
        }

        try {
            $dbUrl = parse_url(DATABASE_URL);
            if ($dbUrl && isset($dbUrl['host'])) {
                $host = $dbUrl['host'];
                $port = $dbUrl['port'] ?? 5432;
                $user = $dbUrl['user'] ?? 'postgres';
                $pass = $dbUrl['pass'] ?? '';
                $dbname = ltrim($dbUrl['path'] ?? '/postgres', '/');

                $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";
                self::$pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
                return self::$pdo;
            }
        } catch (Exception $e) {
            // Fallback to Supabase PostgREST API
            return null;
        }

        return null;
    }

    /**
     * Query Supabase PostgREST API
     */
    public static function supabaseRest(string $endpoint, string $method = 'GET', ?array $data = null, array $headers = []): array {
        $url = rtrim(SUPABASE_URL, '/') . '/rest/v1/' . ltrim($endpoint, '/');
        
        $ch = curl_init($url);
        
        $defaultHeaders = [
            'apikey: ' . SUPABASE_SECRET_KEY,
            'Authorization: Bearer ' . SUPABASE_SECRET_KEY,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];

        $finalHeaders = array_merge($defaultHeaders, $headers);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $finalHeaders);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        if ($data !== null && in_array(strtoupper($method), ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['status' => 'error', 'code' => 500, 'message' => $error];
        }

        $decoded = json_decode($response, true);
        return [
            'status' => ($httpCode >= 200 && $httpCode < 300) ? 'success' : 'error',
            'code' => $httpCode,
            'data' => $decoded
        ];
    }

    /**
     * Select rows from table with optional query parameters/conditions
     */
    public static function select(string $table, string $select = '*', array $params = [], string $order = ''): array {
        $pdo = self::getPDO();
        if ($pdo) {
            try {
                $sql = "SELECT {$select} FROM {$table}";
                $where = [];
                $execParams = [];
                foreach ($params as $k => $v) {
                    $where[] = "{$k} = ?";
                    $execParams[] = $v;
                }
                if (!empty($where)) {
                    $sql .= " WHERE " . implode(" AND ", $where);
                }
                if (!empty($order)) {
                    $sql .= " ORDER BY {$order}";
                }

                $stmt = $pdo->prepare($sql);
                $stmt->execute($execParams);
                return ['status' => 'success', 'data' => $stmt->fetchAll()];
            } catch (PDOException $e) {
                // fallback to REST
            }
        }

        // Supabase REST fallback
        $queryStr = "select=" . urlencode($select);
        foreach ($params as $k => $v) {
            $queryStr .= "&{$k}=eq." . urlencode($v);
        }
        if (!empty($order)) {
            $parts = explode(' ', trim($order));
            $col = $parts[0];
            $dir = (isset($parts[1]) && strtolower($parts[1]) === 'desc') ? 'desc' : 'asc';
            $queryStr .= "&order={$col}.{$dir}";
        }

        $res = self::supabaseRest("{$table}?{$queryStr}");
        return $res;
    }

    /**
     * Insert row into table
     */
    public static function insert(string $table, array $data): array {
        $pdo = self::getPDO();
        if ($pdo) {
            try {
                $cols = array_keys($data);
                $placeholders = implode(', ', array_fill(0, count($cols), '?'));
                $sql = "INSERT INTO {$table} (" . implode(', ', $cols) . ") VALUES ({$placeholders}) RETURNING *";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_values($data));
                $result = $stmt->fetch();
                return ['status' => 'success', 'data' => $result];
            } catch (PDOException $e) {
                // fallback
            }
        }

        return self::supabaseRest($table, 'POST', $data);
    }

    /**
     * Update row in table by ID or condition
     */
    public static function update(string $table, array $data, array $where): array {
        $pdo = self::getPDO();
        if ($pdo) {
            try {
                $set = [];
                $params = [];
                foreach ($data as $k => $v) {
                    if (is_array($v)) {
                        $set[] = "{$k} = ?::jsonb";
                        $params[] = json_encode($v);
                    } else {
                        $set[] = "{$k} = ?";
                        $params[] = $v;
                    }
                }
                $whereClause = [];
                foreach ($where as $k => $v) {
                    $whereClause[] = "{$k} = ?";
                    $params[] = $v;
                }
                $sql = "UPDATE {$table} SET " . implode(', ', $set) . " WHERE " . implode(' AND ', $whereClause) . " RETURNING *";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                return ['status' => 'success', 'data' => $stmt->fetchAll()];
            } catch (PDOException $e) {
                // fallback
            }
        }

        $queryStr = "";
        foreach ($where as $k => $v) {
            $queryStr .= "&{$k}=eq." . urlencode($v);
        }
        $endpoint = $table . ($queryStr ? '?' . ltrim($queryStr, '&') : '');
        return self::supabaseRest($endpoint, 'PATCH', $data);
    }

    /**
     * Delete row from table
     */
    public static function delete(string $table, array $where): array {
        $pdo = self::getPDO();
        if ($pdo) {
            try {
                $whereClause = [];
                $params = [];
                foreach ($where as $k => $v) {
                    $whereClause[] = "{$k} = ?";
                    $params[] = $v;
                }
                $sql = "DELETE FROM {$table} WHERE " . implode(' AND ', $whereClause);
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                return ['status' => 'success', 'message' => 'Deleted successfully'];
            } catch (PDOException $e) {
                // fallback
            }
        }

        $queryStr = "";
        foreach ($where as $k => $v) {
            $queryStr .= "&{$k}=eq." . urlencode($v);
        }
        $endpoint = $table . ($queryStr ? '?' . ltrim($queryStr, '&') : '');
        return self::supabaseRest($endpoint, 'DELETE');
    }
}
