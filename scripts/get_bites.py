import requests
import json

data = {'hxlData' : [['organisation','reached'],['#org','#reached'],['BRC',20],['ARC',30]]}


r = requests.post('http://127.0.0.1:3000/charts', json=data)
#r = requests.post('http://httpbin.org/post', json=data)

print(r.status_code)

print(r.json())


r = requests.post('http://127.0.0.1:3000/maps', json=data)
#r = requests.post('http://httpbin.org/post', json=data)

print(r.status_code)

print(r.json())


r = requests.post('http://127.0.0.1:3000/text', json=data)
#r = requests.post('http://httpbin.org/post', json=data)

print(r.status_code)

print(r.json())