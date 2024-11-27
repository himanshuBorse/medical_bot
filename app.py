from flask import Flask, render_template, request, jsonify
import nltk
import json
import random
import numpy as np
import pickle
from keras.models import load_model
from nltk.stem import WordNetLemmatizer

# Initialize Flask app
app = Flask(__name__)

# Load model and required files
lemmatizer = WordNetLemmatizer()
model = load_model('chatbot_model.h5')
intents = json.loads(open('intents.json').read())
words = pickle.load(open('words.pkl','rb'))
classes = pickle.load(open('classes.pkl','rb'))

# Clean up sentence
def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

# Create bag of words
def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0]*len(words)  
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

# Predict class of intent
def predict_class(sentence):
    p = bow(sentence, words)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

# Get response from intent
def get_response(intents_list):
    if not intents_list:
        return "Sorry, I didn't understand that."

    tag = intents_list[0]['intent']
    for intent in intents['intents']:
        if intent['tag'] == tag:
            return random.choice(intent['responses'])
    return "Sorry, I couldn't find a suitable response."

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/get_response", methods=['POST'])
def chat():
    user_message = request.form['user_message']
    print("User message received:", user_message)  # Debugging line

    if user_message.startswith('Button'):  # If message is from button
        response = f"You clicked {user_message}"
    else:
        # Process normal user message
        intents = predict_class(user_message)
        print("Predicted intents:", intents)  # Debugging line
        response = get_response(intents)

    print("Response to send:", response)  # Debugging line
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
