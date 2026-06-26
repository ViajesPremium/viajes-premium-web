package config

import (
	"bufio"
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

var loadDotEnvOnce sync.Once

func loadDotEnvFiles() {
	loadDotEnvOnce.Do(func() {
		cwd, err := os.Getwd()
		if err != nil {
			return
		}

		initialEnv := snapshotInitialEnv()
		root := detectConfigRoot(cwd)
		if root == "" {
			return
		}

		dirs := dotEnvDirs(root, cwd)
		for _, dir := range dirs {
			for _, name := range []string{".env", ".env.local"} {
				loadDotEnvFile(filepath.Join(dir, name), initialEnv)
			}
		}
	})
}

func detectConfigRoot(cwd string) string {
	if root, ok := findGoModuleRoot(cwd); ok {
		return root
	}

	backendDir := filepath.Join(cwd, "backend")
	if fileExists(filepath.Join(backendDir, "go.mod")) {
		return backendDir
	}

	return ""
}

func findGoModuleRoot(start string) (string, bool) {
	dir := start
	for {
		if fileExists(filepath.Join(dir, "go.mod")) {
			return dir, true
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}

	return "", false
}

func dotEnvDirs(root, cwd string) []string {
	rel, err := filepath.Rel(root, cwd)
	if err != nil || strings.HasPrefix(rel, "..") {
		return []string{root}
	}

	dirs := make([]string, 0, 4)
	current := cwd
	for {
		dirs = append(dirs, current)
		if current == root {
			break
		}
		parent := filepath.Dir(current)
		if parent == current {
			break
		}
		current = parent
	}

	for left, right := 0, len(dirs)-1; left < right; left, right = left+1, right-1 {
		dirs[left], dirs[right] = dirs[right], dirs[left]
	}

	return dirs
}

func loadDotEnvFile(path string, protected map[string]struct{}) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return
	}

	scanner := bufio.NewScanner(bytes.NewReader(raw))
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		if strings.HasPrefix(line, "export ") {
			line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
		}

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}

		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}

		if _, exists := protected[key]; exists {
			continue
		}

		value = trimDotEnvValue(value)
		_ = os.Setenv(key, value)
	}
}

func trimDotEnvValue(value string) string {
	value = strings.TrimSpace(value)
	if len(value) >= 2 {
		first := value[0]
		last := value[len(value)-1]
		if (first == '"' && last == '"') || (first == '\'' && last == '\'') {
			value = value[1 : len(value)-1]
		}
	}

	return strings.ReplaceAll(value, `\$`, "$")
}

func snapshotInitialEnv() map[string]struct{} {
	env := make(map[string]struct{})
	for _, kv := range os.Environ() {
		key, _, ok := strings.Cut(kv, "=")
		if !ok || key == "" {
			continue
		}
		env[key] = struct{}{}
	}
	return env
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}
