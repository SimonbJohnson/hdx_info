#########################################
### create search index for browsing site
#########################################

# improvements to make
# don't allow country tags to be secondary tag of another country

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
	exclusionList = ['WFP - World Food Programme','World Bank Group','Food and Agriculture Organization (FAO)']
	if package['hxl']==1 and package['org'] not in exclusionList:
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

def saveSubTopIndex(primaryTag,subIndex):
	directory = '../indexes/'+primaryTag
	if not os.path.exists(directory):
		os.makedirs(directory)
	with open(directory+'/index.json', 'w') as file:
		json.dump(subIndex, file)

def splitIndex(index):
	mainIndex = {}
	mainIndexDict = {}
	for primaryTag in index:
		count = 0
		if primaryTag!='hxl':
			for secondaryTag in index[primaryTag]:
				if primaryTag not in mainIndex:
						mainIndex[primaryTag] = {'tags':[],'count':0,'files':[]};
						mainIndexDict[primaryTag] = []
				if secondaryTag not in mainIndex[primaryTag]['tags'] and secondaryTag!='hxl':
					mainIndex[primaryTag]['tags'].append({'tag':secondaryTag,'count':len(index[primaryTag][secondaryTag])})
					for file in index[primaryTag][secondaryTag]:
						if file['p'] not in mainIndexDict[primaryTag]:
							mainIndex[primaryTag]['count'] = mainIndex[primaryTag]['count'] + 1
							mainIndex[primaryTag]['files'].append(file)
							mainIndexDict[primaryTag].append(file['p'])
				saveSubIndex(primaryTag,secondaryTag,index[primaryTag][secondaryTag]);
				saveSubTopIndex(primaryTag,mainIndex[primaryTag]);
			del mainIndex[primaryTag]['files']
	with open('../index.json', 'w') as file:
		json.dump(mainIndex, file)


print 'Loading file'
with open(packageFile) as json_file:
	packages = json.load(json_file)
	print 'Processing Packages'
	index = processPackages(packages)
	splitIndex(index)

