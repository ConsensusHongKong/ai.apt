from openai import OpenAI
import os;

api_key = os.getenv('API_KEY')
print(api_key)
base_url = os.getenv('BASE_URL', 'https://api.novita.ai/v3/openai')
model = os.getenv('MODEL', 'deepseek/deepseek-r1')  # default deepseek/deepseek-r1
client = OpenAI(api_key=api_key, base_url=base_url)


x_api_key = os.getenv('X_API_KEY')
x_llm_base_url = os.getenv('X_BASE_URL', 'https://openrouter.ai/api/v1')
x_model = os.getenv('X_MODEL', 'x-ai/grok-2-1212')
x_llm_client = OpenAI(api_key=x_api_key, base_url=x_llm_base_url)
