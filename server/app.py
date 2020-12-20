from flask import Flask, render_template
import config

app = Flask(__name__)
app.secret_key = config.get_config('static/config.js')['secret_key']

@app.route('/')
def map():
    return render_template('map.html')

if __name__ == '__main__':
    app.run(debug=True)
