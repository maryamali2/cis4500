import requests

url = "https://api.yelp.com/v3/categories?locale=en_US"

headers = {
    "accept": "application/json",
    "Authorization": "-3m06UC4k-vFlR7ZXosa6kUMtoH5FPh-hltHHfLgGBAIllqKZHKjyMk-Spk5bWmum0yPo3rfLwja2UQQqQEBchRPi94JbqrJp2K7e1qw-Pi7yFRVYSQ2TG92dWEmZ3Yx"
}

response = requests.get(url, headers=headers)