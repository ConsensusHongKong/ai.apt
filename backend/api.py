
import os;
from flask import Flask, request, jsonify, Response
from openai import OpenAI
import json,time
from flask import copy_current_request_context
from trade_agents import trade_agents, agents_by_id,trading_strategy_model
from trade_agent_twitter import start_twitter_grant,start_refresh_access_token_schedule,start_post_tweet_schedule
import news
from news import start_get_crypto_prices_schedule,start_get_crypto_news_schedule
import threading
from LLM import client,model
from news import get_crypto_prices

app = Flask(__name__)

chat_sessions = {}

@app.route('/chat', methods=['POST'])
def chatAgent():

    data = request.json
    session_id = data.get('session_id')
    user_message = data.get('message')
    agent_id = data.get('agent_id')

    if agent_id not in agents_by_id:
        return jsonify({'error': 'agent_id not exists'}), 400

    if not session_id or not user_message or not agent_id:
        return jsonify({'error': 'session_id and message is required'}), 400

    newsPrompt = ''
    if session_id not in chat_sessions:
        if news.last_crypto_prices != '':
            newsPrompt += 'Here are the US dollar prices for popular currencies <prices>' + news.last_crypto_prices + '</prices>\n'
        if news.last_crypto_news != '':
            newsPrompt += 'This is a brief introduction to some recent news about cryptocurrency <news>' + news.last_crypto_news + '</news>\n'

        chatPrompt = agents_by_id.get(agent_id).get('chatPrompt').replace("{{news}}", newsPrompt)
        print('chatPrompt:' + chatPrompt)
        chat_sessions[session_id] = [{'role' : 'system', 'content' : chatPrompt}]

    chat_sessions[session_id].append({'role': 'user', 'content': user_message})

    @copy_current_request_context
    def generate():
        try:
            response = client.chat.completions.create(
                model=model,
                messages=chat_sessions[session_id],
                stream=True
            )
            ai_message = ""
            for chunk in response:
                if chunk.choices[0].delta.content:
                    ai_message += chunk.choices[0].delta.content
                    # print(ai_message)
                    yield f"data: {json.dumps({'event': 'message', 'data': chunk.choices[0].delta.content})}\n\n"

            chat_sessions[session_id].append({'role': 'assistant', 'content': ai_message})

        except Exception as e:
            yield f"data: {json.dumps({'event': 'error', 'data': str(e)})}\n\n"

        yield f"data: {json.dumps({'event': 'end'})}\n\n"

    return Response(generate(), content_type='text/event-stream')


@app.route('/merkleTradeAgent', methods=['POST'])
def merkleTradeAgent():
    data = request.json
    message = data.get('message')
    agent_id = data.get('agent_id')
    amount = data.get('amount')

    if not message or not agent_id or not amount:
        return jsonify({'error': 'agent_id and message and amount is required'}), 400

    if agent_id not in agents_by_id:
        return jsonify({'error': 'agent_id not exists'}), 400

    print(f"merkleTradeAgent")

    prompt = agents_by_id[agent_id]['tradePrompt']
    prompt = prompt.replace("{{amount}}", str(amount))

    print(prompt)

    response = client.chat.completions.create(
        model="deepseek/deepseek-r1",
        messages=[{
            "role": "system",
            "content": prompt,
        },
        {
            "role": "user",
            "content": message
        }],
        response_format={'type': 'json_object'},
        timeout=60 * 5,
        temperature=0,
        stream=True
    )

    ai_message = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            ai_message += chunk.choices[0].delta.content
            print(ai_message)

    cleaned_data = ai_message.strip("```json\n")
    parsed_json = json.loads(cleaned_data)

    return jsonify({"code": 1, "data" : parsed_json})


@app.route('/realtime', methods=['POST'])
def realtime():
    data = request.json
    agent_id = data.get('agent_id')
    amount = data.get('amount')
    trading_strategy_conversation_id = data.get('trading_strategy_conversation_id', '')

    print(trading_strategy_conversation_id)
    print(amount)

    start_time = time.time()

    @copy_current_request_context
    def generate():
        try:
            conversation_id = trading_strategy_conversation_id
            while True:
                if time.time() - start_time > 3600:
                    break
                try:
                    print('start trading_strategy')
                    trading_strategy = trading_strategy_model(conversation_id, amount)
                    if trading_strategy_conversation_id == '':
                        conversation_id = trading_strategy['conversation_id']

                    print(trading_strategy)
                    yield f"data: {json.dumps({'event': 'message', 'data': {'last_crypto_prices': news.last_crypto_prices}, 'last_crypto_news': news.last_crypto_news, 'trading_strategy_conversation_id': trading_strategy['conversation_id'] ,'trading_strategy': trading_strategy['answer']})}\n\n"
                except Exception as e:
                    print(e)
                time.sleep(8)
        except Exception as e:
            yield f"data: {json.dumps({'event': 'error', 'data': str(e)})}\n\n"

        yield f"data: {json.dumps({'event': 'end'})}\n\n"

    return Response(generate(), content_type='text/event-stream')


@app.route('/callback', methods=['GET'])
def callback():
    return request.args.get("code")


@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    return response


if __name__ == '__main__':

    start_get_crypto_prices_thread = threading.Thread(target=start_get_crypto_prices_schedule, daemon=True)
    start_get_crypto_prices_thread.start()

    start_get_crypto_news_thread = threading.Thread(target=start_get_crypto_news_schedule, daemon=True)
    start_get_crypto_news_thread.start()

    start_twitter_grant_thread = threading.Thread(target=start_twitter_grant, daemon=True)
    start_twitter_grant_thread.start()

    start_refresh_access_token_schedule_thread = threading.Thread(target=start_refresh_access_token_schedule, daemon=True)
    start_refresh_access_token_schedule_thread.start()

    start_post_tweet_thread = threading.Thread(target=start_post_tweet_schedule, daemon=True)
    start_post_tweet_thread.start()


    app.run(host='0.0.0.0', port=8090)
