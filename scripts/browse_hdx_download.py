#########################################
### create search index for browsing site
#########################################

# improvements to make
# don't allow country tags to be secondary tag of another country

import json
import os

packageFile = 'hdxDataScrape.json'

print 'Loading file'
with open(packageFile) as json_file:
	packages = json.load(json_file)
	print packages[0]

