import json
import re


if __name__ == '__main__':
    # Transform mainfest into a testing manifest
    with open('testextension/manifest.json') as data_file:
        data = json.load(data_file)
        data.update({
            # Enable the sending of messages from the web page to the extension
            'externally_connectable': {
                'matches': ['*://localhost:*/*']
            },
            # Only way to open extension programatically is by sending key inputs
            'commands': {
                '_execute_browser_action': {
                    'suggested_key': {
                        'default': 'Alt+B'
                    }
                }
            },
            # Allow testing_background.js to eval arbitrary functions passed by extension_helper.js
            'content_security_policy': 'script-src \'self\' \'unsafe-eval\'; object-src \'self\'',
        })

        # Inject a background script for the extension to listen to messages
        data['background']['scripts'] += [
            'js/jquery-1.11.2.min.js',
            'js/testing_background.js',
        ]

        # Inject content script to pass extension id to web page
        data['content_scripts'].append({
            'matches': ['*://localhost:*/*'],
            'js': ['js/testing_content.js'],
        })

    with open('testextension/manifest.json', 'w') as outfile:
        s = json.dumps(data, indent=4)

        # json output still has trailing whitespace, remove
        s = re.sub('[ ]+\n', '\n', s)

        outfile.write(s)
