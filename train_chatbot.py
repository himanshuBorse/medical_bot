import nltk
nltk.download('punkt')
from nltk.stem import WordNetLemmatizer
lemmatizer = WordNetLemmatizer()
import json
import pickle

import numpy as np
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout
from keras.optimizers import SGD
import random
import os

# List of intent files to be processed
intent_files = ['intents.json', 'diet_intents.json', 'mental_health_intents.json', 'exercise_intents.json']

# Function to process each intent file and train a model
def train_model(intent_file):
    words = []
    classes = []
    documents = []
    ignore_words = ['?', '!']

    # Open and load the JSON file
    data_file = open(intent_file).read()
    intents = json.loads(data_file)

    for intent in intents['intents']:
        for pattern in intent['patterns']:
            # Tokenize each word
            w = nltk.word_tokenize(pattern)
            words.extend(w)
            # Add documents in the corpus
            documents.append((w, intent['tag']))

            # Add to our classes list
            if intent['tag'] not in classes:
                classes.append(intent['tag'])

    # Lemmatize and lower each word and remove duplicates
    words = [lemmatizer.lemmatize(w.lower()) for w in words if w not in ignore_words]
    words = sorted(list(set(words)))

    # Sort classes
    classes = sorted(list(set(classes)))

    # Extract base filename without extension (e.g., 'diet_intents' from 'diet_intents.json')
    base_filename = os.path.splitext(os.path.basename(intent_file))[0]

    # Save words and classes to pickle files with proper naming convention
    pickle.dump(words, open(f'{base_filename}_words.pkl', 'wb'))
    pickle.dump(classes, open(f'{base_filename}_classes.pkl', 'wb'))

    # Create training data
    training = []
    output_empty = [0] * len(classes)

    for doc in documents:
        bag = []
        pattern_words = doc[0]
        pattern_words = [lemmatizer.lemmatize(word.lower()) for word in pattern_words]

        # Create our bag of words array with 1, if word match found in current pattern
        for w in words:
            bag.append(1) if w in pattern_words else bag.append(0)

        output_row = list(output_empty)
        output_row[classes.index(doc[1])] = 1
        training.append([bag, output_row])

    # Shuffle and convert to numpy array
    random.shuffle(training)
    training = np.array(training, dtype=object)
    train_x = list(training[:, 0])
    train_y = list(training[:, 1])

    print(f"Training data created for {intent_file}")

    # Create the model
    model = Sequential()
    model.add(Dense(128, input_shape=(len(train_x[0]),), activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(64, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(len(train_y[0]), activation='softmax'))

    # Compile model
    sgd = SGD(learning_rate=0.01, decay=1e-6, momentum=0.9, nesterov=True)
    model.compile(loss='categorical_crossentropy', optimizer=sgd, metrics=['accuracy'])

    # Fit the model and save it
    hist = model.fit(np.array(train_x), np.array(train_y), epochs=100, batch_size=5, verbose=1)

    # Save the model with the respective filename
    model_filename = f"{base_filename}_model.h5"
    model.save(model_filename)

    print(f"Model created and saved as {model_filename}")

# Train models for each intent file
for intent_file in intent_files:
    train_model(intent_file)
