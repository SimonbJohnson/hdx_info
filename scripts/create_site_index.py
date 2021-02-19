#########################################
### create search index for browsing site
#########################################

import json
import os


packageFile = 'hdxDataScrape.json'

def indexPackage(packageID,filePath,index):
	try:
		with open(filePath) as json_file:
			data = json.load(json_file)
	except:
		return index

	for primaryTag in data['tags']:
		for secondaryTag in data['tags']:
			if primaryTag!=secondaryTag and primaryTag!='HXL' and secondaryTag!='HXL':
				if primaryTag not in index:
					index[primaryTag] = {}
				if secondaryTag not in index[primaryTag]:
					index[primaryTag][secondaryTag] = []

				index[primaryTag][secondaryTag].append({'p':packageID,'d':data['downloads']})
	return index

def checkPackage(package,index):
	if package['hxl']==1:
		packageID = package['id']
		filePath = '../data/packages/'+packageID+'.json' 
		index = indexPackage(packageID,filePath,index)
	return index

def processPackages(packages):
	count = 0
	index = {}
	for package in packages:
		print(count)
		index = checkPackage(package,index)
		count = count+1
	return index

def saveSubIndex(primaryTag,secondaryTag,subIndex):
	directory = '../indexes/'+primaryTag
	if not os.path.exists(directory):
		os.makedirs(directory)
	with open(directory+'/'+secondaryTag+'.json', 'w') as file:
		json.dump(subIndex, file)

def splitIndex(index):
	mainIndex = {}
	for primaryTag in index:
		for secondaryTag in index[primaryTag]:
			if primaryTag not in mainIndex and primaryTag!='HXL':
					mainIndex[primaryTag] = {}
			if secondaryTag not in mainIndex[primaryTag] and secondaryTag!='HXL':
				mainIndex[primaryTag][secondaryTag] = len(index[primaryTag][secondaryTag])
			saveSubIndex(primaryTag,secondaryTag,index[primaryTag][secondaryTag]);
	with open('../index.json', 'w') as file:
		json.dump(mainIndex, file)


print 'Loading file'
with open(packageFile) as json_file:
	packages = json.load(json_file)
	print 'Processing Packages'
	index = processPackages(packages)
	splitIndex(index)

