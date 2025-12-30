import sys
import os
import json
import gkeepapi
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def get_keep():
    email = os.getenv('KEEP_EMAIL') or os.getenv('HOST_EMAIL')
    password = os.getenv('KEEP_PASSWORD') or os.getenv('HOST_PASSWORD')
    master_token = os.getenv('KEEP_MASTER_TOKEN')

    if not email:
        print(json.dumps({"error": "Missing KEEP_EMAIL in .env"}))
        sys.exit(1)
    
    if not master_token and not password:
        print(json.dumps({"error": "Missing KEEP_MASTER_TOKEN or KEEP_PASSWORD in .env. Run 'python Python/get_master_token.py' to generate a master token."}))
        sys.exit(1)

    keep = gkeepapi.Keep()
    try:
        if master_token:
            # Use master token - most reliable method
            keep.authenticate(email, master_token)
        else:
            # Fallback to password-based login
            keep.login(email, password)
        return keep
    except gkeepapi.exception.LoginException as e:
        error_str = str(e)
        if 'NeedsBrowser' in error_str:
            print(json.dumps({"error": "Google blocked the login. Please go to https://accounts.google.com/DisplayUnlockCaptcha, click 'Continue', and then try again immediately."}))
        elif 'BadAuthentication' in error_str:
             print(json.dumps({"error": "BadAuthentication: Invalid credentials. If using master token, regenerate it by running: python Python/get_master_token.py"}))
        else:
            print(json.dumps({"error": f"Login failed: {error_str}"}))
        sys.exit(1)
    except Exception as e:
        # Ignore the deprecation warning if it comes as an exception
        if 'deprecated' in str(e).lower() and 'authenticate' in str(e).lower():
            return keep
        print(json.dumps({"error": f"System error: {str(e)}"}))
        sys.exit(1)

def list_notes(keep):
    notes = keep.all()
    result = []
    for note in notes:
        # Skip trashed/archived if you want, or include them
        result.append({
            "id": note.id,
            "title": note.title,
            "text": note.text,
            "archived": note.archived,
            "trashed": note.trashed,
            "labels": [l.name for l in note.labels.all()]
        })
    return result

def add_note(keep, title, text):
    note = keep.createNote(title, text)
    keep.sync()
    return {"id": note.id, "title": note.title, "text": note.text}

def update_note(keep, note_id, title=None, text=None):
    note = keep.get(note_id)
    if not note:
        return {"error": f"Note {note_id} not found"}
    if title is not None:
        note.title = title
    if text is not None:
        note.text = text
    keep.sync()
    return {"id": note.id, "title": note.title, "text": note.text}

def archive_note(keep, note_id, archive=True):
    note = keep.get(note_id)
    if not note:
        return {"error": f"Note {note_id} not found"}
    note.archived = archive
    keep.sync()
    return {"id": note.id, "archived": note.archived}

def delete_note(keep, note_id, delete=True):
    note = keep.get(note_id)
    if not note:
        return {"error": f"Note {note_id} not found"}
    note.trashed = delete
    keep.sync()
    return {"id": note.id, "trashed": note.trashed}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No operation specified"}))
        sys.exit(1)

    op = sys.argv[1]
    keep = get_keep()

    try:
        if op == "list":
            print(json.dumps(list_notes(keep)))
        elif op == "add":
            params = json.loads(sys.argv[2])
            print(json.dumps(add_note(keep, params.get('title', ''), params.get('text', ''))))
        elif op == "update":
            params = json.loads(sys.argv[2])
            print(json.dumps(update_note(keep, params.get('id'), params.get('title'), params.get('text'))))
        elif op == "archive":
            params = json.loads(sys.argv[2])
            print(json.dumps(archive_note(keep, params.get('id'), params.get('archive', True))))
        elif op == "delete":
            params = json.loads(sys.argv[2])
            print(json.dumps(delete_note(keep, params.get('id'), params.get('delete', True))))
        else:
            print(json.dumps({"error": f"Unknown operation: {op}"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
