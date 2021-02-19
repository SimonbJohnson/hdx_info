import ckanapi, json
import math

CKAN_URL = "https://data.humdata.org"
"""Base URL for the CKAN instance."""


def find_datasets(start, rows):
    """Return a page of HXL datasets."""
    return ckan.action.package_search(start=start, rows=rows)

# Open a connection to HDX
ckan = ckanapi.RemoteCKAN(CKAN_URL)

result = find_datasets(0, 0)
result_total_count = result["count"]
numOfFiles =  result["count"]
#loops = int(math.ceil(numOfFiles/1000))
output = []
loops = 20
j=0
for i in range(0, loops):
    print i
    result = find_datasets(1000*i, 1000)
    packages = result["results"]
    for package in packages:
        if j<3:
            print(package)
            j=j+1
        item = {}
        item['id'] = package['id']
        item['title'] = package['title']
        item['downloads'] = package['total_res_downloads']
        item['resources'] = []
        item['tags'] = []
        item['hxl'] = 0
        for tag in package['tags']:
            item['tags'].append(tag['name'].lower())
            if tag['name'].lower() == 'hxl':
                item['hxl'] = 1
        countries =  json.loads(package['solr_additions'])
        for tag in countries['countries']:
            item['tags'].append(tag)
        for resource in package['resources']:
            item['resources'].append({'link':resource['download_url'],'update_date':resource['revision_last_updated']})
        item['org'] = package['organization']['title']
        output.append(item)

with open('hdxDataScrape.json', 'w') as file:
    json.dump(output, file)