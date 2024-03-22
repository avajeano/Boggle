from flask import Flask, render_template, request, session, jsonify
from boggle import Boggle

app = Flask(__name__)

#key to run session
app.config["SECRET_KEY"] = "abc123"

#class from boggle.py
boggle_game = Boggle()

@app.route('/')
def index():
    """Show board."""
    board = boggle_game.make_board()

    #adding the board to session 
    session['board'] = board

    #resets the score to 0 for each new game 
    session['score'] = 0

    session['games_played'] = session.get('games_played', 0) + 1

    return render_template("index.html", board=board, games_played=session['games_played'])

@app.route('/check-word', methods=['POST'])
def check_word():
    """Check if the word is in the dictionary."""

    word = request.json.get("word")

    #retrieves the current board from the session
    board = session["board"]
    response = boggle_game.check_valid_word(board,word)

    # start score at 0 if it's a new session
    if 'score' not in session:
        session['score'] = 0

    # update score if the word is valid
    if response == "ok":
        session['score'] += len(word)

    if 'high_score' not in session or session['score'] > session['high_score']:
        session['high_score'] = session['score']

    #stores the validty of the word 
    return jsonify({'result': response, 'score': session['score'], 'high_score': session.get('high_score', 0)})


