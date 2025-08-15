# make setup
setup:
	python3 -m venv venv
	venv/bin/pip3 install -r requirements.txt

# make run word=<target> letter=<target>
run:
	venv/bin/python3 app.py -w $(word) -l $(letter)