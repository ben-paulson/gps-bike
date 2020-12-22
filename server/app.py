from flask import Flask, render_template, request
import config
import json

app = Flask(__name__)
app.secret_key = config.get_config('static/config.js')['secret_key']
new_points = []

@app.route('/')
def map():
    return render_template('map.html')

@app.route('/gpsupdate', methods=['GET', 'POST'])
def update():
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
