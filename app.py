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

# Load models for diet, exercise, mental health, and the default intents model
diet_model = load_model('diet_intents_model.h5')
exercise_model = load_model('exercise_intents_model.h5')
mental_health_model = load_model('mental_health_intents_model.h5')
default_model = load_model('intents_model.h5')  # Default model

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# Clean up sentence
def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

# Create bag of words
def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)  
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

# Predict class of intent
def predict_class(sentence, model, words, classes):
    p = bow(sentence, words)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

# Get response from intent
def get_response(intents_list, intents):
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
    mode = request.form.get('mode', 'default')  # Default to 'default' if no mode specified

    # Select the model based on mode
    if mode == 'diet':
        model = diet_model
        words = pickle.load(open('diet_intents_words.pkl', 'rb'))
        classes = pickle.load(open('diet_intents_classes.pkl', 'rb'))
        intents = json.loads(open('diet_intents.json').read())  # Load the diet intents
    elif mode == 'exercise':
        model = exercise_model
        words = pickle.load(open('exercise_intents_words.pkl', 'rb'))
        classes = pickle.load(open('exercise_intents_classes.pkl', 'rb'))
        intents = json.loads(open('exercise_intents.json').read())  # Load the exercise intents
    elif mode == 'mental_health':
        model = mental_health_model
        words = pickle.load(open('mental_health_intents_words.pkl', 'rb'))
        classes = pickle.load(open('mental_health_intents_classes.pkl', 'rb'))
        intents = json.loads(open('mental_health_intents.json').read())  # Load the mental health intents
    else:
        model = default_model  # Default model if mode is unknown or not selected
        words = pickle.load(open('intents_words.pkl', 'rb'))
        classes = pickle.load(open('intents_classes.pkl', 'rb'))
        intents = json.loads(open('intents.json').read())  # Load the default intents

    # Process the message
    intents_list = predict_class(user_message, model, words, classes)
    response = get_response(intents_list, intents)

    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
