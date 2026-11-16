#!/usr/bin/env python3
"""Build a public-only upload directory. Never copy the repository wholesale."""
import argparse
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
FILES = ('.htaccess', 'index.html', 'robots.txt', 'sitemap.xml')
DIRECTORIES = ('css', 'fonts', 'img', 'js', 'media')


def stage(destination):
    destination = Path(destination).resolve()
    if destination == ROOT or ROOT in destination.parents or destination in ROOT.parents:
        raise ValueError('Staging directory must be outside the checkout')
    if destination.exists():
        raise ValueError('Use a new, empty staging directory')
    destination.mkdir(parents=True)
    for name in FILES:
        shutil.copy2(ROOT / name, destination / name)
    for name in DIRECTORIES:
        shutil.copytree(ROOT / name, destination / name)
    print(f'Staged public files in {destination}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination')
    stage(parser.parse_args().destination)
