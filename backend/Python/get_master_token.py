import sys
import gkeepapi
from dotenv import load_dotenv
import os

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

email = os.getenv('KEEP_EMAIL') or os.getenv('HOST_EMAIL')
password = os.getenv('KEEP_PASSWORD') or os.getenv('HOST_PASSWORD')

if not email or not password:
    print("❌ Error: KEEP_EMAIL and KEEP_PASSWORD must be set in .env")
    sys.exit(1)

print(f"🔐 Attempting to login with: {email}")
print("⏳ This may take a moment...")

try:
    keep = gkeepapi.Keep()
    keep.login(email, password)
    
    # Get the master token
    master_token = keep.getMasterToken()
    
    print("\n✅ SUCCESS! Login successful.")
    print("\n📋 Copy this line and add it to your backend/.env file:")
    print(f"\nKEEP_MASTER_TOKEN={master_token}")
    print("\n💡 Once you add this, the script will use the master token instead of password.")
    print("   This is more reliable and won't trigger Google's security blocks as often.")
    
except gkeepapi.exception.LoginException as e:
    error_str = str(e)
    print(f"\n❌ Login failed: {error_str}")
    
    if 'NeedsBrowser' in error_str:
        print("\n🔓 Action Required:")
        print("   1. Go to: https://accounts.google.com/DisplayUnlockCaptcha")
        print("   2. Click 'Continue'")
        print("   3. Run this script again within 10 minutes")
    elif 'BadAuthentication' in error_str:
        print("\n🔑 Check your credentials:")
        print("   - Ensure KEEP_EMAIL is correct")
        print("   - Ensure KEEP_PASSWORD is a 16-character App Password (not your regular password)")
        print("   - Ensure 2-Step Verification is enabled on your Google account")
    
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Unexpected error: {str(e)}")
    sys.exit(1)
