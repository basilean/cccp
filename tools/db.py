# T2JDB
# Andres Basile
# GNU / GPL v3
from os import walk
from json import dump
from argparse import ArgumentParser
from tomllib import load

parser = ArgumentParser(
    description = 'Toml to Json DB Generator.'
)
parser.add_argument(
    '-d', '--directory',
    type = str,
    default = '.',
    help = 'Directory Toml database. (default: %(default)s)'
)
parser.add_argument(
    '-o', '--output',
    type = str,
    default = 'db.json',
    help = 'Output Json database file. (default: %(default)s)'
)
arg = parser.parse_args()

dbdir = arg.directory
dbfile = arg.output
db = {}
for folder, _, files in walk(dbdir):
    table = folder.split('/')[-1]
    if len(table) < 2:
        continue
    db[table] = {}
    for archive in files:
        path = "{0}/{1}".format(folder, archive)
        if (archive[-5:] != ".toml"):
            continue
        try:
            with open(path, "rb") as fhand:
                data = load(fhand)
        except Exception as err:
            print("ERROR opening file '" + path + "':", err)
        else:
            row = archive[:-5]
            db[table][row] = data

try:
	with open(dbfile, "w") as fhand:
		dump(db, fhand, indent=2)
except Exception as err:
    print("ERROR saving file '" + dbfile + "':", err)
else:
    print("Database saved at:", dbfile)
