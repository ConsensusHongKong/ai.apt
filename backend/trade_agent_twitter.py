import json
import os
import time
import requests
from urllib.parse import urlencode
from threading import Timer
from trade_agents import trade_agents
import schedule
from LLM import x_llm_client,x_model

REDIRECT_URI = os.getenv('REDIRECT_URI', 'http://127.0.0.1:8090/callback')

AUTHORIZATION_BASE_URL = "https://twitter.com/i/oauth2/authorize"
TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
TWEET_URL = "https://api.twitter.com/2/tweets"

user_tokens = {}

def get_authorization_url(CLIENT_ID):
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "tweet.read users.read tweet.write",
        "state": "random_string",
        "code_challenge": "challenge",
        "code_challenge_method": "plain"
    }
    return f"{AUTHORIZATION_BASE_URL}?{urlencode(params)}"


def get_tokens_from_code(authorization_code, CLIENT_ID, CLIENT_SECRET):
    data = {
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "code": authorization_code,
        "code_verifier": "challenge"
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(TOKEN_URL, data=data, headers=headers, auth=(CLIENT_ID, CLIENT_SECRET))

    if response.status_code == 200:
        print(response.json())
        return response.json()
    else:
        print(f"get Access Token failed: {response.status_code}, {response.text}")
        return None


def refresh_access_token(user_id):
    global user_tokens

    print('refresh_access_token start')

    if user_id not in user_tokens:
        print(f"user {user_id} not exist")
        return

    refresh_token = user_tokens[user_id]["refresh_token"]
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(TOKEN_URL, data=data, headers=headers, auth=(CLIENT_ID, CLIENT_SECRET))

    if response.status_code == 200:
        tokens = response.json()
        user_tokens[user_id]["access_token"] = tokens["access_token"]
        if "refresh_token" in tokens:
            user_tokens[user_id]["refresh_token"] = tokens["refresh_token"]
        print(f"user {user_id}  Access Token refreshed")
    else:
        print(f"user Access Token refresh failed: {response.status_code}, {response.text}")


def do_refresh_access_token_schedule():
    print('do_refresh_access_token_schedule')
    for agent in trade_agents:
        if 'CLIENT_ID' in agent:
            agent_id = agent['id']
            if(agent_id in user_tokens):
                refresh_access_token(agent_id)


def start_refresh_access_token_schedule():
    print('refresh_access_token_schedule start')
    # timer refresh Access Token
    schedule.every(3600).seconds.do(do_refresh_access_token_schedule)
    while True:
        schedule.run_pending()
        time.sleep(1)


def post_tweet(user_id, tweet_text):
    global user_tokens

    if user_id not in user_tokens:
        print(f"user {user_id} not exist")
        return

    access_token = user_tokens[user_id]["access_token"]
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {"text": tweet_text}
    response = requests.post(TWEET_URL, headers=headers, json=payload)

    if response.status_code == 201:
        print(f"user {user_id} post twitter sucess: {tweet_text}")
    else:
        print(f"user post twitter failed: {response.status_code}, {response.text}")


def start_twitter_grant():
    # step 1: get Authorization URL
    print("init trade_agents X access_token")

    for agent in trade_agents:
        if 'CLIENT_ID' in agent:
            print("access URL for ：" + agent['name'])
            CLIENT_ID = agent['CLIENT_ID']
            CLIENT_SECRET = agent['CLIENT_SECRET']
            agent_id = agent['id']
            print(get_authorization_url(CLIENT_ID))
            # st3p 2: get Authorization Code
            authorization_code = input("input Authorization Code: ").strip()
            tokens = get_tokens_from_code(authorization_code, CLIENT_ID, CLIENT_SECRET)

            if tokens:
                user_id = agent_id
                user_tokens[user_id] = {
                    "access_token": tokens["access_token"],
                    "refresh_token": tokens.get("refresh_token", '')
                }
                print(f" {user_id} grant success")




def do_post_tweet_schedule():
    print('do_post_tweet_schedule')
    for agent in trade_agents:
        if 'CLIENT_ID' in agent:
            agent_id = agent['id']
            if(agent_id in user_tokens):
                try:
                    response = x_llm_client.chat_completions.create(
                        model=x_model,
                        messages=[{
                            "role": "user",
                            "content": agent['twitterPrompt'],
                        }],
                        stream=True
                    )
                    ai_message = ""
                    for chunk in response:
                        if chunk.choices[0].delta.content:
                            ai_message += chunk.choices[0].delta.content
                            print(ai_message)

                    post_tweet(agent_id, ai_message)
                except Exception as e:
                    print(f"Error during operation: {e}")


def start_post_tweet_schedule():
    print('do_post_tweet_schedule start')
    schedule.every(1).hours.do(do_post_tweet_schedule)
    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    start_twitter_grant()