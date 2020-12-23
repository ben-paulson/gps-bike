from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory
import config
import json
import os.path

app = Flask(__name__)
cfg = config.get_config('static/config.js')
app.secret_key = cfg['secret_key']
new_points = []

def verify_user(usr, pwd):
    """Verifies that the username and password are correct
    Arguments:
        usr (str): The username
        pwd (str): The password
    Returns:
        bool: True if user/pass is correct, False otherwise
    """
    if cfg['username'] == usr and cfg['password'] == pwd:
        return True
    return False

def is_logged_in():
    """Checks if the user is logged in or not.
    Returns:
        bool: True if logged in, False if not
    """
    return 'verified' in session and session['verified']

@app.route('/')
def map():
    """Main page, displays the map if logged in.
    """
    if not is_logged_in():
        return redirect(url_for('login'))
    return render_template('map.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Redirects to this page if user is not logged in.
    """
    if request.method == "POST":
        if verify_user(request.form['user'], request.form['pass']):
             session['verified'] = True
             return redirect(url_for("map"))
        msg = "Could not authenticate. Please try again."
        return render_template("login.html", message=msg)
    else:
        return render_template("login.html", message="")

@app.route('/gpsupdate', methods=['GET', 'POST'])
def update():
    """New position data is sent via a POST request by the GPS.
    The server GETs the new data every xxxx milliseconds
    and updates the map with the new data.
    """
    global new_points
    if request.method == 'POST':
        point = request.get_json()
        new_points.append(point)
        # Save new point to JSON file
        path = 'static/data.json'
        points = {}
        with open(path) as data_file:
            points = json.load(data_file)
        points['points'].append(point)
        with open(path, 'w') as data_file:
            json.dump(points, data_file, indent=2)
        return "OK"
    else:
        # Clear new points (they have now been read) by returning them
        temp = {"new_points": new_points}
        new_points = []
        return temp

if __name__ == '__main__':
    app.run(debug=True)
