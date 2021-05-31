#removing bites that plot indicator+num against a number. In this case chart007 with indicator num as first variable

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
		filePath = '../data/packages/'+packageID+'_modified.json' 
		exists = checkExists(filePath)
		if exists:
			with open(filePath) as json_file:
				data = json.load(json_file)
				count = 0
				for resource in package['resources']:
				#	data['link'] = resource['link']
					if resource['bites']['charts']:
						for bite in resource['bites']['charts']:
							print(bite['id'])

			filePath = '../data/packages/'+package['id'] + '_modified2.json'

			#with open(filePath, 'w') as file:
			#	json.dump(package, file)


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