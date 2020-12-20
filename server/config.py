import json

def get_config(path):
    with open(path) as cf:
        f = cf.read()
        data = f[f.find("{"): f.rfind("}") + 1]
        print(data)
        return json.loads(data)
