#!/usr/bin/env python3
"""Build a public-only upload directory. Never copy the repository wholesale."""
import argparse
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
AUDIT = 'clients/audits'
SPORTED_ASSETS = f'{AUDIT}/sported-assets'
FILES = (
    '.htaccess', 'index.html', '404.html', 'robots.txt', 'sitemap.xml',
    f'{AUDIT}/sported.html',
    f'{SPORTED_ASSETS}/sported-live-homepage-hero.png',
    *(f'{SPORTED_ASSETS}/{environment}/{page}-{device}.json'
      for environment in ('live', 'local')
      for page in ('home', 'programmes', 'support')
      for device in ('desktop', 'mobile')),
)
DIRECTORIES = ('css', 'fonts', 'img', 'js', 'media')


def stage(destination):
    destination = Path(destination).resolve()
    if destination == ROOT or ROOT in destination.parents or destination in ROOT.parents:
        raise ValueError('Staging directory must be outside the checkout')
    if destination.exists():
        raise ValueError('Use a new, empty staging directory')
    # Inspect the complete source tree before creating any upload artifact. Links
    # are never public inputs, even when their current target is inside the repo.
    for name in FILES:
        source = ROOT / name
        for path in (Path(name), *Path(name).parents):
            if (ROOT / path).is_symlink():
                raise ValueError(f'Symbolic links are not public assets: {path}')
        if not source.is_file():
            raise ValueError(f'Public asset is not a regular file: {name}')
    for name in DIRECTORIES:
        source = ROOT / name
        paths = [source]
        if source.is_dir() and not source.is_symlink():
            paths.extend(source.rglob('*'))
        for path in paths:
            if path.is_symlink():
                raise ValueError(f'Symbolic links are not public assets: {path.relative_to(ROOT)}')
            if not path.is_file() and not path.is_dir():
                raise ValueError(f'Public asset is not a regular file or directory: {path.relative_to(ROOT)}')
    destination.mkdir(parents=True)
    for name in FILES:
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / name, target)
    for name in DIRECTORIES:
        shutil.copytree(ROOT / name, destination / name)
    print(f'Staged public files in {destination}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination')
    stage(parser.parse_args().destination)
