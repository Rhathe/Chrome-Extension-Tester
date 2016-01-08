# test chrome extension
extension-test:
	bash `pwd`/scripts/run-tests.sh "" $(type)

setup:
	sudo npm install
	node_modules/protractor/bin/webdriver-manager update

