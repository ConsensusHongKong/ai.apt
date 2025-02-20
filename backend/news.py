import requests
import os
import schedule
import time
import json


last_crypto_prices = ''
last_crypto_news = ''

coins = ["bitcoin", "ethereum", "solana", "polkadot", "chainlink", "aptos"]

def get_crypto_prices():
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": ",".join(coins),
        "vs_currencies": "usd"
    }
    response = requests.get(url, params=params)
    data = response.json()
    print(data)
    return data


def do_get_crypto_prices():
    global last_crypto_prices
    data = get_crypto_prices()
    if data != '':
        last_crypto_prices = json.dumps(data)


api_key = os.getenv('CRIPTO_API_KEY')


def get_crypto_news():
    url = "https://cryptopanic.com/api/v1/posts/"
    params = {
        "auth_token": api_key,
        "public": "true",
    }
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            return data["results"]
        else:
            print(f"Error: {response}")
            return None
    except Exception as e:
        print(f"Exception occurred: {e}")
        return None


def do_get_crypto_news():
    global last_crypto_news

    news = get_crypto_news()
    if news:
        news_summary = []
        for i, article in enumerate(news[:10], start=1):
            news_summary.append({
                "index": i,
                "title": article['title'],
                "description": article.get('description', 'No description available'),
                "source": article['source']['title'],
                "published_at": article['published_at'],
                "link": article['url']
            })
        if news_summary:
            last_crypto_news = json.dumps(news_summary)
            print(last_crypto_news)

#
# news = get_crypto_news()
# if news:
#     for i, article in enumerate(news[:5], start=1):
#         print(f"\n{i}. Title: {article['title']}")
#         print(f"   Description: {article.get('description', 'No description available')}")
#         print(f"   Source: {article['source']['title']}")
#         print(f"   Published At: {article['published_at']}")
#         print(f"   Link: {article['url']}")


def start_get_crypto_prices_schedule():
    print('get_crypto_prices_schedule start')
    do_get_crypto_prices()
    schedule.every(60).seconds.do(do_get_crypto_prices)
    while True:
        schedule.run_pending()
        time.sleep(1)


def start_get_crypto_news_schedule():
    print('get_crypto_news_schedule start')
    do_get_crypto_news()
    schedule.every(1).hours.do(do_get_crypto_news)
    while True:
        schedule.run_pending()
        time.sleep(1)