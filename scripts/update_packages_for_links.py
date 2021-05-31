# add filename attribute to resources from link

import json

def checkExists(filePath):
	try:
		with open(filePath) as json_file:
			data = json.load(json_file)
		return True
	except:
		return False

def checkPackage(package):
	if package['hxl']==1:
		packageID = package['id']
		filePath = '../data/packages/'+packageID+'.json' 
		exists = checkExists(filePath)
		if exists:
			with open(filePath) as json_file:
				data = json.load(json_file)
				count = 0
				for resource in package['resources']:
					data['link'] = resource['link']
			filePath = '../data/packages/'+package['id'] + '_modified.json'

			with open(filePath, 'w') as file:
				json.dump(package, file)


def processPackages(packages):
	count = 0
	for package in packages:
		print(count)
		checkPackage(package)
		count = count+1

packageFile = 'hdxDataScrape.json'
print 'Loading file'
with open(packageFile) as json_file:
	packages = json.load(json_file)
	print 'Processing Packages'
	processPackages(packages)