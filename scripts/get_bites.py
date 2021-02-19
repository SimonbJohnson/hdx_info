import requests
import json
import urllib
import time


def getBites(data):
	data = {'hxlData' :data}

	print data

	r = requests.post('http://127.0.0.1:3000/charts', json=data)

	charts = r.json()


	r = requests.post('http://127.0.0.1:3000/maps', json=data)

	maps = r.json()


	r = requests.post('http://127.0.0.1:3000/text', json=data)

	text = r.json()

	return {'charts':charts,'maps':maps,'text':text}

def checkExists(filePath):
	try:
		with open(filePath) as json_file:
			data = json.load(json_file)
		return True
	except:
		return False

def getData(link):
	print 'calling proxy'
	encodedLink = urllib.quote_plus(link)
	proxyLink = hxlProxyURL + '/data.json?dest=data_edit&filter01=cut&cut-skip-untagged01=on&url=' + encodedLink
	print proxyLink
	try:
		response = urllib.urlopen(proxyLink)
		print 'HXL proxy response'
		data = json.loads(response.read())

	except:
		time.sleep(5)
		return False

	if 'status' in data:
		return False
	else:
		print 'HXL data found'
		bites = getBites(data)
		time.sleep(5)
		return bites

def createPackage(package):
	print 'creating package'
	print package
	for resource in package['resources']:
		bites = getData(resource['link'])
		if bites!=False:
			resource['bites'] = bites
			resource['hxl'] = 1
			print 'Bites generated'
			print bites
		else:
			resource['bites']={}
			resource['hxl'] = 0

	filePath = '../data/packages/'+package['id'] + '.json'

	with open(filePath, 'w') as file:
		json.dump(package, file)

	print 'New package created'


def checkPackage(package):
	if package['hxl']==1:
		packageID = package['id']
		filePath = '../data/packages/'+packageID+'.json' 
		exists = checkExists(filePath)
		if exists == False:
			createPackage(package)
		else:
			print 'Package already exists'
	else:
		print 'Package does not contain HXL'

def processPackages(packages):
	count = 0
	for package in packages:
		print(count)
		checkPackage(package)
		count = count+1
		

packageFile = 'hdxDataScrape.json'
hxlProxyURL = 'https://proxy.hxlstandard.org'
server = 'http://127.0.0.1:3000'

print 'Loading file'
with open(packageFile) as json_file:
	packages = json.load(json_file)
	print 'Processing Packages'
	processPackages(packages)

