#!/usr/bin/env python3
"""Read-only project and jstack installation diagnostics."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess


def metadata_path(root, relative):
    path = root / relative
    if not path.resolve().is_relative_to(root):
        raise ValueError(f'Metadata path escapes the project: {relative}')
    return path


def read_object(path):
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise ValueError(f'{path.name} must contain a JSON object.')
    return value


def diagnose(root):
    result = {'tools': {name: bool(shutil.which(name)) for name in ['git', 'python3', 'node', 'npm', 'gh']},
              'problems': [], 'workflows': {}, 'unverified': ['agent reload/discovery', 'hook activation', 'SEO runtime dependencies',
                                               'authenticated accounts', 'rendered app and deployment']}
    manifest_path = metadata_path(root, '.agents/jstack/manifest.json')
    manifest_files = {}
    if not manifest_path.is_file():
        result['problems'].append('jstack manifest missing')
    else:
        manifest = read_object(manifest_path)
        if not isinstance(manifest, dict) or manifest.get('schema') != 1 or not isinstance(manifest.get('files'), dict):
            raise ValueError('Invalid jstack manifest: expected schema 1 and a files object.')
        manifest_files = manifest['files']
        result['version'] = manifest.get('version')
        result['managed_paths'] = len(manifest_files)
        for relative, expected in manifest_files.items():
            if not isinstance(expected, dict) or expected.get('kind') not in {'file', 'link'}:
                raise ValueError(f'Invalid manifest entry: {relative}')
            path = root / relative
            if not path.resolve().is_relative_to(root) or Path(relative).is_absolute() or '..' in Path(relative).parts:
                result['problems'].append(f'unsafe managed path: {relative}')
                continue
            if expected['kind'] == 'link':
                good = path.is_symlink() and os.readlink(path) == expected['target'] and path.exists()
            else:
                good = path.is_file() and not path.is_symlink()
                if good:
                    good = (hashlib.sha256(path.read_bytes()).hexdigest() == expected['sha256'] and
                            bool(path.stat().st_mode & 0o111) == expected['executable'])
            if not good:
                result['problems'].append(f'missing or modified: {relative}')
    config = metadata_path(root, '.agents/jstack/project.json')
    result['project_config'] = read_object(config) if config.is_file() else {}
    package = metadata_path(root, 'package.json')
    result['package_scripts'] = read_object(package).get('scripts', {}) if package.is_file() else {}
    if not isinstance(result['package_scripts'], dict):
        raise ValueError('package.json scripts must contain a JSON object.')
    result['lockfiles'] = [name for name in ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'uv.lock', 'poetry.lock', 'Cargo.lock', 'go.sum'] if (root / name).exists()]
    result['seo'] = next((name for name in ['.agents/skills/seo/SKILL.md', '.agents/skills/claude-seo/skills/seo/SKILL.md'] if (root / name).is_file()), None)
    result['impeccable'] = (root / '.agents/skills/impeccable/SKILL.md').is_file()
    result['impeccable_launcher'] = (root / '.agents/skills/impeccable/scripts/impeccable').is_file()
    # Installed skill names come from the manifest, so new releases need no edit here.
    skills = sorted({Path(p).parts[2] for p in manifest_files if p.startswith('.agents/skills/') and p.endswith('/SKILL.md')})
    result['discovery_files'] = {}
    for provider in ['.agents', '.claude', '.cursor', '.gemini', '.opencode']:
        result['discovery_files'][provider] = bool(skills) and all((root / provider / 'skills' / name / 'SKILL.md').is_file() for name in skills)
    for workflow, available in [('audit', bool(result['seo'])),
                                ('edit', result['impeccable'] and result['impeccable_launcher'])]:
        result['workflows'][workflow] = {'instructions': 'available' if available else 'missing',
                                         'runtime': 'unverified'}
    if not all(result['discovery_files'].values()):
        result['problems'].append('one or more provider skill entrypoints missing')
    git = subprocess.run(['git', '-C', str(root), 'status', '--porcelain'], capture_output=True, text=True)
    result['dirty_paths'] = len(git.stdout.splitlines()) if git.returncode == 0 else None
    result['ok'] = not result['problems']
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', default='.')
    args = parser.parse_args()
    try:
        report = diagnose(Path(args.project).expanduser().resolve(strict=True))
        print(json.dumps(report, indent=2))
        raise SystemExit(0 if report['ok'] else 1)
    except (OSError, ValueError, KeyError) as error:
        print(json.dumps({'ok': False, 'error': str(error)}))
        raise SystemExit(1)
