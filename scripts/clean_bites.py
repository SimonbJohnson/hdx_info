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
		filePath = '../data/packages/'+packageID+'.json' 
		exists = checkExists(filePath)
		if exists:
			with open(filePath) as json_file:
				data = json.load(json_file)
				count = 0
				for resource in data['resources']:
				#	data['link'] = resource['link']
					if 'bites' in resource and 'charts' in resource['bites']:
						bitesInclude = []
						for bite in resource['bites']['charts']['bites']:		
							uid = bite['uniqueID']
							fullTag = uid.split('/')[1]
							parts = fullTag.split('+')
							firstPart = parts[0]
							lastPart = parts[len(parts)-1]
							include = True
							if uid[0:9] == 'chart0007' and firstPart == '#indicator' and lastPart == 'num':
								print(uid)
								print('match')
								include = False
							if fullTag == '#activity+appeal+name+type':
								print(uid)
								print('match')
								include = False
							if include == True:
								bitesInclude.append(bite)
						resource['bites']['charts']['bites'] = bitesInclude

			filePath = '../data/packages/'+package['id'] + '_modified2.json'

			with open(filePath, 'w') as file:
				json.dump(data, file)


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